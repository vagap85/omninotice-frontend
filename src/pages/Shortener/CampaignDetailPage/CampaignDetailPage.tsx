import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Tooltip,
  Portal,
  Spinner,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import qr from '@/assets/qr.svg';
import copy from '@/assets/copy.svg';
import {
  LinkIcon,
  ArrowForwardIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import DateRangeSelector from '@/components/shortener/DateRangeSelector/DateRangeSelector';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

import ProgressModal from '@/components/shortener/ProgressModal/ProgressModal';
import { mockCampaigns, mockLinks } from '@/mocks/shortener';
import {
  fetchCampaign,
  fetchLinks,
  fetchCampaignStatistics,
  buildRedirectUrl,
  isApiConfigured,
} from '@/api/shortener';
import { exportStatsCsv } from '@/utils/exportStatsCsv.ts';
import type {
  LinkRow,
  CampaignRow,
  LinkStatistics,
  DailyDataPoint,
  StatCard,
} from '@/types/shortener';
import { useToast } from '@chakra-ui/react';
import './CampaignDetailPage.scss';

const ITEMS_PER_PAGE = 7;

/** Демо-данные для режима без API (нет токена в .env.local) */
const FALLBACK_CAMPAIGN: CampaignRow = {
  id: 'unknown',
  name: 'Летняя распродажа',
  description: 'Три посадочные страницы: категория, хит и лендинг акции.',
  tags: [],
  createdAt: '2026-09-25T10:00:00.000Z',
  linksCount: 0,
  shortLinksCount: 0,
  totalClicks: 0,
};

const FALLBACK_STATS: LinkStatistics = {
  total: 830,
  unique: 830,
  byDay: [
    { date: '2026-09-07', value: 220 },
    { date: '2026-09-08', value: 140 },
    { date: '2026-09-09', value: 140 },
    { date: '2026-09-10', value: 0 },
    { date: '2026-09-11', value: 100 },
    { date: '2026-09-12', value: 90 },
    { date: '2026-09-13', value: 140 },
  ],
};

/** "2026-09-07" → "07.09" */
const formatDay = (date: string): string => {
  const [, month, day] = date.split('-');
  return `${day}.${month}`;
};

/** ISO 8601 → "07.09.2026" */
const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  // Дата без времени — разбираем по частям, чтобы не зависеть от таймзоны
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split('-');
    return `${day}.${month}.${year}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatNumber = (value: number): string => value.toLocaleString('ru-RU');

/** Код ссылки из shortUrl вида "localhost:8000/s/39B4Sc" или "omni/fbl2V" */
const extractShortcut = (shortUrl: string): string =>
  shortUrl.split('/').pop() || '';

/** Строка таблицы распределения по ссылкам кампании */
interface UtmSourceRow {
  name: string;
  shortUrl: string;
  targetUrl: string;
  channel: string;
  clicks: number;
  uniqueClicks: number;
  share: number;
}

const statusColors: Record<
  string,
  { color: string; bg: string; borderColor: string }
> = {
  активна: {
    color: 'var(--green-600)',
    bg: 'var(--icon-btn-hover)',
    borderColor: 'var(--green-200)',
  },
  неактивна: {
    color: 'var(--zinc-500)',
    bg: 'var(--zinc-100)',
    borderColor: 'var(--zinc-300)',
  },
  заблокирована: {
    color: 'var(--error)',
    bg: 'var(--red-50)',
    borderColor: 'var(--red-200)',
  },
};

type SortDir = 'asc' | 'desc';
type SortKey =
  'name' | 'shortUrl' | 'targetUrl' | 'channel' | 'status' | 'clicks';

const statusOrder: Record<LinkRow['status'], number> = {
  активна: 0,
  неактивна: 1,
  заблокирована: 2,
};

const sortableColumns: { key: SortKey; label: string; isNumeric?: boolean }[] =
  [
    { key: 'name', label: 'Название' },
    { key: 'shortUrl', label: 'Короткий URL' },
    { key: 'targetUrl', label: 'Целевой URL' },
    { key: 'channel', label: 'Канал' },
    { key: 'status', label: 'Статус' },
    { key: 'clicks', label: 'Переходы', isNumeric: true },
  ];

function SortIndicator({ dir }: { dir: SortDir | null }) {
  return (
    <svg
      style={{
        width: '16px',
        height: '16px',
        color: dir ? 'var(--text)' : 'var(--text-placeholder)',
        transition: 'color 0.2s',
      }}
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

function BreadcrumbsHeader({ name }: { name: string }) {
  const navigate = useNavigate();
  return (
    <Flex align="center" gap={2} fontSize="13px" mb={2} px="32px" pt="20px">
      <Text
        color="#3b6ea0"
        cursor="pointer"
        _hover={{ textDecoration: 'underline' }}
        onClick={() => navigate('/campaigns')}
      >
        Кампании
      </Text>
      <Text color="#a1a1aa">/</Text>
      <Text color="#52525b">{name}</Text>
    </Flex>
  );
}
export default function CampaignDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const notify = useMemo(() => ({ error: (msg: string) => toast({ title: msg, status: 'error', duration: 4000, isClosable: true }), success: (msg: string) => toast({ title: msg, status: 'success', duration: 4000, isClosable: true }) }), [toast]);
  const navigate = useNavigate();

  // Fallback-кампания для режима без API
  const fallbackCampaign = useMemo(
    () =>
      mockCampaigns.find((c) => c.id === id) || {
        ...FALLBACK_CAMPAIGN,
        id: id || 'unknown',
      },
    [id],
  );

  const [loadedCampaign, setLoadedCampaign] = useState<CampaignRow | null>(
    null,
  );
  const [links, setLinks] = useState<LinkRow[]>(() =>
    isApiConfigured
      ? []
      : mockLinks.filter((l) => l.campaign === fallbackCampaign.name),
  );
  const [stats, setStats] = useState<LinkStatistics | null>(null);
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(isApiConfigured);

  // Отображаемая кампания: загруженная из API, либо fallback
  const campaign: CampaignRow = loadedCampaign ?? fallbackCampaign;
  const effectiveStats = stats ?? (isApiConfigured ? null : FALLBACK_STATS);

  // Карточка кампании
  useEffect(() => {
    if (!isApiConfigured || !id) return;
    let cancelled = false;
    setIsLoading(true);
    fetchCampaign(id)
      .then((data) => {
        if (!cancelled) setLoadedCampaign(data);
      })
      .catch((err) => {
        if (!cancelled)
          notify.error(
            `Не удалось загрузить кампанию: ${(err as Error).message}`,
          );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Ссылки кампании (GET /shortcuts/?campaign_id=...)
  useEffect(() => {
    if (!isApiConfigured || !id) return;
    let cancelled = false;
    fetchLinks(id)
      .then((data) => {
        if (!cancelled) setLinks(data);
      })
      .catch((err) => {
        if (!cancelled)
          notify.error(
            `Не удалось загрузить ссылки кампании: ${(err as Error).message}`,
          );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Статистика кампании за выбранный период
  useEffect(() => {
    if (!isApiConfigured || !id) return;
    let cancelled = false;
    fetchCampaignStatistics(id, days)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled)
          notify.error(
            `Не удалось загрузить статистику: ${(err as Error).message}`,
          );
      });
    return () => {
      cancelled = true;
    };
  }, [id, days]);

  const [searchText, setSearchText] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const allChannels = Array.from(
    new Set(links.map((l) => l.tags[0] || 'Без канала')),
  ).sort();
  const allTags = Array.from(new Set(links.flatMap((l) => l.tags))).sort();

  const filteredLinks = links.filter((link) => {
    const query = searchText.toLowerCase();
    const matchesSearch =
      !query ||
      link.name.toLowerCase().includes(query) ||
      link.shortUrl.toLowerCase().includes(query) ||
      link.targetUrl.toLowerCase().includes(query) ||
      link.tags.some((t) => t.toLowerCase().includes(query));

    const channel = link.tags[0] || 'Без канала';
    const matchesChannel = !filterChannel || channel === filterChannel;
    const matchesTag = !filterTag || link.tags.includes(filterTag);
    return matchesSearch && matchesChannel && matchesTag;
  });

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

        const valA =
          sortKey === 'channel'
            ? a.tags[0] || ''
            : (a[sortKey as keyof LinkRow] as string);
        const valB =
          sortKey === 'channel'
            ? b.tags[0] || ''
            : (b[sortKey as keyof LinkRow] as string);
        return valA.localeCompare(valB, 'ru') * dir;
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
    setFilterChannel('');
    setFilterTag('');
    setCurrentPage(1);
  };

  const handleCopy = useCallback((link: LinkRow, e: React.MouseEvent) => {
    e.stopPropagation();
    // Редирект работает через шлюз: {API_BASE_URL}/s/{код}
    const fullUrl = buildRedirectUrl(
      link.shortcut || extractShortcut(link.shortUrl),
    );
    const markCopied = () => {
      setCopiedId(link.id);
      notify.success('Ссылка скопирована в буфер обмена');
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 2500);
    };
    navigator.clipboard
      .writeText(fullUrl)
      .then(markCopied)
      .catch(() => markCopied());
  }, []);

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

  const formattedDate = formatDate(campaign?.createdAt);

  // Статистика и графики
  const hasStats = (effectiveStats?.total ?? 0) > 0;

  const statCards: StatCard[] = effectiveStats
    ? [
        { label: 'Всего переходов', value: formatNumber(effectiveStats.total) },
        {
          label: 'Уникальных переходов',
          value: formatNumber(effectiveStats.unique),
        },
        {
          label: 'В среднем за день',
          value: formatNumber(
            effectiveStats.byDay.length
              ? Math.round(effectiveStats.total / effectiveStats.byDay.length)
              : 0,
          ),
        },
        (() => {
          const peak = effectiveStats.byDay.reduce<DailyDataPoint | null>(
            (best, point) => (!best || point.value > best.value ? point : best),
            null,
          );
          return peak
            ? {
                label: 'Пик',
                value: formatNumber(peak.value),
                sub: formatDay(peak.date),
              }
            : { label: 'Пик', value: '0' };
        })(),
      ]
    : [];

  const dailyData =
    effectiveStats?.byDay.map((point) => ({
      date: formatDay(point.date),
      value: point.value,
    })) ?? [];

  const periodLabel = effectiveStats?.byDay.length
    ? `${formatDate(effectiveStats.byDay[0].date)} — ${formatDate(
        effectiveStats.byDay[effectiveStats.byDay.length - 1].date,
      )}`
    : `Последние ${days} дней`;

  // Распределение переходов по ссылкам кампании (канал = первый тег)
  const utmSources: UtmSourceRow[] = useMemo(() => {
    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
    const total = totalClicks || 1;
    return [...links]
      .sort((a, b) => b.clicks - a.clicks)
      .map((l) => ({
        name: l.name,
        shortUrl: l.shortUrl,
        targetUrl: l.targetUrl,
        channel: l.tags[0] || 'Без канала',
        clicks: l.clicks,
        // В MVP unique == total (упрощение бэкенда)
        uniqueClicks: l.clicks,
        share: Math.round((l.clicks / total) * 100),
      }));
  }, [links]);

  const channelsCount = new Set(links.map((l) => l.tags[0] || 'Без канала'))
    .size;

  // Пока карточка кампании не загружена — показываем индикатор
  if (isApiConfigured && isLoading) {
    return (
      <Box className="campaign-detail">
        <BreadcrumbsHeader name='Карточка кампании' />
        <Box
          className="campaign-detail__container"
          py="80px"
          textAlign="center"
        >
          <Spinner color="var(--primary)" size="lg" />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="campaign-detail">
      <BreadcrumbsHeader name={campaign.name} />

      <Box className="campaign-detail__container">
        {/* Campaign Info Card */}
        <Box className="campaign-detail__info-card">
          <Heading className="campaign-detail__title">{campaign.name}</Heading>

          <Box mb={4}>
            <Text className="campaign-detail__label">Описание</Text>
            <Text className="campaign-detail__value">
              {campaign.description || 'Нет описания'}
            </Text>
          </Box>

          <Flex direction="column" gap={2} mb={4}>
            <Flex gap={2} align="center">
              <Text className="campaign-detail__label">Целевых URL</Text>
              <Text className="campaign-detail__value">
                {campaign.linksCount}
              </Text>
            </Flex>
            <Flex gap={2} align="center">
              <Text className="campaign-detail__label">Коротких ссылок</Text>
              <Text className="campaign-detail__value">
                {campaign.shortLinksCount}
              </Text>
            </Flex>
            <Flex gap={2} align="center">
              <Text className="campaign-detail__label">Каналов</Text>
              <Text className="campaign-detail__value">{channelsCount}</Text>
            </Flex>
          </Flex>

          <Text className="campaign-detail__date">
            Создана: {formattedDate}
          </Text>
        </Box>

        {/* Tabs Card */}
        <Box className="campaign-detail__tabs-card">
          <Tabs variant="line" colorScheme="blue">
            <TabList className="campaign-detail__tablist">
              <Tab className="campaign-detail__tab">Ссылки</Tab>
              <Tab className="campaign-detail__tab">Аналитика</Tab>
            </TabList>

            <TabPanels>
              {/* Ссылки */}
              <TabPanel p={0} pt={8}>
                {links.length === 0 ? (
                  <Box className="campaign-detail__empty-state">
                    <Box className="campaign-detail__empty-icon">
                      <LinkIcon />
                    </Box>
                    <Text className="campaign-detail__empty-title">
                      Добавьте в кампанию первую ссылку
                    </Text>
                    <Text className="campaign-detail__empty-desc">
                      Добавьте целевой URL посадочной страницы и UTM-метки к
                      нему через конструктор.
                    </Text>
                    <Button
                      bg="var(--primary)"
                      color="white"
                      fontSize="14px"
                      fontWeight={500}
                      borderRadius="8px"
                      px="20px"
                      h="40px"
                      _hover={{ bg: 'var(--btn-hover)' }}
                      _active={{ bg: 'var(--text-link)' }}
                      rightIcon={<ArrowForwardIcon />}
                      onClick={() =>
                        navigate(`/campaigns/${campaign.id}/add-link`)
                      }
                    >
                      Добавить ссылку в кампанию
                    </Button>
                  </Box>
                ) : (
                  <Box className="campaign-detail__links-list">
                    <Flex
                      className="campaign-detail__filters-row"
                      align="center"
                      gap={4}
                      mb={6}
                      flexWrap="wrap"
                    >
                      <InputGroup maxW="320px">
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          placeholder="Поиск по названию, URL или тегу"
                          bg="var(--bg-secondary)"
                          border="none"
                          fontSize="14px"
                          value={searchText}
                          onChange={handleFilterChange(setSearchText)}
                        />
                      </InputGroup>

                      <Select
                        maxW="150px"
                        bg="var(--bg-secondary)"
                        border="none"
                        fontSize="14px"
                        value={filterChannel}
                        onChange={handleFilterChange(setFilterChannel)}
                      >
                        <option value="">Все каналы</option>
                        {allChannels.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>

                      <Select
                        maxW="120px"
                        bg="var(--bg-secondary)"
                        border="none"
                        fontSize="14px"
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

                      {(searchText || filterChannel || filterTag) && (
                        <Button
                          variant="ghost"
                          fontSize="14px"
                          color="gray.600"
                          fontWeight={400}
                          onClick={resetFilters}
                        >
                          Сбросить фильтры
                        </Button>
                      )}

                      <Button
                        ml="auto"
                        bg="var(--primary)"
                        color="white"
                        fontSize="14px"
                        fontWeight={500}
                        borderRadius="8px"
                        px="20px"
                        h="40px"
                        _hover={{ bg: 'var(--btn-hover)' }}
                        _active={{ bg: 'var(--text-link)' }}
                        onClick={() =>
                          navigate(
                            `/campaigns/${campaign.id}/add-link`,
                          )
                        }
                      >
                        Добавить ссылку в кампанию +
                      </Button>
                    </Flex>

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
                        <Text
                          fontSize="18px"
                          fontWeight={700}
                          color="var(--text)"
                          mb="8px"
                        >
                          Ничего не найдено
                        </Text>
                        <Text
                          fontSize="14px"
                          color="var(--text-secondary)"
                          mb="20px"
                        >
                          Попробуйте изменить параметры поиска или сбросить
                          фильтры.
                        </Text>
                        <Button onClick={resetFilters}>Сбросить фильтры</Button>
                      </Box>
                    ) : (
                      <>
                        <Flex align="center" mb="12px">
                          <Text fontSize="13px" color="var(--text-secondary)">
                            Найдено:{' '}
                            <Text
                              as="span"
                              fontWeight={600}
                              color="var(--text)"
                            >
                              {filteredLinks.length}
                            </Text>{' '}
                            ссылок
                          </Text>
                        </Flex>
                        <Box
                          className="campaign-detail__table-wrapper"
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
                                      color="var(--text-secondary)"
                                      fontWeight={600}
                                      textTransform="none"
                                      borderColor="var(--slate-200)"
                                      isNumeric={col.isNumeric}
                                      cursor="pointer"
                                      onClick={() => handleSort(col.key)}
                                      _hover={{ bg: 'var(--bg-secondary)' }}
                                    >
                                      <Flex
                                        align="center"
                                        gap="4px"
                                        justify={
                                          col.isNumeric
                                            ? 'flex-end'
                                            : 'flex-start'
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
                                  color="var(--text-secondary)"
                                  fontWeight={600}
                                  textTransform="none"
                                  borderColor="var(--slate-200)"
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
                                    _hover={{ bg: 'var(--bg-secondary)' }}
                                    cursor="pointer"
                                    onClick={() =>
                                      navigate(
                                        `/campaigns/${campaign.id}/edit-link/${link.id}`,
                                      )
                                    }
                                  >
                                    <Td
                                      fontSize="14px"
                                      color="var(--text)"
                                      borderColor="var(--gray-50)"
                                      maxW="180px"
                                    >
                                      <Tooltip
                                        label={link.description}
                                        bg="var(--slate-800)"
                                        color="white"
                                        fontSize="12px"
                                        borderRadius="8px"
                                        p="10px 14px"
                                        hasArrow
                                        isDisabled={!link.description}
                                      >
                                        <Text noOfLines={1} fontWeight="500">
                                          {link.name}
                                        </Text>
                                      </Tooltip>
                                    </Td>
                                    <Td
                                      fontSize="14px"
                                      color="var(--primary)"
                                      borderColor="var(--gray-50)"
                                    >
                                      {link.shortUrl}
                                    </Td>
                                    <Td
                                      fontSize="13px"
                                      color="var(--text-secondary)"
                                      borderColor="var(--gray-50)"
                                      maxW="240px"
                                    >
                                      <Text noOfLines={1}>
                                        {link.targetUrl}
                                      </Text>
                                    </Td>
                                    <Td
                                      fontSize="13px"
                                      color="var(--text-secondary)"
                                      borderColor="var(--gray-50)"
                                      maxW="140px"
                                    >
                                      <Text noOfLines={1}>
                                        {link.tags[0]
                                          ? link.tags[0]
                                              .charAt(0)
                                              .toUpperCase() +
                                            link.tags[0].slice(1)
                                          : '-'}
                                      </Text>
                                    </Td>
                                    <Td borderColor="var(--gray-50)">
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
                                        {link.status}
                                      </Badge>
                                    </Td>
                                    <Td
                                      fontSize="14px"
                                      color="var(--text)"
                                      borderColor="var(--gray-50)"
                                      isNumeric
                                    >
                                      {link.clicks.toLocaleString('ru-RU')}
                                    </Td>
                                    <Td borderColor="var(--gray-50)">
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
                                          bg="var(--slate-800)"
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
                                                  className="campaign-detail__action-icon"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2.5"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  style={{
                                                    width: 16,
                                                    height: 16,
                                                  }}
                                                >
                                                  <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                              ) : (
                                                <img
                                                  src={copy}
                                                  alt="copy"
                                                  className="campaign-detail__action-icon"
                                                  style={{
                                                    width: 16,
                                                    height: 16,
                                                  }}
                                                />
                                              )
                                            }
                                            variant="ghost"
                                            size="sm"
                                            color={
                                              isCopied
                                                ? 'var(--green-600)'
                                                : 'var(--text-placeholder)'
                                            }
                                            bg={
                                              isCopied
                                                ? 'var(--icon-btn-hover)'
                                                : undefined
                                            }
                                            _hover={{
                                              color: isCopied
                                                ? 'var(--green-600)'
                                                : 'var(--primary)',
                                              bg: isCopied
                                                ? 'var(--icon-btn-hover)'
                                                : 'var(--slate-50-alt)',
                                            }}
                                            onClick={(e) => handleCopy(link, e)}
                                          />
                                        </Tooltip>
                                        <Tooltip
                                          label="Показать QR-код"
                                          bg="var(--slate-800)"
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
                                                className="campaign-detail__action-icon"
                                                style={{
                                                  width: 16,
                                                  height: 16,
                                                }}
                                              />
                                            }
                                            variant="ghost"
                                            size="sm"
                                            color="var(--text-placeholder)"
                                            _hover={{
                                              color: 'var(--primary)',
                                              bg: 'var(--slate-50-alt)',
                                            }}
                                          />
                                        </Tooltip>
                                        <Menu isLazy placement="bottom-end">
                                          <MenuButton
                                            as={IconButton}
                                            aria-label="Действия со ссылкой"
                                            icon={
                                              <Text
                                                className="campaign-detail__more-dots"
                                                fontWeight="bold"
                                              >
                                                ⋯
                                              </Text>
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="campaign-detail__more-btn"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <Portal>
                                            <MenuList
                                              className="campaign-detail__menu-list"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                              minW="240px"
                                              p="8px"
                                              borderRadius="12px"
                                              boxShadow="0 4px 20px rgba(0,0,0,0.1)"
                                            >
                                              <Box
                                                className="campaign-detail__menu-header"
                                                mb="8px"
                                                px="12px"
                                                py="4px"
                                              >
                                                <Text
                                                  className="campaign-detail__menu-title"
                                                  fontSize="11px"
                                                  fontWeight="600"
                                                  color="var(--text-placeholder)"
                                                  textTransform="uppercase"
                                                  letterSpacing="0.05em"
                                                >
                                                  Действия со ссылкой
                                                </Text>
                                              </Box>

                                              <MenuItem
                                                className="campaign-detail__menu-item"
                                                borderRadius="8px"
                                                _hover={{
                                                  bg: 'var(--bg-secondary)',
                                                }}
                                                px="12px"
                                                py="10px"
                                              >
                                                <Flex
                                                  className="campaign-detail__menu-item-icon"
                                                  mr="12px"
                                                  color="var(--slate-500)"
                                                >
                                                  <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.75"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{
                                                      width: 18,
                                                      height: 18,
                                                    }}
                                                  >
                                                    <polyline points="15 6 20 11 15 16" />
                                                    <path d="M4 19v-4a4 4 0 0 1 4-4h12" />
                                                  </svg>
                                                </Flex>
                                                <Text
                                                  className="campaign-detail__menu-item-text"
                                                  fontSize="14px"
                                                  color="var(--slate-700)"
                                                  fontWeight="500"
                                                >
                                                  Перенаправить на другой URL
                                                </Text>
                                              </MenuItem>

                                              <MenuItem
                                                className="campaign-detail__menu-item"
                                                borderRadius="8px"
                                                _hover={{
                                                  bg: 'var(--bg-secondary)',
                                                }}
                                                px="12px"
                                                py="10px"
                                              >
                                                <Flex
                                                  className="campaign-detail__menu-item-icon"
                                                  mr="12px"
                                                  color="var(--slate-500)"
                                                >
                                                  <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.75"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{
                                                      width: 18,
                                                      height: 18,
                                                    }}
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
                                                <Text
                                                  className="campaign-detail__menu-item-text"
                                                  fontSize="14px"
                                                  color="var(--slate-700)"
                                                  fontWeight="500"
                                                >
                                                  Добавить в кампанию
                                                </Text>
                                              </MenuItem>

                                              <MenuItem
                                                className="campaign-detail__menu-item"
                                                borderRadius="8px"
                                                _hover={{
                                                  bg: 'var(--bg-secondary)',
                                                }}
                                                px="12px"
                                                py="10px"
                                              >
                                                <Flex
                                                  className="campaign-detail__menu-item-icon"
                                                  mr="12px"
                                                  color="var(--slate-500)"
                                                >
                                                  <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.75"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{
                                                      width: 18,
                                                      height: 18,
                                                    }}
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
                                                <Text
                                                  className="campaign-detail__menu-item-text"
                                                  fontSize="14px"
                                                  color="var(--slate-700)"
                                                  fontWeight="500"
                                                >
                                                  Редактировать информацию
                                                </Text>
                                              </MenuItem>

                                              <MenuItem
                                                className="campaign-detail__menu-item"
                                                borderRadius="8px"
                                                _hover={{
                                                  bg: 'var(--bg-secondary)',
                                                }}
                                                px="12px"
                                                py="10px"
                                              >
                                                <Flex
                                                  className="campaign-detail__menu-item-icon"
                                                  mr="12px"
                                                  color="var(--slate-500)"
                                                >
                                                  {link.status ===
                                                  'неактивна' ? (
                                                    <svg
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth="1.75"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      style={{
                                                        width: 18,
                                                        height: 18,
                                                      }}
                                                    >
                                                      <polygon points="5 3 19 12 5 21" />
                                                    </svg>
                                                  ) : (
                                                    <svg
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth="1.75"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      style={{
                                                        width: 18,
                                                        height: 18,
                                                      }}
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
                                                <Text
                                                  className="campaign-detail__menu-item-text"
                                                  fontSize="14px"
                                                  color="var(--slate-700)"
                                                  fontWeight="500"
                                                >
                                                  {link.status === 'неактивна'
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
                          <Flex
                            justify="center"
                            mt="24px"
                            gap="4px"
                            align="center"
                          >
                            <IconButton
                              aria-label="Previous"
                              icon={<ChevronLeftIcon />}
                              variant="ghost"
                              size="sm"
                              color="var(--text-placeholder)"
                              isDisabled={safePage === 1}
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                            />
                            {paginationPages.map((p, idx) =>
                              p === '...' ? (
                                <Text
                                  key={`dots-${idx}`}
                                  color="var(--text-placeholder)"
                                  px="4px"
                                >
                                  ⋯
                                </Text>
                              ) : (
                                <Button
                                  key={p}
                                  size="sm"
                                  variant={safePage === p ? 'solid' : 'ghost'}
                                  bg={
                                    safePage === p
                                      ? 'var(--primary)'
                                      : 'transparent'
                                  }
                                  color={
                                    safePage === p
                                      ? 'white'
                                      : 'var(--text-secondary)'
                                  }
                                  borderRadius="8px"
                                  minW="36px"
                                  fontSize="14px"
                                  _hover={
                                    safePage === p
                                      ? {}
                                      : { bg: 'var(--slate-50-alt)' }
                                  }
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
                              color="var(--text-placeholder)"
                              isDisabled={safePage === totalPages}
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1),
                                )
                              }
                            />
                          </Flex>
                        )}
                      </>
                    )}
                  </Box>
                )}
              </TabPanel>

              {/* Аналитика */}
              <TabPanel p={0} pt={8}>
                <Box>
                  {/* Period Selector */}
                  <Flex align="center" gap="16px" mb="24px">
                    <DateRangeSelector onChange={setDays} />

                    <Box flex={1} />
                    <Button
                      variant="outline"
                      borderColor="var(--primary)"
                      color="var(--primary)"
                      fontSize="14px"
                      fontWeight={500}
                      borderRadius="10px"
                      _hover={{ bg: 'var(--slate-50-alt)' }}
                      onClick={() => setIsExportModalOpen(true)}
                    >
                      Экспорт в CSV/Excel
                    </Button>
                  </Flex>

                  {hasStats ? (
                    <>
                      {/* Stats Cards */}
                      <Flex gap="16px" mb="32px" flexWrap="wrap">
                        {statCards.map((stat) => (
                          <Box
                            key={stat.label}
                            bg="white"
                            borderRadius="12px"
                            p="20px 24px"
                            flex="1"
                            minW="180px"
                            border="1px solid var(--slate-200)"
                          >
                            <Text
                              fontSize="13px"
                              color="var(--text-placeholder)"
                              mb="6px"
                            >
                              {stat.label}
                            </Text>
                            <Text
                              fontSize="28px"
                              fontWeight={700}
                              color="var(--text)"
                            >
                              {stat.value}
                            </Text>
                            {stat.sub && (
                              <Text
                                fontSize="12px"
                                color="var(--text-placeholder)"
                                mt="2px"
                              >
                                {stat.sub}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Flex>

                      {/* Daily Chart */}
                      <Box
                        bg="white"
                        borderRadius="12px"
                        p="24px"
                        border="1px solid var(--slate-200)"
                      >
                        <Heading
                          fontSize="18px"
                          fontWeight={700}
                          color="var(--text)"
                          mb="20px"
                          fontFamily="'Inter', sans-serif"
                        >
                          Посуточная динамика переходов
                        </Heading>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={dailyData} barCategoryGap="30%">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="var(--gray-50)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              fontSize={12}
                              tickLine={false}
                              axisLine={{ stroke: 'var(--slate-200)' }}
                            />
                            <YAxis
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <RechartsTooltip />
                            <Bar
                              dataKey="value"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={48}
                            >
                              <LabelList
                                dataKey="value"
                                position="top"
                                fontSize={12}
                                fill="var(--primary)"
                                fontWeight={600}
                              />
                              {dailyData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={
                                    entry.value === 0
                                      ? 'var(--slate-200)'
                                      : 'var(--text-link)'
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </>
                  ) : (
                    <Box
                      bg="white"
                      borderRadius="12px"
                      p="80px 40px"
                      textAlign="center"
                      border="1px solid var(--slate-200)"
                    >
                      <Text
                        fontSize="18px"
                        fontWeight={700}
                        color="var(--text)"
                        mb="8px"
                      >
                        Переходов пока нет
                      </Text>
                      <Text fontSize="14px" color="var(--text-secondary)">
                        Статистика переходов появится здесь после первых кликов
                        аудитории.
                      </Text>
                    </Box>
                  )}

                  {/* UTM Sources Table */}
                  {hasStats && (
                    <Box mt="32px">
                      <Heading
                        fontSize="18px"
                        fontWeight={700}
                        color="var(--text)"
                        mb="20px"
                        fontFamily="'Inter', sans-serif"
                      >
                        Распределение по UTM-источникам
                      </Heading>
                      <Box overflowX="auto">
                        <Table
                          variant="unstyled"
                          sx={{
                            th: {
                              borderBottom: '1px solid var(--slate-200)',
                              pb: '12px',
                              pt: '0',
                            },
                            td: {
                              borderBottom: '1px solid var(--gray-50)',
                              py: '16px',
                            },
                          }}
                        >
                          <Thead>
                            <Tr>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                px="0"
                                pr="16px"
                              >
                                Название
                              </Th>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                px="16px"
                              >
                                Короткий URL
                              </Th>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                px="16px"
                              >
                                Целевой URL
                              </Th>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                px="16px"
                              >
                                Канал
                              </Th>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                cursor="pointer"
                                px="16px"
                              >
                                <Flex align="center" gap="4px">
                                  Переходы
                                  <SortIndicator dir="desc" />
                                </Flex>
                              </Th>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                cursor="pointer"
                                px="16px"
                              >
                                <Flex align="center" gap="4px">
                                  Уникальные переходы
                                  <SortIndicator dir={null} />
                                </Flex>
                              </Th>
                              <Th
                                fontSize="12px"
                                color="var(--text-secondary)"
                                fontWeight={600}
                                textTransform="none"
                                cursor="pointer"
                                px="16px"
                              >
                                <Flex align="center" gap="4px">
                                  Доля
                                  <SortIndicator dir={null} />
                                </Flex>
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {utmSources.map((source, idx) => (
                              <Tr
                                key={idx}
                                _hover={{ bg: 'var(--bg-secondary)' }}
                              >
                                <Td
                                  fontSize="13px"
                                  color="var(--text)"
                                  fontWeight={500}
                                  px="0"
                                  pr="16px"
                                >
                                  {source.name}
                                </Td>
                                <Td
                                  fontSize="13px"
                                  color="var(--primary)"
                                  px="16px"
                                >
                                  {source.shortUrl}
                                </Td>
                                <Td
                                  fontSize="13px"
                                  color="var(--text-secondary)"
                                  px="16px"
                                  maxW="240px"
                                >
                                  <Text noOfLines={1}>{source.targetUrl}</Text>
                                </Td>
                                <Td
                                  fontSize="13px"
                                  color="var(--text-secondary)"
                                  px="16px"
                                >
                                  {source.channel}
                                </Td>
                                <Td
                                  fontSize="13px"
                                  color="var(--text)"
                                  px="16px"
                                >
                                  {source.clicks.toLocaleString('ru-RU')}
                                </Td>
                                <Td
                                  fontSize="13px"
                                  color="var(--text)"
                                  px="16px"
                                >
                                  {source.uniqueClicks.toLocaleString('ru-RU')}
                                </Td>
                                <Td px="16px">
                                  <Box minW="100px" maxW="150px">
                                    <Text
                                      fontSize="13px"
                                      color="var(--text)"
                                      mb="6px"
                                    >
                                      {source.share}%
                                    </Text>
                                    <Box
                                      w="100%"
                                      h="4px"
                                      bg="var(--slate-50-alt)"
                                      borderRadius="2px"
                                      overflow="hidden"
                                    >
                                      <Box
                                        w={`${source.share}%`}
                                        h="100%"
                                        bg="var(--primary)"
                                      />
                                    </Box>
                                  </Box>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  )}
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      {isExportModalOpen && (
        <ProgressModal
          title="Экспортируем отчет"
          successMessage="Отчет сформирован\nФайл за выбранный период экспортирован."
          onComplete={() => {
            exportStatsCsv({
              shortUrl: campaign.name,
              targetUrl: campaign.description || '—',
              period: periodLabel,
              statCards,
              byDay: effectiveStats?.byDay ?? [],
            });
            setIsExportModalOpen(false);
          }}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </Box>
  );
}
