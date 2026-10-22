import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useState, useCallback, useEffect } from 'react';

import {
  fetchCampaigns,
  updateCampaign,
  isApiConfigured,
} from '@/api/shortener';
import { mockCampaigns } from '@/mocks/shortener';
import type { CampaignRow } from '@/types/shortener';
import './CampaignsPage.scss';

const ITEMS_PER_PAGE = 7;

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  campaign: CampaignRow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: CampaignRow) => void;
}

function EditCampaignModal({
  campaign,
  isOpen,
  onClose,
  onSave,
}: EditModalProps) {
  const toast = useToast();
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description);
  const [tags, setTags] = useState(campaign.tags.join(', '));

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Название кампании обязательно',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      return;
    }
    onSave({
      ...campaign,
      name: name.trim(),
      description: description.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    onClose();
    toast({
      title: 'Кампания успешно сохранена',
      status: 'success',
      duration: 4000,
      isClosable: true
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay className="campaigns-modal__overlay" />
      <ModalContent className="campaigns-modal__content">
        <ModalHeader className="campaigns-modal__header">
          Редактировать кампанию
        </ModalHeader>
        <ModalCloseButton className="campaigns-modal__close-btn" />

        <ModalBody className="campaigns-modal__body">
          <FormControl isRequired>
            <FormLabel
              fontSize="13px"
              fontWeight={600}
              color="#52525b"
              mb="6px"
            >
              Название
            </FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название кампании"
              borderRadius="10px"
              fontSize="14px"
              borderColor="#e2e8f0"
              _hover={{ borderColor: '#a6c2de' }}
              _focus={{
                borderColor: '#3b6ea0',
                boxShadow: '0 0 0 1px #3b6ea0',
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel
              fontSize="13px"
              fontWeight={600}
              color="#52525b"
              mb="6px"
            >
              Описание
            </FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание кампании"
              borderRadius="10px"
              fontSize="14px"
              borderColor="#e2e8f0"
              resize="vertical"
              rows={3}
              _hover={{ borderColor: '#a6c2de' }}
              _focus={{
                borderColor: '#3b6ea0',
                boxShadow: '0 0 0 1px #3b6ea0',
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel
              fontSize="13px"
              fontWeight={600}
              color="#52525b"
              mb="6px"
            >
              Теги{' '}
              <Text as="span" fontWeight={400} color="#a1a1aa">
                (через запятую)
              </Text>
            </FormLabel>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="тег1, тег2, тег3"
              borderRadius="10px"
              fontSize="14px"
              borderColor="#e2e8f0"
              _hover={{ borderColor: '#a6c2de' }}
              _focus={{
                borderColor: '#3b6ea0',
                boxShadow: '0 0 0 1px #3b6ea0',
              }}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter className="campaigns-modal__footer">
          <Button
            variant="outline"
            color="#52525b"
            borderColor="#e2e8f0"
            borderRadius="10px"
            fontSize="14px"
            fontWeight={500}
            _hover={{ bg: '#f4f4f5' }}
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            bg="#3b6ea0"
            color="white"
            borderRadius="10px"
            fontSize="14px"
            fontWeight={600}
            _hover={{ bg: '#34608c' }}
            _active={{ bg: '#2d547b' }}
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockCampaigns);
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editTarget, setEditTarget] = useState<CampaignRow | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;
    fetchCampaigns()
      .then((data) => {
        if (!cancelled) setCampaigns(data);
      })
      .catch((err) =>
        toast({
          title: 'Не удалось загрузить кампании',
          description: (err as Error).message,
          status: 'error',
          duration: 4000,
          isClosable: true
        }),
      );
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const allTags = Array.from(new Set(campaigns.flatMap((c) => c.tags))).sort();

  const filtered = campaigns.filter((c) => {
    const q = searchText.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q));
    const matchesTag = !filterTag || c.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters = !!searchText || !!filterTag;
  const resetFilters = () => {
    setSearchText('');
    setFilterTag('');
    setCurrentPage(1);
  };

  const handleFilterChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleEdit = useCallback(
    (campaign: CampaignRow, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditTarget(campaign);
      onOpen();
    },
    [onOpen],
  );

  const handleSave = (updated: CampaignRow) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );

    if (isApiConfigured) {
      updateCampaign(updated.id, {
        name: updated.name,
        description: updated.description,
        tags: updated.tags,
      }).catch((err) =>
        toast({
          title: 'Не удалось сохранить кампанию',
          description: (err as Error).message,
          status: 'error',
          duration: 4000,
          isClosable: true
        }),
      );
    }
  };

  // Pagination
  const paginationPages: (number | '...')[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) paginationPages.push(i);
  } else {
    paginationPages.push(1);
    if (safePage > 3) paginationPages.push('...');
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    )
      paginationPages.push(i);
    if (safePage < totalPages - 2) paginationPages.push('...');
    paginationPages.push(totalPages);
  }

  return (
    <Box className="campaigns-page">
      <Box className="campaigns-page__container">
        <Heading className="campaigns-page__title">Кампании</Heading>
        <Heading className="campaigns-page__subtitle">Список кампаний</Heading>

        {/* Filters */}
        <Flex gap="12px" mb="20px" align="center" flexWrap="wrap">
          <InputGroup maxW="360px" size="md">
            <InputLeftElement>
              <SearchIcon color="#a1a1aa" />
            </InputLeftElement>
            <Input
              value={searchText}
              onChange={handleFilterChange(setSearchText)}
              placeholder="Поиск по названию, описанию, тегу"
              bg="white"
              borderColor="#e2e8f0"
              borderRadius="10px"
              fontSize="14px"
              _hover={{ borderColor: '#a6c2de' }}
              _focus={{
                borderColor: '#3b6ea0',
                boxShadow: '0 0 0 1px #3b6ea0',
              }}
              _placeholder={{ color: '#a1a1aa' }}
            />
          </InputGroup>

          <Select
            maxW="170px"
            bg="white"
            borderColor="#e2e8f0"
            borderRadius="10px"
            fontSize="14px"
            _hover={{ borderColor: '#a6c2de' }}
            value={filterTag}
            onChange={handleFilterChange(setFilterTag)}
          >
            <option value="">Все теги</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              color="#3b6ea0"
              fontSize="14px"
              fontWeight={500}
              _hover={{ bg: '#f0f5fa' }}
              onClick={resetFilters}
            >
              Сбросить фильтры
            </Button>
          )}

          <Box flex={1} />

          <Button
            bg="#3b6ea0"
            color="white"
            fontSize="14px"
            fontWeight={600}
            borderRadius="10px"
            px="20px"
            _hover={{ bg: '#34608c' }}
            _active={{ bg: '#2d547b' }}
            rightIcon={<Text fontSize="18px">+</Text>}
          >
            Создать кампанию
          </Button>
        </Flex>

        {/* Table or empty state */}
        {filtered.length === 0 ? (
          <Box className="campaigns-page__empty-state">
            <Text className="campaigns-page__empty-state-icon">🔍</Text>
            <Text className="campaigns-page__empty-state-title">
              Ничего не найдено
            </Text>
            <Text className="campaigns-page__empty-state-desc">
              Попробуйте изменить параметры поиска или сбросить фильтры.
            </Text>
            <Button
              variant="outline"
              color="#3b6ea0"
              borderColor="#a6c2de"
              borderRadius="10px"
              fontSize="14px"
              fontWeight={500}
              _hover={{ bg: '#f0f5fa' }}
              onClick={resetFilters}
            >
              Сбросить фильтры
            </Button>
          </Box>
        ) : (
          <>
            <Flex align="center" mb="12px">
              <Text fontSize="13px" color="#52525b">
                Найдено:{' '}
                <Text as="span" fontWeight={600} color="#12233f">
                  {filtered.length}
                </Text>{' '}
                кампаний
              </Text>
            </Flex>

            <Box className="campaigns-page__table-card">
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    {[
                      'Название',
                      'Описание',
                      'Теги',
                      'Ссылок',
                      'Переходы',
                      'Создана',
                      'Действия',
                    ].map((label, i) => (
                      <Th
                        key={label}
                        fontSize="12px"
                        color="#52525b"
                        fontWeight={600}
                        textTransform="none"
                        borderColor="#e2e8f0"
                        isNumeric={i === 4}
                      >
                        {label}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {paged.map((campaign) => (
                    <Tr key={campaign.id} _hover={{ bg: '#f8fafc' }}>
                      {/* Название */}
                      <Td
                        fontSize="14px"
                        color="#12233f"
                        borderColor="#f0f0f5"
                        maxW="160px"
                      >
                        <Tooltip
                          label={campaign.description}
                          bg="#1e293b"
                          color="white"
                          fontSize="12px"
                          borderRadius="8px"
                          p="10px 14px"
                          hasArrow
                          isDisabled={!campaign.description}
                        >
                          <Text noOfLines={1} fontWeight={500}>
                            {campaign.name}
                          </Text>
                        </Tooltip>
                      </Td>

                      {/* Описание */}
                      <Td
                        fontSize="13px"
                        color="#52525b"
                        borderColor="#f0f0f5"
                        maxW="220px"
                      >
                        <Text noOfLines={1}>{campaign.description || '—'}</Text>
                      </Td>

                      {/* Теги */}
                      <Td borderColor="#f0f0f5" maxW="180px">
                        {campaign.tags.length === 0 ? (
                          <Text fontSize="13px" color="#a1a1aa">
                            —
                          </Text>
                        ) : (
                          <Flex gap="4px" flexWrap="wrap">
                            {campaign.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} className="campaigns-tag-badge">
                                {tag}
                              </Badge>
                            ))}
                            {campaign.tags.length > 3 && (
                              <Badge className="campaigns-tag-badge campaigns-tag-badge--more">
                                +{campaign.tags.length - 3}
                              </Badge>
                            )}
                          </Flex>
                        )}
                      </Td>

                      {/* Ссылок */}
                      <Td fontSize="14px" color="#12233f" borderColor="#f0f0f5">
                        {campaign.linksCount}
                      </Td>

                      {/* Переходы */}
                      <Td
                        fontSize="14px"
                        color="#12233f"
                        borderColor="#f0f0f5"
                        isNumeric
                      >
                        {campaign.totalClicks.toLocaleString('ru-RU')}
                      </Td>

                      {/* Создана */}
                      <Td fontSize="13px" color="#52525b" borderColor="#f0f0f5">
                        {new Date(campaign.createdAt).toLocaleDateString(
                          'ru-RU',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )}
                      </Td>

                      {/* Действия */}
                      <Td borderColor="#f0f0f5">
                        <HStack spacing="4px">
                          <Tooltip
                            label="Редактировать"
                            bg="#1e293b"
                            color="white"
                            fontSize="12px"
                            borderRadius="8px"
                            hasArrow
                            placement="top"
                          >
                            <IconButton
                              aria-label="Edit campaign"
                              icon={<EditIcon />}
                              variant="ghost"
                              size="sm"
                              color="#a1a1aa"
                              _hover={{ color: '#3b6ea0', bg: '#f0f5fa' }}
                              onClick={(e) => handleEdit(campaign, e)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Flex justify="center" align="center" mt="20px" gap="6px">
                <IconButton
                  aria-label="Prev page"
                  icon={<ChevronLeftIcon />}
                  size="sm"
                  variant="ghost"
                  color="#3b6ea0"
                  isDisabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
                {paginationPages.map((p, i) =>
                  p === '...' ? (
                    <Text
                      key={`dots-${i}`}
                      color="#a1a1aa"
                      fontSize="14px"
                      px="4px"
                    >
                      …
                    </Text>
                  ) : (
                    <Button
                      key={p}
                      size="sm"
                      variant={safePage === p ? 'solid' : 'ghost'}
                      bg={safePage === p ? '#3b6ea0' : 'transparent'}
                      color={safePage === p ? 'white' : '#52525b'}
                      borderRadius="8px"
                      fontSize="14px"
                      fontWeight={safePage === p ? 600 : 400}
                      minW="36px"
                      _hover={{ bg: safePage === p ? '#34608c' : '#f0f5fa' }}
                      onClick={() => setCurrentPage(p as number)}
                    >
                      {p}
                    </Button>
                  ),
                )}
                <IconButton
                  aria-label="Next page"
                  icon={<ChevronRightIcon />}
                  size="sm"
                  variant="ghost"
                  color="#3b6ea0"
                  isDisabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                />
              </Flex>
            )}
          </>
        )}
      </Box>

      {/* Edit Modal */}
      {editTarget && (
        <EditCampaignModal
          campaign={editTarget}
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}
