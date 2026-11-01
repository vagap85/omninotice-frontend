import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowForwardIcon,
  AddIcon,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Checkbox,
  Tag,
  useToast
} from '@chakra-ui/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchLinks,
  fetchCampaigns,
  fetchTags,
  createCampaign,
  updateLink,
  setLinkStatus,
  buildRedirectUrl,
  isApiConfigured,
} from '@/api/shortener';
import copy from '@/assets/copy.svg';
import qr from '@/assets/qr.svg';
import ProgressModal from '@/components/shortener/ProgressModal/ProgressModal';
import { QrModal } from '@/components/shortener/QrModal/QrModal';
import { ShortenModal } from '@/components/shortener/ShortenModal/ShortenModal';
import { mockLinks, mockCampaigns } from '@/mocks/shortener';
import type { LinkRow, CampaignRow } from '@/types/shortener';
import { ROUTES } from '@/routing/routes';
import './LinksRegistryPage.scss';

/** Извлекает код shortcut из shortUrl вида "omni/abc123" */
function extractShortcut(shortUrl: string): string {
  const parts = shortUrl.split('/');
  return parts[parts.length - 1];
}

const ITEMS_PER_PAGE = 7;

const statusColors: Record<
  string,
  { color: string; bg: string; borderColor: string }
> = {
  active: { color: '#16a34a', bg: '#f0fdf4', borderColor: '#bbf7d0' },
  inactive: { color: '#71717a', bg: '#f4f4f5', borderColor: '#d4d4d8' },
  blocked: { color: '#ef4444', bg: '#fef2f2', borderColor: '#fecaca' },
};

const statusLabels: Record<LinkRow['status'], string> = {
  active: 'активна',
  inactive: 'неактивна',
  blocked: 'заблокирована',
};

type SortDir = 'asc' | 'desc';

type SortKey =
  'name' | 'shortUrl' | 'targetUrl' | 'campaign' | 'status' | 'clicks';

const statusOrder: Record<LinkRow['status'], number> = {
  active: 0,
  inactive: 1,
  blocked: 2,
};

const sortableColumns: { key: SortKey; label: string; isNumeric?: boolean }[] =
  [
    { key: 'name', label: 'Название' },
    { key: 'shortUrl', label: 'Короткий URL' },
    { key: 'targetUrl', label: 'Целевой URL' },
    { key: 'campaign', label: 'Кампания' },
    { key: 'status', label: 'Статус' },
    { key: 'clicks', label: 'Переходы', isNumeric: true },
  ];

