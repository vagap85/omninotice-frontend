import { CopyIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  HStack,
  Button,
  Tag,
  IconButton,
  Select,
  Spinner,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
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

import {
  fetchLink,
  fetchLinkStatistics,
  buildRedirectUrl,
  isApiConfigured,
} from '@/api/shortener';
import ProgressModal from '@/components/shortener/ProgressModal/ProgressModal';
import type {
  LinkRow,
  LinkStatistics,
  StatCard,
  DailyDataPoint,
} from '@/types/shortener';
import { exportStatsCsv } from '@/utils/exportStatsCsv';
import './LinkDetailPage.scss';

type CardState = 'data' | 'error' | 'waiting';

const statusStyles: Record<
  LinkRow['status'],
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

/** Демо-данные для режима без API (нет токена в .env.local) */
const FALLBACK_LINK: LinkRow = {
  id: '',
  name: 'Пост в Telegram',
  description: 'Для отслеживания рекламной кампании по акции «Черная пятница»',
  shortUrl: 'omni/fbl2V',
  shortcut: 'fbl2V',
  targetUrl:
    'https://shop.example.ru/landing/email?utm_source=omninotice&utm_medium=email',
  campaign: 'Без кампании',
  tags: ['text', 'text', 'text', 'text', 'text'],
  status: 'active',
  clicks: 5554,
};

const FALLBACK_STATS: LinkStatistics = {
  total: 5554,
  unique: 4332,
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

/** "2026-09-07" → "07.09.2026" */
const formatDayFull = (date: string): string => {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
};

/** ISO 8601 → "07.09.2026" */
const formatDate = (iso?: string): string => {
  if (!iso) return '—';
  // Дата без времени — разбираем по частям, чтобы не зависеть от таймзоны
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return formatDayFull(iso);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatNumber = (value: number): string => value.toLocaleString('ru-RU');

export default function LinkDetailPage() {
  const toast = useToast();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardState = (searchParams.get('state') as CardState) || 'data';
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [days, setDays] = useState(7);

  const [link, setLink] = useState<LinkRow | null>(null);
  const [stats, setStats] = useState<LinkStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(isApiConfigured);
  const [loadError, setLoadError] = useState('');

  const setCardState = (state: CardState) => {
    setSearchParams({ state });
  };

  // Карточка ссылки
  useEffect(() => {
    if (!isApiConfigured || !id) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await fetchLink(id);
        if (!cancelled) setLink(data);
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Статистика за выбранный период
  useEffect(() => {
    if (!isApiConfigured || !id) return;
    let cancelled = false;
    fetchLinkStatistics(id, days)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled)
          toast({
            title: 'Не удалось загрузить статистику',
            description: (err as Error).message,
            status: 'error',
            duration: 4000,
            isClosable: true
          });
      });
    return () => {
      cancelled = true;
    };
  }, [id, days, toast]);

  const effectiveLink = link ?? (isApiConfigured ? null : FALLBACK_LINK);
  const effectiveStats = stats ?? (isApiConfigured ? null : FALLBACK_STATS);
  const hasStats = (effectiveStats?.total ?? 0) > 0;

  const redirectUrl = effectiveLink
    ? buildRedirectUrl(
        effectiveLink.shortcut ||
          effectiveLink.shortUrl.split('/').pop() ||
          effectiveLink.id,
      )
    : '';

  const copyText = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() =>
        toast({
          title: message,
          status: 'success',
          duration: 4000,
          isClosable: true
        }),
      )
      .catch(() =>
        toast({
          title: 'Не удалось скопировать',
          status: 'error',
          duration: 4000,
          isClosable: true
        }),
      );
  };

  const dailyData =
    effectiveStats?.byDay.map((point) => ({
      date: formatDay(point.date),
      value: point.value,
    })) ?? [];

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

  const periodLabel = effectiveStats?.byDay.length
    ? `${formatDayFull(effectiveStats.byDay[0].date)} — ${formatDayFull(
        effectiveStats.byDay[effectiveStats.byDay.length - 1].date,
      )}`
    : `Последние ${days} дней`;

  return (
    <Box className="link-detail-page">
      <Box px="32px" py="28px">
        <Heading
          fontSize="28px"
          fontWeight={700}
          color="#12233f"
          mb="24px"
          fontFamily="'Inter', sans-serif"
        >
          {effectiveLink?.name || 'Карточка ссылки'}
        </Heading>

        {/* State Switcher */}
        <HStack spacing="8px" mb="20px">
          <Text fontSize="13px" color="#52525b" fontWeight={500}>
            Состояние карточки:
          </Text>
          {(['data', 'error', 'waiting'] as CardState[]).map((s) => (
            <Button
              key={s}
              size="xs"
              variant={cardState === s ? 'solid' : 'outline'}
              bg={cardState === s ? '#3b6ea0' : 'transparent'}
              color={cardState === s ? 'white' : '#3b6ea0'}
              borderColor="#a6c2de"
              borderRadius="6px"
              fontSize="12px"
              fontWeight={500}
              _hover={{ bg: cardState === s ? '#34608c' : '#f0f5fa' }}
              onClick={() => setCardState(s)}
            >
              {s === 'data'
                ? '📊 Данные'
                : s === 'error'
                  ? '❌ Ошибка'
                  : '⏳ Ожидание'}
            </Button>
          ))}
        </HStack>

        {isApiConfigured && isLoading && (
          <Box bg="white" borderRadius="16px" p="80px 40px" textAlign="center">
            <Spinner color="#3b6ea0" size="lg" />
          </Box>
        )}

        {isApiConfigured && !isLoading && loadError && (
          <Box
            bg="white"
            borderRadius="16px"
            p="80px 40px"
            textAlign="center"
            boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
          >
            <Text fontSize="18px" fontWeight={700} color="#12233f" mb="8px">
              Не удалось загрузить ссылку
            </Text>
            <Text fontSize="14px" color="#52525b" mb="24px">
              {loadError}
            </Text>
            <Button
              bg="#3b6ea0"
              color="white"
              fontSize="14px"
              fontWeight={600}
              borderRadius="10px"
              px="28px"
              h="44px"
              _hover={{ bg: '#34608c' }}
              onClick={() => setCardState('data')}
            >
              Повторить
            </Button>
          </Box>
        )}

        {/* Link Info Card */}
        {(!isApiConfigured || (!isLoading && !loadError)) && effectiveLink && (
          <Box
            bg="white"
            borderRadius="16px"
            p="28px 32px"
            mb="24px"
            boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
          >
            <Flex justify="space-between" align="flex-start" mb="20px">
              <Box>
                <Badge
                  px="16px"
                  py="6px"
                  borderRadius="8px"
                  fontSize="13px"
                  fontWeight={500}
                  color={statusStyles[effectiveLink.status].color}
                  bg={statusStyles[effectiveLink.status].bg}
                  border={`1px solid ${statusStyles[effectiveLink.status].borderColor}`}
                  textTransform="none"
                >
                  {statusLabels[effectiveLink.status]}
                </Badge>
                {effectiveLink.status === 'blocked' &&
                  effectiveLink.blockReason && (
                    <Text fontSize="13px" color="#ef4444" mt="8px" maxW="480px">
                      Причина: {effectiveLink.blockReason}
                    </Text>
                  )}
              </Box>
              <HStack spacing="4px">
                <Tooltip label="Показать QR-код" placement="top" hasArrow>
                  <IconButton
                    aria-label="QR"
                    icon={<Text fontSize="16px">⊞</Text>}
                    variant="ghost"
                    size="sm"
                    color="#a1a1aa"
                    _hover={{ color: '#3b6ea0', bg: '#f0f5fa' }}
                  />
                </Tooltip>
                <IconButton
                  aria-label="More"
                  icon={<Text>⋯</Text>}
                  variant="ghost"
                  size="sm"
                  color="#a1a1aa"
                  _hover={{ color: '#3b6ea0', bg: '#f0f5fa' }}
                />
              </HStack>
            </Flex>

            {/* Only show full info on data state, simplified on error/waiting */}
            {cardState === 'data' ? (
              <>
                <Flex gap="40px" mb="16px" flexWrap="wrap">
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Короткая ссылка
                    </Text>
                    <HStack spacing="8px">
                      <Text fontSize="14px" color="#3b6ea0" fontWeight={500}>
                        {effectiveLink.shortUrl}
                      </Text>
                      <IconButton
                        aria-label="Copy short"
                        icon={<CopyIcon />}
                        variant="ghost"
                        size="xs"
                        color="#a1a1aa"
                        _hover={{ color: '#3b6ea0' }}
                        onClick={() =>
                          copyText(
                            redirectUrl,
                            'Ссылка скопирована в буфер обмена',
                          )
                        }
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Целевой URL
                    </Text>
                    <HStack spacing="8px">
                      <Text
                        fontSize="14px"
                        color="#52525b"
                        noOfLines={1}
                        maxW="500px"
                      >
                        {effectiveLink.targetUrl}
                      </Text>
                      <IconButton
                        aria-label="Copy target"
                        icon={<CopyIcon />}
                        variant="ghost"
                        size="xs"
                        color="#a1a1aa"
                        _hover={{ color: '#3b6ea0' }}
                        onClick={() =>
                          copyText(
                            effectiveLink.targetUrl,
                            'Целевой URL скопирован',
                          )
                        }
                      />
                    </HStack>
                  </Box>
                </Flex>

                <Box mb="16px">
                  <Text fontSize="12px" color="#a1a1aa" mb="4px">
                    Описание
                  </Text>
                  <Text fontSize="14px" color="#12233f">
                    {effectiveLink.description || '—'}
                  </Text>
                </Box>

                <Box mb="16px">
                  <Text fontSize="12px" color="#a1a1aa" mb="6px">
                    Теги
                  </Text>
                  <HStack spacing="6px">
                    {effectiveLink.tags.map((tag, i) => (
                      <Tag
                        key={`${tag}-${i}`}
                        size="sm"
                        bg="#e6f0fa"
                        color="#3b6ea0"
                        borderRadius="6px"
                        fontSize="12px"
                        fontWeight={500}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                </Box>

                <Box mb="16px">
                  <Text fontSize="12px" color="#a1a1aa" mb="4px">
                    Кампания
                  </Text>
                  <Text fontSize="14px" color="#12233f" fontStyle="italic">
                    {effectiveLink.campaign || 'Без кампании'}
                  </Text>
                </Box>

                <Flex gap="40px">
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Создана
                    </Text>
                    <Text fontSize="14px" color="#12233f">
                      {formatDate(effectiveLink.createdAt)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Изменена
                    </Text>
                    <Text fontSize="14px" color="#12233f">
                      {effectiveLink.modifiedAt &&
                      effectiveLink.modifiedAt !== effectiveLink.createdAt
                        ? formatDate(effectiveLink.modifiedAt)
                        : '—'}
                    </Text>
                  </Box>
                </Flex>
              </>
            ) : (
              <>
                <Box mb="16px">
                  <Text fontSize="12px" color="#a1a1aa" mb="4px">
                    Описание
                  </Text>
                  <Text fontSize="14px" color="#12233f">
                    {effectiveLink.description || '—'}
                  </Text>
                </Box>

                <Flex gap="40px" mb="16px" flexWrap="wrap">
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Короткая ссылка
                    </Text>
                    <HStack spacing="8px">
                      <Text fontSize="14px" color="#3b6ea0" fontWeight={500}>
                        {effectiveLink.shortUrl}
                      </Text>
                      <IconButton
                        aria-label="Copy short"
                        icon={<CopyIcon />}
                        variant="ghost"
                        size="xs"
                        color="#a1a1aa"
                        _hover={{ color: '#3b6ea0' }}
                        onClick={() =>
                          copyText(
                            redirectUrl,
                            'Ссылка скопирована в буфер обмена',
                          )
                        }
                      />
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Исходный URL
                    </Text>
                    <HStack spacing="8px">
                      <Text
                        fontSize="14px"
                        color="#52525b"
                        noOfLines={1}
                        maxW="500px"
                      >
                        {effectiveLink.targetUrl}
                      </Text>
                      <IconButton
                        aria-label="Copy target"
                        icon={<CopyIcon />}
                        variant="ghost"
                        size="xs"
                        color="#a1a1aa"
                        _hover={{ color: '#3b6ea0' }}
                        onClick={() =>
                          copyText(
                            effectiveLink.targetUrl,
                            'Целевой URL скопирован',
                          )
                        }
                      />
                    </HStack>
                  </Box>
                </Flex>

                <Box mb="16px">
                  <Text fontSize="12px" color="#a1a1aa" mb="6px">
                    Теги
                  </Text>
                  <HStack spacing="6px">
                    {effectiveLink.tags.map((tag, i) => (
                      <Tag
                        key={`${tag}-${i}`}
                        size="sm"
                        bg="#e6f0fa"
                        color="#3b6ea0"
                        borderRadius="6px"
                        fontSize="12px"
                        fontWeight={500}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </HStack>
                </Box>

                <Flex gap="40px">
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Создана
                    </Text>
                    <Text fontSize="14px" color="#12233f">
                      {formatDate(effectiveLink.createdAt)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="12px" color="#a1a1aa" mb="4px">
                      Изменена
                    </Text>
                    <Text fontSize="14px" color="#12233f">
                      {effectiveLink.modifiedAt &&
                      effectiveLink.modifiedAt !== effectiveLink.createdAt
                        ? formatDate(effectiveLink.modifiedAt)
                        : '—'}
                    </Text>
                  </Box>
                </Flex>
              </>
            )}
          </Box>
        )}

        {/* Statistics Section */}
        {cardState === 'data' && effectiveLink && (
          <Box>
            {/* Period Selector */}
            <Flex align="center" gap="16px" mb="24px">
              <Select
                maxW="180px"
                bg="white"
                borderColor="#e2e8f0"
                borderRadius="10px"
                fontSize="14px"
                _hover={{ borderColor: '#a6c2de' }}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={7}>Последние 7 дней</option>
                <option value={30}>Последние 30 дней</option>
                <option value={90}>Последние 90 дней</option>
              </Select>
              <Text fontSize="14px" color="#52525b">
                📅 {periodLabel}
              </Text>
              <Box flex={1} />
              <Button
                variant="outline"
                borderColor="#3b6ea0"
                color="#3b6ea0"
                fontSize="14px"
                fontWeight={500}
                borderRadius="10px"
                _hover={{ bg: '#f0f5fa' }}
                onClick={() => setIsExportModalOpen(true)}
              >
                Экспорт в CSV/Excel
              </Button>
            </Flex>

            {hasStats && statCards.length > 0 ? (
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
                      border="1px solid #e2e8f0"
                    >
                      <Text fontSize="13px" color="#a1a1aa" mb="6px">
                        {stat.label}
                      </Text>
                      <Text fontSize="28px" fontWeight={700} color="#12233f">
                        {stat.value}
                      </Text>
                      {stat.sub && (
                        <Text fontSize="12px" color="#a1a1aa" mt="2px">
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
                  border="1px solid #e2e8f0"
                >
                  <Heading
                    fontSize="18px"
                    fontWeight={700}
                    color="#12233f"
                    mb="20px"
                    fontFamily="'Inter', sans-serif"
                  >
                    Посуточная динамика переходов
                  </Heading>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dailyData} barCategoryGap="30%">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f5"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
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
                          fill="#3b6ea0"
                          fontWeight={600}
                        />
                        {dailyData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.value === 0 ? '#e2e8f0' : '#2d547b'}
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
                borderRadius="16px"
                p="80px 40px"
                textAlign="center"
                boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
              >
                <Flex justify="center" mb="20px">
                  <Flex
                    w="56px"
                    h="56px"
                    borderRadius="full"
                    bg="#e6f0fa"
                    align="center"
                    justify="center"
                  >
                    <Text fontSize="24px">📊</Text>
                  </Flex>
                </Flex>
                <Text fontSize="18px" fontWeight={700} color="#12233f" mb="8px">
                  Переходов пока нет
                </Text>
                <Text fontSize="14px" color="#52525b">
                  Статистика переходов появится здесь после первых кликов
                  аудитории.
                </Text>
              </Box>
            )}
          </Box>
        )}

        {cardState === 'error' && (
          <Box
            bg="white"
            borderRadius="16px"
            p="80px 40px"
            textAlign="center"
            boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
          >
            <Flex justify="center" mb="20px">
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bg="#fef2f2"
                align="center"
                justify="center"
              >
                <Text fontSize="24px">📊</Text>
              </Flex>
            </Flex>
            <Text fontSize="18px" fontWeight={700} color="#12233f" mb="8px">
              Не удалось загрузить данные
            </Text>
            <Text fontSize="14px" color="#52525b" mb="24px">
              Проверьте соединение и повторите. Ничего не потеряется.
            </Text>
            <Button
              bg="#3b6ea0"
              color="white"
              fontSize="14px"
              fontWeight={600}
              borderRadius="10px"
              px="28px"
              h="44px"
              _hover={{ bg: '#34608c' }}
              _active={{ bg: '#2d547b' }}
              onClick={() => setCardState('data')}
            >
              Повторить
            </Button>
          </Box>
        )}

        {cardState === 'waiting' && (
          <Box
            bg="white"
            borderRadius="16px"
            p="80px 40px"
            textAlign="center"
            boxShadow="0px 1px 4px rgba(29, 79, 145, 0.05)"
          >
            <Flex justify="center" mb="20px">
              <Flex
                w="56px"
                h="56px"
                borderRadius="full"
                bg="#e6f0fa"
                align="center"
                justify="center"
              >
                <Text fontSize="24px">📊</Text>
              </Flex>
            </Flex>
            <Text fontSize="18px" fontWeight={700} color="#12233f" mb="8px">
              Ссылка активна
            </Text>
            <Text fontSize="14px" color="#52525b">
              Статистика переходов появится здесь после первых кликов аудитории.
            </Text>
          </Box>
        )}
      </Box>

      {isExportModalOpen && (
        <ProgressModal
          title="Экспортируем отчет"
          successMessage="Отчет сформирован\nФайл за выбранный период экспортирован."
          onComplete={() => {
            exportStatsCsv({
              shortUrl: effectiveLink?.shortUrl || '',
              targetUrl: effectiveLink?.targetUrl || '',
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
