import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
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
  VStack,
  useToast,
} from '@chakra-ui/react';
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsIcon,
  LinkIcon,
  EditIcon,
  InfoOutlineIcon,
  DownloadIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import {
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  isApiConfigured,
} from '@/api/shortener';
import { mockCampaigns } from '@/mocks/shortener';
import type { CampaignRow } from '@/types/shortener';
import './CampaignsPage.scss';

const ITEMS_PER_PAGE = 6;

type PageState = 'has-data' | 'empty' | 'error';

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  campaign: CampaignRow | null; // null means 'create new'
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
  const isEdit = !!campaign;
  const toast = useToast();

  const [name, setName] = useState(campaign?.name || '');
  const [description, setDescription] = useState(campaign?.description || '');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [campaign, isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: 'Название кампании обязательно',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    const newCampaign: CampaignRow = campaign || {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      tags: [],
      createdAt: new Date().toISOString(),
      linksCount: 0,
      shortLinksCount: 0,
      totalClicks: 0,
    };

    onSave({
      ...newCampaign,
      name: name.trim(),
      description: description.trim(),
    });
    onClose();
    if (isEdit) {
      toast({
        title: 'Кампания успешно сохранена',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
    } else {
      toast({
        title:
          'Кампания успешно создана. Добавьте целевой URL и разметку — ссылки появятся в кампании',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay className="campaigns-modal__overlay" />
      <ModalContent className="campaigns-modal__content">
        <ModalHeader className="campaigns-modal__header" pb={2}>
          {isEdit ? 'Редактировать кампанию' : 'Создать кампанию'}
        </ModalHeader>
        <ModalCloseButton className="campaigns-modal__close-btn" />

        <ModalBody className="campaigns-modal__body" px={6} py={4}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel
                className="campaigns-modal__form-label"
                fontWeight="600"
                mb={3}
              >
                Название кампании
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Летняя распродажа"
                className="campaigns-modal__input"
                bg="#f8fafc"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                px={4}
                py={3}
                height="auto"
              />
            </FormControl>

            <FormControl>
              <FormLabel
                className="campaigns-modal__form-label"
                fontWeight="600"
                mb={3}
              >
                Описание кампании
              </FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Три посадочные страницы: категория, хит и лендинг акции."
                className="campaigns-modal__input"
                resize="vertical"
                rows={3}
                bg="#f8fafc"
                border="1px solid #e2e8f0"
                borderRadius="8px"
                px={4}
                py={3}
              />
              <Text fontSize="13px" color="#52525b" mt={2}>
                Показывается в карточке кампании, чтобы вы не забыли ее
                назначение.
              </Text>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          className="campaigns-modal__footer"
          bg="transparent"
          px={6}
          py={5}
        >
          <Button
            variant="ghost"
            color="#12233f"
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
            rightIcon={<ArrowForwardIcon />}
            pl="20px"
            pr="16px"
          >
            {isEdit ? 'Сохранить изменения' : 'Создать кампанию'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ─── Debug State Switcher ──────────────────────────────────────────────────────

interface DebugSwitcherProps {
  currentState: PageState;
  onChange: (state: PageState) => void;
}

function DebugStateSwitcher({ currentState, onChange }: DebugSwitcherProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const states: { key: PageState; label: string; dotClass: string }[] = [
    {
      key: 'has-data',
      label: 'Есть кампании',
      dotClass: 'campaigns-debug-panel__dot--has-data',
    },
    {
      key: 'empty',
      label: 'Нет кампаний',
      dotClass: 'campaigns-debug-panel__dot--empty',
    },
    {
      key: 'error',
      label: 'Ошибка загрузки',
      dotClass: 'campaigns-debug-panel__dot--error',
    },
  ];

  return (
    <Box className="campaigns-debug-panel">
      {isMenuOpen && (
        <Box className="campaigns-debug-panel__menu">
          <Text className="campaigns-debug-panel__label">Состояние</Text>
          {states.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`campaigns-debug-panel__option ${
                currentState === s.key
                  ? 'campaigns-debug-panel__option--active'
                  : ''
              }`}
              onClick={() => {
                onChange(s.key);
                setIsMenuOpen(false);
              }}
            >
              <Box className={`campaigns-debug-panel__dot ${s.dotClass}`} />
              {s.label}
            </button>
          ))}
        </Box>
      )}
      <button
        type="button"
        className="campaigns-debug-panel__toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Переключить состояние"
      >
        <SettingsIcon />
      </button>
    </Box>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  campaign: CampaignRow;
  onEdit: (campaign: CampaignRow, e: React.MouseEvent) => void;
}

function CampaignCard({ campaign, onEdit }: CampaignCardProps) {
  const navigate = useNavigate();
  const formattedDate = new Date(campaign.createdAt).toLocaleDateString(
    'ru-RU',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  );

  return (
    <Tooltip
      label={campaign.description}
      bg="#1e293b"
      color="white"
      fontSize="12px"
      borderRadius="8px"
      p="10px 14px"
      maxW="320px"
      hasArrow
      placement="top"
      isDisabled={!campaign.description}
    >
      <Box
        className="campaigns-page__card"
        onClick={() => navigate(`/campaigns/${campaign.id}`)}
      >
        <Flex justify="space-between" align="flex-start" mb="4px">
          <Text className="campaigns-page__card-name">{campaign.name}</Text>
          <IconButton
            aria-label="Edit campaign"
            icon={<EditIcon />}
            size="xs"
            variant="ghost"
            className="campaigns-page__card-edit-btn"
            onClick={(e) => onEdit(campaign, e)}
          />
        </Flex>
        <Text className="campaigns-page__card-date">
          Создана: {formattedDate}
        </Text>

        <Flex className="campaigns-page__card-stats">
          <Box className="campaigns-page__card-stat">
            <Text className="campaigns-page__card-stat-label">Целевых URL</Text>
            <Text className="campaigns-page__card-stat-value">
              {campaign.linksCount}
            </Text>
          </Box>
          <Box className="campaigns-page__card-stat">
            <Text className="campaigns-page__card-stat-label">
              Коротких ссылок
            </Text>
            <Text className="campaigns-page__card-stat-value">
              {campaign.shortLinksCount ?? campaign.linksCount}
            </Text>
          </Box>
          <Box className="campaigns-page__card-stat">
            <Text className="campaigns-page__card-stat-label">Переходов</Text>
            <Text className="campaigns-page__card-stat-value">
              {campaign.totalClicks.toLocaleString('ru-RU')}
            </Text>
          </Box>
        </Flex>
      </Box>
    </Tooltip>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onCreate: () => void;
}

function EmptyState({ onCreate }: EmptyStateProps) {
  const features = [
    {
      icon: <LinkIcon />,
      title: 'Ссылки в кампаниях',
      desc: 'Структурируйте аналитику по каналам: Telegram, VK, блогеры, полиграфия, маркетплейсы',
    },
    {
      icon: <EditIcon />,
      title: 'UTM-конструктор',
      desc: 'Редактируйте ссылки, добавляйте UTM-метки и сохраняйте их в личном кабинете',
    },
    {
      icon: <InfoOutlineIcon />,
      title: 'Аналитика по кампании',
      desc: 'Общие и уникальные переходы, динамика кликов по дням и по часам',
    },
    {
      icon: <DownloadIcon />,
      title: 'Выгрузка отчета в CSV и Excel',
      desc: 'Таблица кликов за выбранный период',
    },
  ];

  return (
    <>
      <Box className="campaigns-page__empty-card">
        <Box className="campaigns-page__empty-icon">
          <InfoOutlineIcon />
        </Box>
        <Text className="campaigns-page__empty-title">
          Здесь появится список ваших кампаний
        </Text>
        <Text className="campaigns-page__empty-desc">
          Кампания объединяет ссылки одной акции по внешним каналам: Telegram,
          VK, блогеры, маркетплейсы, печатная полиграфия. Ссылки создаются с
          UTM-метками, а статистика собирается в общий дашборд.
        </Text>
        <Button
          bg="#3b6ea0"
          color="white"
          fontSize="14px"
          fontWeight={600}
          borderRadius="10px"
          px="24px"
          _hover={{ bg: '#34608c' }}
          _active={{ bg: '#2d547b' }}
          onClick={onCreate}
        >
          Создать первую кампанию
        </Button>
      </Box>

      <Box className="campaigns-page__features-section">
        <Heading className="campaigns-page__features-title">
          Больше возможностей <span>для вашего маркетинга</span>
        </Heading>
        <Text className="campaigns-page__features-subtitle">
          Объединяйте ссылки в рекламные кампании, привязывайте UTM-метки и
          оценивайте эффективность каждого канала.
        </Text>

        <Box className="campaigns-page__features-grid">
          {features.map((f) => (
            <Box key={f.title} className="campaigns-page__feature-card">
              <Box className="campaigns-page__feature-icon">{f.icon}</Box>
              <Box>
                <Text className="campaigns-page__feature-name">{f.title}</Text>
                <Text className="campaigns-page__feature-desc">{f.desc}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <Box className="campaigns-page__empty-card">
      <Box className="campaigns-page__error-icon">
        <InfoOutlineIcon />
      </Box>
      <Text className="campaigns-page__empty-title">
        Не удалось загрузить список кампаний
      </Text>
      <Text className="campaigns-page__empty-desc">
        Проверьте соединение и повторите. Ничего не потеряется.
      </Text>
      <Button
        bg="#3b6ea0"
        color="white"
        fontSize="14px"
        fontWeight={600}
        borderRadius="10px"
        px="24px"
        _hover={{ bg: '#34608c' }}
        _active={{ bg: '#2d547b' }}
        onClick={onRetry}
      >
        Повторить
      </Button>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(mockCampaigns);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editTarget, setEditTarget] = useState<CampaignRow | null>(null);
  const [pageState, setPageState] = useState<PageState>('has-data');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Загрузка кампаний из API (fallback — моки, если токен не задан)
  useEffect(() => {
    if (!isApiConfigured) return;
    let cancelled = false;
    fetchCampaigns()
      .then((data) => {
        if (!cancelled) {
          setCampaigns(data);
          setPageState('has-data');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPageState('error');
          toast({
            title: `Не удалось загрузить кампании: ${(err as Error).message}`,
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filtered = campaigns.filter((c) => {
    const q = searchText.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
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

  const handleSave = async (updated: CampaignRow) => {
    const isNew = !editTarget;

    if (isApiConfigured) {
      try {
        if (isNew) {
          const created = await createCampaign({
            name: updated.name,
            description: updated.description,
          });
          setCampaigns((prev) => [created, ...prev]);
          navigate(`/campaigns/${created.id}`);
        } else {
          await updateCampaign(updated.id, {
            name: updated.name,
            description: updated.description,
          });
          setCampaigns((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c)),
          );
        }
      } catch (err) {
        toast({
          title: `Не удалось сохранить кампанию: ${(err as Error).message}`,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
      return;
    }

    setCampaigns((prev) => {
      const exists = prev.find((c) => c.id === updated.id);
      if (exists) {
        return prev.map((c) => (c.id === updated.id ? updated : c));
      } else {
        return [updated, ...prev];
      }
    });

    if (isNew) {
      navigate(`/campaigns/${updated.id}`);
    }
  };

  const handleCreate = () => {
    setEditTarget(null);
    onOpen();
  };

  const handleRetry = () => {
    setPageState('has-data');
    if (!isApiConfigured) return;
    fetchCampaigns()
      .then((data) => {
        setCampaigns(data);
        setPageState('has-data');
      })
      .catch(() => setPageState('error'));
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

  // ─── Render content based on state ───────────────────────────────────────
  const renderContent = () => {
    if (pageState === 'error') {
      return <ErrorState onRetry={handleRetry} />;
    }

    if (pageState === 'empty') {
      return <EmptyState onCreate={handleCreate} />;
    }

    // has-data state
    return (
      <>
        {/* Toolbar */}
        <Flex className="campaigns-page__toolbar">
          <Box className="campaigns-page__search-wrapper">
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" h="42px">
                <SearchIcon color="#a1a1aa" />
              </InputLeftElement>
              <Input
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Поиск по названию"
                bg="white"
                borderColor="#e2e8f0"
                borderRadius="10px"
                h="42px"
                fontSize="14px"
                _hover={{ borderColor: '#a6c2de' }}
                _focus={{
                  borderColor: '#3b6ea0',
                  boxShadow: '0 0 0 1px #3b6ea0',
                }}
                _placeholder={{ color: '#a1a1aa' }}
              />
            </InputGroup>
          </Box>

          <Box flex={1} />

          <Button
            bg="#3b6ea0"
            color="white"
            fontSize="14px"
            fontWeight={600}
            borderRadius="10px"
            px="20px"
            h="42px"
            _hover={{ bg: '#34608c' }}
            _active={{ bg: '#2d547b' }}
            rightIcon={<Text fontSize="18px" lineHeight="1">+</Text>}
            onClick={handleCreate}
          >
            Создать кампанию
          </Button>
        </Flex>

        {/* Cards Grid */}
        {paged.length === 0 ? (
          <Box className="campaigns-page__empty-card">
            <Text className="campaigns-page__empty-title">
              Ничего не найдено
            </Text>
            <Text className="campaigns-page__empty-desc">
              Попробуйте изменить параметры поиска.
            </Text>
            <Button
              variant="outline"
              color="#3b6ea0"
              borderColor="#a6c2de"
              borderRadius="10px"
              fontSize="14px"
              fontWeight={500}
              _hover={{ bg: '#f0f5fa' }}
              onClick={() => {
                setSearchText('');
                setCurrentPage(1);
              }}
            >
              Сбросить поиск
            </Button>
          </Box>
        ) : (
          <>
            <Box className="campaigns-page__grid">
              {paged.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={handleEdit}
                />
              ))}
            </Box>

            {/* Pagination */}
            {filtered.length > 0 && (
              <Flex className="campaigns-page__pagination">
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
                      _hover={{
                        bg: safePage === p ? '#34608c' : '#f0f5fa',
                      }}
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
      </>
    );
  };

  return (
    <Box className="campaigns-page">
      <Box className="campaigns-page__container">
        <Heading className="campaigns-page__subtitle">Список кампаний</Heading>
        {renderContent()}
      </Box>

      {/* Debug State Switcher */}
      <DebugStateSwitcher currentState={pageState} onChange={setPageState} />

      {/* Edit / Create Modal */}
      {isOpen && (
        <EditCampaignModal
          key={editTarget ? editTarget.id : 'new'}
          campaign={editTarget}
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}