function SortIndicator({ dir }: { dir: SortDir | null }) {
  return (
    <svg
      className={`links-registry__sort-icon${
        dir ? ' links-registry__sort-icon--active' : ''
      }`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={dir ? 1.8 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === 'asc' && <path d="M3.5 10 8 5.5 12.5 10" />}
      {dir === 'desc' && <path d="M3.5 6 8 10.5 12.5 6" />}
      {!dir && (
        <>
          <path d="M4.5 6 8 2.5 11.5 6" />
          <path d="M4.5 10 8 13.5 11.5 10" />
        </>
      )}
    </svg>
  );
}

const statusFilterOptions: { label: string; value: string }[] = [
  { label: 'Все статусы', value: '' },
  { label: 'Активна', value: 'active' },
  { label: 'Неактивна', value: 'inactive' },
  { label: 'Заблокирована', value: 'blocked' },
];

interface FilterMenuSelectProps {
  label: string;
  value: string;
  displayValue?: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

function FilterMenuSelect({
  label,
  value,
  displayValue,
  options,
  onChange,
}: FilterMenuSelectProps) {
  return (
    <Menu autoSelect={false}>
      {({ isOpen }) => (
        <Box>
          <MenuButton
            as={Button}
            variant="outline"
            bg="#F8FAFC"
            border="1px solid"
            borderColor="#7095BA"
            borderRadius="10px"
            h="36px"
            px="14px"
            fontSize="14px"
            fontWeight="400"
            color="brand.800"
            whiteSpace="nowrap"
            rightIcon={
              isOpen ? (
                <ChevronDownIcon boxSize="16px" color="brand.800" />
              ) : (
                <ChevronUpIcon boxSize="16px" color="brand.800" />
              )
            }
            _hover={{ bg: '#F8FAFC', borderColor: '#3B6EA0' }}
            _active={{ bg: '#F8FAFC' }}
          >
            {displayValue || value || label}
          </MenuButton>

          <Portal>
            <MenuList
              bg="#F8FAFC"
              border="none"
              borderRadius="12px"
              boxShadow="0 4px 20px rgba(18, 35, 63, 0.08)"
              p="8px"
              minW="166px"
              maxH="280px"
              overflowY="auto"
              zIndex={1000}
            >
              {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <MenuItem
                    key={opt.value}
                    borderRadius="8px"
                    fontSize="14px"
                    fontWeight="500"
                    color="brand.800"
                    h="44px"
                    px="14px"
                    bg={isSelected ? 'brand.60' : 'transparent'}
                    _hover={{ bg: 'brand.60', color: 'brand.800' }}
                    _focus={{ bg: 'brand.60', color: 'brand.800' }}
                    onClick={() => onChange(opt.value)}
                  >
                    {opt.label}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Portal>
        </Box>
      )}
    </Menu>
  );
}

export default function LinksRegistryPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  // Links state
  const [links, setLinks] = useState<LinkRow[]>(mockLinks);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockCampaigns);
  // Теги из GET /tags/ (заполняются только при сконфигурированном API)
  const [apiTags, setApiTags] = useState<string[]>([]);

  // Загрузка реальных данных из API (если задан демо-токен в .env.local).
  // Перечитываем также при возврате на вкладку — чтобы счётчики переходов
  // обновлялись после открытия короткой ссылки.
  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;
    const loadRegistry = async () => {
      try {
        const [apiLinks, apiCampaigns] = await Promise.all([
          fetchLinks(),
          fetchCampaigns(),
        ]);
        if (!cancelled) {
          setLinks(apiLinks);
          setCampaigns(apiCampaigns);
        }
      } catch (err) {
        toast({
          title: 'Не удалось загрузить реестр',
          description: (err as Error).message,
          status: 'error',
          duration: 4000,
          isClosable: true
        });
      }
      try {
        const tags = await fetchTags();
        if (!cancelled) setApiTags(tags.map((t) => t.name));
      } catch {
        // список тегов не критичен — остаётся вычисленный из данных
      }
    };
    loadRegistry();
    window.addEventListener('focus', loadRegistry);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', loadRegistry);
    };
  }, [toast]);

  const [isShortenModalOpen, setIsShortenModalOpen] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // QR modal state
  const [qrLink, setQrLink] = useState<LinkRow | null>(null);

  // Link actions & modals state
  const [redirectLink, setRedirectLink] = useState<LinkRow | null>(null);
  const [redirectNewUrl, setRedirectNewUrl] = useState('');
  const [isRedirectLoading, setIsRedirectLoading] = useState(false);
  const [isRedirectPromptOpen, setIsRedirectPromptOpen] = useState(false);
  const [dontShowPromptAgain, setDontShowPromptAgain] = useState(false);

  const [campaignLink, setCampaignLink] = useState<LinkRow | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [customCampaign, setCustomCampaign] = useState('');

  const [editLink, setEditLink] = useState<LinkRow | null>(null);

  const [searchText, setSearchText] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const allCampaigns = [
    'Без кампании',
    ...Array.from(
      new Set([
        ...campaigns.map((c) => c.name),
        ...links.map((l) => l.campaign),
      ]),
    ).filter((name) => Boolean(name) && name !== 'Без кампании'),
  ];
  const allTags = apiTags.length
    ? apiTags
    : Array.from(
        new Set([
          ...campaigns.flatMap((c) => c.tags),
          ...links.flatMap((l) => l.tags),
        ]),
      ).sort();

  const filteredLinks = links.filter((link) => {
    const query = searchText.toLowerCase();
    const matchesSearch =
      !query ||
      link.name.toLowerCase().includes(query) ||
      link.shortUrl.toLowerCase().includes(query) ||
      link.targetUrl.toLowerCase().includes(query) ||
      link.tags.some((t) => t.toLowerCase().includes(query)) ||
      link.campaign.toLowerCase().includes(query);
    const matchesCampaign = !filterCampaign || link.campaign === filterCampaign;
    const matchesTag = !filterTag || link.tags.includes(filterTag);
    const matchesStatus = !filterStatus || link.status === filterStatus;
    return matchesSearch && matchesCampaign && matchesTag && matchesStatus;
  });

  const handleLinkCreated = (newLink: LinkRow) => {
    setLinks((prev) => [newLink, ...prev]);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const sortedLinks = sortKey
    ? [...filteredLinks].sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortKey === 'clicks') return (a.clicks - b.clicks) * dir;
        if (sortKey === 'status')
          return (statusOrder[a.status] - statusOrder[b.status]) * dir;
        return a[sortKey].localeCompare(b[sortKey], 'ru') * dir;
      })
    : filteredLinks;

  const totalPages = Math.max(
    1,
    Math.ceil(sortedLinks.length / ITEMS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pagedLinks = sortedLinks.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const resetFilters = () => {
    setSearchText('');
    setFilterCampaign('');
    setFilterTag('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  // Copy handler
  const handleCopy = useCallback((link: LinkRow, e: React.MouseEvent) => {
    e.stopPropagation();
    // Редирект работает через шлюз: {API_BASE_URL}/s/{код}
    const fullUrl = buildRedirectUrl(
      link.shortcut || extractShortcut(link.shortUrl),
    );
    const markCopied = () => {
      setCopiedId(link.id);
      toast({
        title: 'Ссылка скопирована в буфер обмена',
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2500);
    };
    navigator.clipboard
      .writeText(fullUrl)
      .then(markCopied)
      .catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = fullUrl;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          markCopied();
        } catch {
          toast({
            title: 'Не удалось скопировать ссылку',
            status: 'error',
            duration: 4000,
            isClosable: true
          });
        }
      });
  }, [toast]);

  // QR handler
  const handleQr = useCallback((link: LinkRow, e: React.MouseEvent) => {
    e.stopPropagation();
    setQrLink(link);
  }, []);

  // Action Menu Handlers
  const handleOpenRedirect = (link: LinkRow) => {
    setRedirectLink(link);
    setRedirectNewUrl(link.targetUrl);
  };

  const handleCancelRedirect = () => {
    setRedirectLink(null);
    setIsRedirectLoading(false);
  };

  const performRedirectSave = useCallback(() => {
    if (!redirectLink) return;
    const trimmed = redirectNewUrl.trim();
    const finalUrl =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;

    setLinks((prev) =>
      prev.map((l) =>
        l.id === redirectLink.id ? { ...l, targetUrl: finalUrl } : l,
      ),
    );

    if (isApiConfigured) {
      updateLink(redirectLink.id, { target: finalUrl }).catch((err) =>
        toast({
          title: 'Не удалось сохранить целевой URL',
          description: (err as Error).message,
          status: 'error',
          duration: 4000,
          isClosable: true
        }),
      );
    }

    setIsRedirectLoading(false);
    setIsRedirectPromptOpen(true);
  }, [redirectLink, redirectNewUrl, toast]);

  const handleCloseRedirectPrompt = () => {
    toast({
      title: 'Целевой URL успешно обновлен',
      status: 'success',
      duration: 4000,
      isClosable: true
    });
    setIsRedirectPromptOpen(false);
    setRedirectLink(null);
  };

  const handleEditFromPrompt = () => {
    if (!redirectLink) return;

    const trimmed = redirectNewUrl.trim();
    const finalUrl =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;

    const updatedLink = { ...redirectLink, targetUrl: finalUrl };

    setIsRedirectPromptOpen(false);
    setRedirectLink(null);
    handleOpenEdit(updatedLink);
  };

  const handleSaveRedirect = () => {
    if (!redirectLink) return;
    const trimmed = redirectNewUrl.trim();
    if (!trimmed) {
      toast({
        title: 'Укажите целевой URL',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      return;
    }
    setIsRedirectLoading(true);
  };

  const handleOpenCampaign = (link: LinkRow) => {
    setCampaignLink(link);
    setSelectedCampaign(link.campaign || 'Без кампании');
    setCustomCampaign('');
  };

  const handleSaveCampaign = () => {
    if (!campaignLink) return;
    const targetCampaign =
      selectedCampaign === '__custom__'
        ? customCampaign.trim()
        : selectedCampaign;

    if (!targetCampaign) {
      toast({
        title: 'Выберите или введите кампанию',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    setLinks((prev) =>
      prev.map((l) =>
        l.id === campaignLink.id ? { ...l, campaign: targetCampaign } : l,
      ),
    );

    const linkId = campaignLink.id;
    if (isApiConfigured) {
      (async () => {
        try {
          let campaignId = campaigns.find((c) => c.name === targetCampaign)?.id;
          if (!campaignId) {
            const created = await createCampaign({ name: targetCampaign });
            campaignId = created.id;
            setCampaigns((prev) => [...prev, created]);
          }
          await updateLink(linkId, { campaign_id: campaignId });
        } catch (err) {
          toast({
            title: 'Не удалось сохранить кампанию',
            description: (err as Error).message,
            status: 'error',
            duration: 4000,
            isClosable: true
          });
        }
      })();
    }

    toast({
      title: `Ссылка "${campaignLink.name}" добавлена в кампанию "${targetCampaign}"`,
      status: 'success',
      duration: 4000,
      isClosable: true
    });
    setCampaignLink(null);
  };

  const handleOpenEdit = (link: LinkRow) => {
    setEditLink(link);
  };

  const handleEditSave = (updatedLink: LinkRow) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === updatedLink.id ? updatedLink : l)),
    );
    setEditLink(null);

    if (isApiConfigured) {
      updateLink(updatedLink.id, {
        title: updatedLink.name,
        description: updatedLink.description,
        tags: updatedLink.tags,
      }).catch((err) =>
        toast({
          title: 'Не удалось сохранить ссылку',
          description: (err as Error).message,
          status: 'error',
          duration: 4000,
          isClosable: true
        }),
      );
    }
  };

  const handleToggleStatus = (link: LinkRow) => {
    if (link.status === 'blocked') {
      toast({
        title: 'Заблокированная ссылка не может быть изменена',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
      return;
    }
    const newStatus: LinkRow['status'] =
      link.status === 'active' ? 'inactive' : 'active';

    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, status: newStatus } : l)),
    );

    if (isApiConfigured) {
      setLinkStatus(link.id, newStatus).catch((err) =>
        toast({
          title: 'Не удалось изменить статус',
          description: (err as Error).message,
          status: 'error',
          duration: 4000,
          isClosable: true
        }),
      );
    }

    if (newStatus === 'inactive') {
      toast({
        title: `Ссылка "${link.name}" деактивирована`,
        status: 'info',
        duration: 4000,
        isClosable: true
      });
    } else {
      toast({
        title: `Ссылка "${link.name}" активирована`,
        status: 'success',
        duration: 4000,
        isClosable: true
      });
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleFilterChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

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
    <Box className="links-registry">
      <Box px="32px" py="28px">

        <Heading
          fontSize="20px"
          fontWeight={700}
          color="#12233f"
          mb="24px"
          fontFamily="'Inter', sans-serif"
        >
          Список сокращённых ссылок
        </Heading>

        <Flex
          justify="space-between"
          align="center"
          mb="20px"
          gap="12px"
          flexWrap="wrap"
        >
          <Flex align="center" gap="8px" flexWrap="wrap" flexGrow={1}>
            <InputGroup maxW="420px">
              <InputLeftElement pointerEvents="none" h="36px">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                value={searchText}
                onChange={handleFilterChange(setSearchText)}
                placeholder="Поиск по названию, целевому URL или тегу"
                bg="#F8FAFC"
                border="none"
                borderRadius="10px"
                h="36px"
                fontSize="14px"
                _placeholder={{ color: '#94A3B8' }}
                _focusVisible={{ outline: 'none', boxShadow: '0 0 0 1px #7095BA' }}
              />
            </InputGroup>

            <FilterMenuSelect
              label="Кампании"
              value={filterCampaign}
              options={[
                { label: 'Все кампании', value: '' },
                ...allCampaigns.map((c) => ({ label: c, value: c })),
              ]}
              onChange={(val) => {
                setFilterCampaign(val);
                setCurrentPage(1);
              }}
            />

            <FilterMenuSelect
              label="Теги"
              value={filterTag}
              options={[
                { label: 'Все теги', value: '' },
                ...allTags.map((t) => ({ label: t, value: t })),
              ]}
              onChange={(val) => {
                setFilterTag(val);
                setCurrentPage(1);
              }}
            />

            <FilterMenuSelect
              label="Все статусы"
              value={filterStatus}
              displayValue={
                filterStatus
                  ? statusFilterOptions.find((o) => o.value === filterStatus)?.label
                  : 'Все статусы'
              }
              options={statusFilterOptions}
              onChange={(val) => {
                setFilterStatus(val);
                setCurrentPage(1);
              }}
            />

            <Button
              variant="unstyled"
              fontSize="14px"
              fontWeight="normal"
              color="#12233F"
              h="36px"
              px="2"
              ml={{ base: 0, md: '8px' }}
              _hover={{ color: '#3B6EA0' }}
              onClick={resetFilters}
            >
              Сбросить фильтры
            </Button>
          </Flex>

          <Button
            bg="#3B6EA0"
            color="white"
            borderRadius="10px"
            h="36px"
            px="16px"
            fontSize="14px"
            fontWeight="500"
            _hover={{ bg: '#2D547B' }}
            rightIcon={<AddIcon boxSize="11px" />}
            onClick={() => setIsShortenModalOpen(true)}
          >
            Сократить ссылку
          </Button>
        </Flex>

        <Box>
          {filteredLinks.length === 0 ? (
            <Box
              bg="white"
              borderRadius="16px"
              p="60px 40px"
              textAlign="center"
              boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
            >
              <Text fontSize="40px" mb="16px">
                🔍
              </Text>
              <Text fontSize="18px" fontWeight={700} color="#12233f" mb="8px">
                Ничего не найдено
              </Text>
              <Text fontSize="14px" color="#52525b" mb="20px">
                Попробуйте изменить параметры поиска или сбросить фильтры.
              </Text>
              <Button
                className="links-registry__empty-reset"
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
                    {filteredLinks.length}
                  </Text>{' '}
                  ссылок
                </Text>
              </Flex>
              <Box
                bg="white"
                borderRadius="12px"
                overflow="hidden"
                boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
              >
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      {sortableColumns.map((col) => {
                        const isActive = sortKey === col.key;
                        return (
                          <Th
                            key={col.key}
                            fontSize="12px"
                            color="#52525b"
                            fontWeight={600}
                            textTransform="none"
                            borderColor="#e2e8f0"
                            isNumeric={col.isNumeric}
                            className="links-registry__sort-th"
                            aria-sort={
                              isActive
                                ? sortDir === 'asc'
                                  ? 'ascending'
                                  : 'descending'
                                : 'none'
                            }
                            onClick={() => handleSort(col.key)}
                          >
                            <Flex
                              align="center"
                              gap="4px"
                              justify={
                                col.isNumeric ? 'flex-end' : 'flex-start'
                              }
                            >
                              <Text>{col.label}</Text>
                              <SortIndicator
                                dir={isActive ? sortDir : null}
                              />
                            </Flex>
                          </Th>
                        );
                      })}
                      <Th
                        fontSize="12px"
                        color="#52525b"
                        fontWeight={600}
                        textTransform="none"
                        borderColor="#e2e8f0"
                      >
                        Действия
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pagedLinks.map((link) => {
                      const isCopied = copiedId === link.id;
                      return (
                        <Tr
                          key={link.id}
                          _hover={{ bg: '#f8fafc' }}
                          cursor="pointer"
                          onClick={() =>
                            navigate(`${ROUTES.links}/${link.id}`)
                          }
                        >
                          <Td
                            fontSize="14px"
                            color="#12233f"
                            borderColor="#f0f0f5"
                            maxW="180px"
                          >
                            <Tooltip
                              label={link.description}
                              bg="#1e293b"
                              color="white"
                              fontSize="12px"
                              borderRadius="8px"
                              p="10px 14px"
                              hasArrow
                              isDisabled={!link.description}
                            >
                              <Text noOfLines={1}>{link.name}</Text>
                            </Tooltip>
                          </Td>
                          <Td
                            fontSize="14px"
                            color="#3b6ea0"
                            borderColor="#f0f0f5"
                          >
                            {link.shortUrl}
                          </Td>
                          <Td
                            fontSize="13px"
                            color="#52525b"
                            borderColor="#f0f0f5"
                            maxW="240px"
                          >
                            <Text noOfLines={1}>{link.targetUrl}</Text>
                          </Td>
                          <Td
                            fontSize="13px"
                            color="#52525b"
                            borderColor="#f0f0f5"
                            maxW="140px"
                          >
                            <Text noOfLines={1}>{link.campaign}</Text>
                          </Td>

                          <Td borderColor="#f0f0f5">
                            <Tooltip
                              label={link.blockReason}
                              bg="#1e293b"
                              color="white"
                              fontSize="12px"
                              borderRadius="8px"
                              p="10px 14px"
                              hasArrow
                              isDisabled={
                                !(
                                  link.status === 'blocked' &&
                                  link.blockReason
                                )
                              }
                            >
                              <Badge
                                px="12px"
                                py="4px"
                                borderRadius="6px"
                                fontSize="12px"
                                fontWeight={500}
                                color={statusColors[link.status].color}
                                bg={statusColors[link.status].bg}
                                border="1px solid"
                                borderColor={
                                  statusColors[link.status].borderColor
                                }
                                textTransform="none"
                              >
                                {statusLabels[link.status]}
                              </Badge>
                            </Tooltip>
                          </Td>
                          <Td
                            fontSize="14px"
                            color="#12233f"
                            borderColor="#f0f0f5"
                            isNumeric
                          >
                            {link.clicks.toLocaleString('ru-RU')}
                          </Td>
                          <Td borderColor="#f0f0f5">
                            <HStack
                              spacing="4px"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tooltip
                                label={
                                  isCopied
                                    ? 'Скопировано!'
                                    : 'Копировать ссылку'
                                }
                                bg="#1e293b"
                                color="white"
                                fontSize="12px"
                                borderRadius="8px"
                                hasArrow
                                placement="top"
                              >
                                <IconButton
                                  aria-label="Copy"
                                  icon={
                                    isCopied ? (
                                      <svg
                                        className="links-registry__action-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    ) : (
                                      <img
                                        src={copy}
                                        alt="copy"
                                        className="links-registry__action-icon"
                                      />
                                    )
                                  }
                                  variant="ghost"
                                  size="sm"
                                  color={isCopied ? '#16a34a' : '#a1a1aa'}
                                  bg={isCopied ? '#f0fdf4' : undefined}
                                  _hover={{
                                    color: isCopied ? '#16a34a' : '#3b6ea0',
                                    bg: isCopied ? '#f0fdf4' : '#f0f5fa',
                                  }}
                                  onClick={(e) => handleCopy(link, e)}
                                />
                              </Tooltip>
                              <Tooltip
                                label="Показать QR-код"
                                bg="#1e293b"
                                color="white"
                                fontSize="12px"
                                borderRadius="8px"
                                hasArrow
                                placement="top"
                              >
                                <IconButton
                                  aria-label="QR"
                                  icon={
                                    <img
                                      src={qr}
                                      alt="qr"
                                      className="links-registry__action-icon"
                                    />
                                  }
                                  variant="ghost"
                                  size="sm"
                                  color="#a1a1aa"
                                  _hover={{ color: '#3b6ea0', bg: '#f0f5fa' }}
                                  onClick={(e) => handleQr(link, e)}
                                />
                              </Tooltip>
                              <Menu isLazy placement="bottom-end">
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Действия со ссылкой"
                                  icon={
                                    <Text fontSize="18px" lineHeight="1" color="#a1a1aa">
                                      ⋯
                                    </Text>
                                  }
                                  variant="ghost"
                                  size="sm"
                                  _hover={{ color: '#3b6ea0', bg: '#f0f5fa' }}
                                  onClick={(e: React.MouseEvent) =>
                                    e.stopPropagation()
                                  }
                                />
                                <Portal>
                                  <MenuList
                                    bg="white"
                                    border="1px solid"
                                    borderColor="brand.60"
                                    borderRadius="12px"
                                    boxShadow="0 4px 20px rgba(18, 35, 63, 0.08)"
                                    p="8px"
                                    minW="275px"
                                    zIndex={1000}
                                    onClick={(e: React.MouseEvent) =>
                                      e.stopPropagation()
                                    }
                                  >
                                    <Box px="12px" pt="6px" pb="12px">
                                      <Text
                                        fontSize="15px"
                                        fontWeight="600"
                                        color="brand.450"
                                      >
                                        Действия со ссылкой
                                      </Text>
                                    </Box>

                                    <MenuItem
                                      borderRadius="8px"
                                      h="44px"
                                      px="12px"
                                      color="brand.800"
                                      fontSize="14px"
                                      fontWeight="500"
                                      bg="transparent"
                                      _hover={{ bg: '#F8FAFC' }}
                                      _focus={{ bg: '#F8FAFC' }}
                                      onClick={() => handleOpenRedirect(link)}
                                    >
                                      <Flex
                                        mr="12px"
                                        align="center"
                                        justify="center"
                                        color="brand.800"
                                      >
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="15 6 20 11 15 16" />
                                          <path d="M4 19v-4a4 4 0 0 1 4-4h12" />
                                        </svg>
                                      </Flex>
                                      <Text fontSize="14px" fontWeight="500" color="brand.800">
                                        Перенаправить на другой URL
                                      </Text>
                                    </MenuItem>

                                    <MenuItem
                                      borderRadius="8px"
                                      h="44px"
                                      px="12px"
                                      color="brand.800"
                                      fontSize="14px"
                                      fontWeight="500"
                                      bg="transparent"
                                      _hover={{ bg: '#F8FAFC' }}
                                      _focus={{ bg: '#F8FAFC' }}
                                      onClick={() => handleOpenCampaign(link)}
                                    >
                                      <Flex
                                        mr="12px"
                                        align="center"
                                        justify="center"
                                        color="brand.800"
                                      >
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <line
                                            x1="12"
                                            y1="5"
                                            x2="12"
                                            y2="19"
                                          />
                                          <line
                                            x1="5"
                                            y1="12"
                                            x2="19"
                                            y2="12"
                                          />
                                        </svg>
                                      </Flex>
                                      <Text fontSize="14px" fontWeight="500" color="brand.800">
                                        Добавить в кампанию
                                      </Text>
                                    </MenuItem>

                                    <MenuItem
                                      borderRadius="8px"
                                      h="44px"
                                      px="12px"
                                      color="brand.800"
                                      fontSize="14px"
                                      fontWeight="500"
                                      bg="transparent"
                                      _hover={{ bg: '#F8FAFC' }}
                                      _focus={{ bg: '#F8FAFC' }}
                                      onClick={() => handleOpenEdit(link)}
                                    >
                                      <Flex
                                        mr="12px"
                                        align="center"
                                        justify="center"
                                        color="brand.800"
                                      >
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.75"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                          <line
                                            x1="9"
                                            y1="21"
                                            x2="15"
                                            y2="21"
                                          />
                                        </svg>
                                      </Flex>
                                      <Text fontSize="14px" fontWeight="500" color="brand.800">
                                        Редактировать информацию
                                      </Text>
                                    </MenuItem>

                                    <MenuItem
                                      borderRadius="8px"
                                      h="44px"
                                      px="12px"
                                      color="brand.800"
                                      fontSize="14px"
                                      fontWeight="500"
                                      bg="transparent"
                                      _hover={{ bg: '#F8FAFC' }}
                                      _focus={{ bg: '#F8FAFC' }}
                                      onClick={() => handleToggleStatus(link)}
                                    >
                                      <Flex
                                        mr="12px"
                                        align="center"
                                        justify="center"
                                        color="brand.800"
                                      >
                                        {link.status === 'inactive' ? (
                                          <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.75"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <polygon points="5 3 19 12 5 21" />
                                          </svg>
                                        ) : (
                                          <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.75"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <rect
                                              x="6"
                                              y="5"
                                              width="4"
                                              height="14"
                                              rx="1.5"
                                            />
                                            <rect
                                              x="14"
                                              y="5"
                                              width="4"
                                              height="14"
                                              rx="1.5"
                                            />
                                          </svg>
                                        )}
                                      </Flex>
                                      <Text fontSize="14px" fontWeight="500" color="brand.800">
                                        {link.status === 'inactive'
                                          ? 'Активировать'
                                          : 'Деактивировать'}
                                      </Text>
                                    </MenuItem>
                                  </MenuList>
                                </Portal>
                              </Menu>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
              {totalPages > 1 && (
                <Flex justify="center" mt="24px" gap="4px" align="center">
                  <IconButton
                    aria-label="Previous"
                    icon={<ChevronLeftIcon />}
                    variant="ghost"
                    size="sm"
                    color="#a1a1aa"
                    isDisabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  />
                  {paginationPages.map((p, idx) =>
                    p === '...' ? (
                      <Text key={`dots-${idx}`} color="#a1a1aa" px="4px">
                        ⋯
                      </Text>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={safePage === p ? 'solid' : 'ghost'}
                        bg={safePage === p ? '#3b6ea0' : 'transparent'}
                        color={safePage === p ? 'white' : '#52525b'}
                        borderRadius="8px"
                        minW="36px"
                        fontSize="14px"
                        _hover={safePage === p ? {} : { bg: '#f0f5fa' }}
                        onClick={() => setCurrentPage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <IconButton
                    aria-label="Next"
                    icon={<ChevronRightIcon />}
                    variant="ghost"
                    size="sm"
                    color="#a1a1aa"
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

      </Box>

      {/* QR Modal */}
      {qrLink && (
        <QrModal
          shortUrl={qrLink.shortUrl}
          shortcut={extractShortcut(qrLink.shortUrl)}
          onClose={() => setQrLink(null)}
        />
      )}

      {/* Shorten Modal */}
      <ShortenModal
        isOpen={isShortenModalOpen}
        onClose={() => setIsShortenModalOpen(false)}
        onCreated={handleLinkCreated}
        campaigns={allCampaigns}
        availableTags={allTags}
      />

      {/* Redirect Modal */}
      {redirectLink && !isRedirectLoading && (
        <Modal
          isOpen={Boolean(redirectLink)}
          onClose={handleCancelRedirect}
          isCentered
          size="2xl"
        >
          <ModalOverlay className="links-registry-modal__overlay" />
          <ModalContent
            className="links-registry-modal__content"
            p="8px"
            borderRadius="16px"
          >
            <ModalHeader
              className="links-registry-modal__header"
              fontSize="20px"
              fontWeight="700"
              color="#12233f"
            >
              Перенаправить ссылку на другой URL
            </ModalHeader>
            <ModalCloseButton
              className="links-registry-modal__close-btn"
              mt="12px"
              mr="12px"
            />
            <ModalBody className="links-registry-modal__body">
              <Box bg="#f8fafc" borderRadius="12px" p="16px" mb="24px">
                <Text fontSize="14px" color="#64748b" mb="4px">
                  Короткий URL
                </Text>
                <Text fontSize="16px" fontWeight="600" color="#2b6cb0" mb="8px">
                  {redirectLink.shortUrl}
                </Text>
                <Text fontSize="13px" color="#64748b">
                  Короткий адрес и QR-код не изменяются при смене целевого URL
                </Text>
              </Box>
              <FormControl isRequired>
                <FormLabel
                  className="links-registry-modal__form-label"
                  textTransform="none"
                  fontSize="14px"
                  color="#12233f"
                  letterSpacing="normal"
                >
                  Целевой URL
                </FormLabel>
                <Input
                  className="links-registry-modal__input"
                  value={redirectNewUrl}
                  onChange={(e) => setRedirectNewUrl(e.target.value)}
                  placeholder="https://example.com/new-destination"
                  autoFocus
                  bg="#f8fafc"
                  border="none"
                  _hover={{ bg: '#f1f5f9' }}
                  _focus={{
                    bg: 'white',
                    border: '1px solid #3b82f6',
                    boxShadow: '0 0 0 1px #3b82f6',
                  }}
                  h="48px"
                />
                <FormHelperText
                  className="links-registry-modal__helper-text"
                  mt="12px"
                  fontSize="13px"
                >
                  Короткая ссылка и QR-код не изменятся. Новый адрес заработает
                  сразу для всех новых переходов.
                </FormHelperText>
              </FormControl>
            </ModalBody>
            <ModalFooter
              className="links-registry-modal__footer"
              borderTop="none"
              pt="0"
            >
              <Button
                className="links-registry-modal__cancel-btn"
                onClick={handleCancelRedirect}
              >
                Отмена
              </Button>
              <Button
                className="links-registry-modal__save-btn"
                onClick={handleSaveRedirect}
                rightIcon={<ArrowForwardIcon />}
              >
                Изменить целевой URL
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {isRedirectLoading && (
        <ProgressModal
          title="Меняем целевой URL"
          duration={2000}
          onClose={() => setIsRedirectLoading(false)}
          onCancel={handleCancelRedirect}
          onComplete={performRedirectSave}
        />
      )}

      {/* Redirect Prompt Modal */}
      {isRedirectPromptOpen && redirectLink && (
        <Modal
          isOpen={isRedirectPromptOpen}
          onClose={handleCloseRedirectPrompt}
          isCentered
          size="2xl"
        >
          <ModalOverlay className="links-registry-modal__overlay" />
          <ModalContent
            className="links-registry-modal__content"
            p="8px"
            borderRadius="16px"
          >
            <ModalHeader
              className="links-registry-modal__header"
              fontSize="18px"
              fontWeight="700"
              color="#12233f"
            >
              Целевой URL изменен. Хотите изменить другую информацию о ссылке?
            </ModalHeader>
            <ModalCloseButton
              className="links-registry-modal__close-btn"
              mt="12px"
              mr="12px"
            />
            <ModalBody className="links-registry-modal__body">
              <Box bg="#f8fafc" borderRadius="12px" p="16px" mb="24px">
                <Box mb="12px">
                  <Text fontSize="13px" color="#64748b" mb="2px">
                    Короткий URL
                  </Text>
                  <Text fontSize="14px" fontWeight="500" color="#12233f">
                    {redirectLink.shortUrl}
                  </Text>
                </Box>
                <Box mb="12px">
                  <Text fontSize="13px" color="#64748b" mb="2px">
                    Новый целевой URL
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="#12233f"
                    wordBreak="break-all"
                  >
                    {redirectNewUrl}
                  </Text>
                </Box>
                <Box mb="12px">
                  <Text fontSize="13px" color="#64748b" mb="2px">
                    Название
                  </Text>
                  <Text fontSize="14px" fontWeight="500" color="#12233f">
                    {redirectLink.name}
                  </Text>
                </Box>
                <Box mb="12px">
                  <Text fontSize="13px" color="#64748b" mb="2px">
                    Описание
                  </Text>
                  <Text fontSize="14px" fontWeight="500" color="#12233f">
                    {redirectLink.description || '—'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="13px" color="#64748b" mb="4px">
                    Теги
                  </Text>
                  <Flex flexWrap="wrap" gap="8px">
                    {redirectLink.tags && redirectLink.tags.length > 0 ? (
                      redirectLink.tags.map((tag) => (
                        <Tag
                          key={tag}
                          bg="#e6f0fa"
                          color="#3b6ea0"
                          borderRadius="full"
                          px="12px"
                          py="4px"
                        >
                          {tag}
                        </Tag>
                      ))
                    ) : (
                      <Text fontSize="14px" color="#12233f">
                        —
                      </Text>
                    )}
                  </Flex>
                </Box>
              </Box>

              <Checkbox
                colorScheme="blue"
                isChecked={dontShowPromptAgain}
                onChange={(e) => setDontShowPromptAgain(e.target.checked)}
                color="#334155"
                fontSize="14px"
              >
                Больше не предлагать после изменения целевого URL
              </Checkbox>
            </ModalBody>
            <ModalFooter
              className="links-registry-modal__footer"
              borderTop="none"
              pt="24px"
            >
              <Button
                className="links-registry-modal__cancel-btn"
                onClick={handleEditFromPrompt}
              >
                Редактировать
              </Button>
              <Button
                className="links-registry-modal__save-btn"
                onClick={handleCloseRedirectPrompt}
                rightIcon={<ArrowForwardIcon />}
              >
                Сохранить без изменений
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Add To Campaign Modal */}
      {campaignLink && (
        <Modal
          isOpen={Boolean(campaignLink)}
          onClose={() => setCampaignLink(null)}
          isCentered
        >
          <ModalOverlay className="links-registry-modal__overlay" />
          <ModalContent className="links-registry-modal__content">
            <ModalHeader className="links-registry-modal__header">
              Добавить в кампанию
            </ModalHeader>
            <ModalCloseButton className="links-registry-modal__close-btn" />
            <ModalBody className="links-registry-modal__body">
              <Box className="links-registry-modal__link-info">
                <Text className="links-registry-modal__link-label">
                  Ссылка:
                </Text>
                <Text className="links-registry-modal__link-value">
                  {campaignLink.name} ({campaignLink.shortUrl})
                </Text>
              </Box>
              <FormControl isRequired>
                <FormLabel className="links-registry-modal__form-label">
                  Кампания
                </FormLabel>
                <Select
                  className="links-registry-modal__select"
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                >
                  {allCampaigns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__custom__">
                    + Создать новую кампанию...
                  </option>
                </Select>
              </FormControl>
              {selectedCampaign === '__custom__' && (
                <FormControl
                  isRequired
                  className="links-registry-modal__form-control-extra"
                >
                  <FormLabel className="links-registry-modal__form-label">
                    Название новой кампании
                  </FormLabel>
                  <Input
                    className="links-registry-modal__input"
                    value={customCampaign}
                    onChange={(e) => setCustomCampaign(e.target.value)}
                    placeholder="Например: Осенняя промо-кампания"
                    autoFocus
                  />
                </FormControl>
              )}
            </ModalBody>
            <ModalFooter className="links-registry-modal__footer">
              <Button
                className="links-registry-modal__cancel-btn"
                onClick={() => setCampaignLink(null)}
              >
                Отмена
              </Button>
              <Button
                className="links-registry-modal__save-btn"
                onClick={handleSaveCampaign}
              >
                Сохранить
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Edit Link Info Modal — reuses ShortenModal in edit mode */}
      <ShortenModal
        isOpen={Boolean(editLink)}
        onClose={() => setEditLink(null)}
        editLink={editLink}
        onEdited={handleEditSave}
        campaigns={allCampaigns}
        availableTags={allTags}
      />
    </Box>
  );
}
