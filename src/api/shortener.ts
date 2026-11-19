import type {
  LinkRow,
  CampaignRow,
  TagItem,
  LinkStatistics,
  DailyDataPoint,
} from '@/types/shortener';

// URL API. Задаётся в .env.local (VITE_SHORTENER_API_URL).
const API_BASE_URL = import.meta.env.VITE_SHORTENER_API_URL || 'http://localhost:8000';

// Демо-токен JWT и Project-ID для тестового окружения.
const DEMO_TOKEN = (import.meta.env.VITE_SHORTENER_DEMO_TOKEN as string) || '';
const DEMO_PROJECT_ID = (import.meta.env.VITE_SHORTENER_PROJECT_ID as string) || '';

export const isApiConfigured = Boolean(DEMO_TOKEN && DEMO_PROJECT_ID);

interface ApiResponse<T> {
  detail: { code: string; message: string };
  data: T[];
  info: Record<string, unknown>;
}

interface ApiShortcut {
  shortcutId: string;
  title: string;
  target: string;
  description?: string | null;
  shortUrl: string;
  shortcut: string;
  status: 'active' | 'inactive' | 'blocked';
  blockReason?: string | null;
  qrImageUrl?: string | null;
  clicksCount: number;
  createdAt: string;
  modifiedAt: string;
  tags?: string[];
  campaignId?: string | null;
  campaign?: string | null;
}

interface ApiCampaign {
  campaignId: string;
  name: string;
  description?: string | null;
  tags?: string[];
  linksCount: number;
  totalClicks: number;
  createdAt: string;
  modifiedAt: string;
}

interface ApiTag {
  name: string;
  count: number;
}

interface ApiStatistics {
  total: number;
  unique: number;
  byDay?: { date: string; value: number }[];
  linksCount?: number | null;
}

interface ApiError extends Error {
  status?: number;
}

// Маппер статусов — API возвращает английские значения, используем напрямую
const linkStatusToEn = (status: ApiShortcut['status']): LinkRow['status'] => status;

export const toLinkRow = (item: ApiShortcut): LinkRow => ({
  id: item.shortcutId,
  name: item.title,
  description: item.description || '',
  shortUrl: item.shortUrl,
  shortcut: item.shortcut,
  targetUrl: item.target,
  campaign: item.campaign || 'Без кампании',
  tags: item.tags || [],
  status: linkStatusToEn(item.status),
  blockReason: item.blockReason ?? null,
  clicks: item.clicksCount,
  createdAt: item.createdAt,
  modifiedAt: item.modifiedAt,
});

const toCampaignRow = (campaign: ApiCampaign): CampaignRow => ({
  id: campaign.campaignId,
  name: campaign.name,
  description: campaign.description || '',
  linksCount: campaign.linksCount,
  shortLinksCount: campaign.linksCount,
  totalClicks: campaign.totalClicks,
  createdAt: campaign.createdAt,
  modifiedAt: campaign.modifiedAt,
  tags: campaign.tags || [],
});

const toStatistics = (raw: ApiStatistics): LinkStatistics => ({
  total: raw.total,
  unique: raw.unique,
  byDay: (raw.byDay || []) as DailyDataPoint[],
  linksCount: raw.linksCount ?? null,
});

const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${DEMO_TOKEN}`,
  'Project-ID': DEMO_PROJECT_ID,
});

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });

  if (!response.ok) {
    let message = 'Ошибка сервера';
    try {
      const errorData = await response.json();
      message = errorData?.detail?.message || message;
    } catch {
      // игнорируем ошибку парсинга
    }
    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ---------- Ссылки ----------

export const fetchLinks = async (): Promise<LinkRow[]> => {
  const data = await request<ApiResponse<ApiShortcut>>('/shortcuts/');
  return data.data.map(toLinkRow);
};

export const fetchLink = async (id: string): Promise<LinkRow> => {
  const data = await request<ApiResponse<ApiShortcut>>(`/shortcut/${id}`);
  return toLinkRow(data.data[0]);
};

export interface CreateLinkInput {
  title: string;
  target: string;
  description?: string;
  tags?: string[];
  campaign_id?: string | null;
}

export const createLink = async (input: CreateLinkInput): Promise<LinkRow> => {
  const data = await request<{
    data: {
      shortcutId: string;
      shortUrl: string;
      shortcut: string;
      status: 'active';
    }[];
  }>('/shortcut/', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  const raw = data.data[0];

  return {
    id: raw.shortcutId,
    name: input.title,
    description: input.description || '',
    shortUrl: raw.shortUrl,
    shortcut: raw.shortcut,
    targetUrl: input.target,
    campaign: 'Без кампании',
    tags: input.tags || [],
    status: 'active',
    clicks: 0,
  };
};

export interface UpdateLinkInput {
  title?: string;
  target?: string;
  description?: string;
  tags?: string[];
  campaign_id?: string | null;
}

export const updateLink = (
  id: string,
  input: UpdateLinkInput,
): Promise<unknown> =>
  request<unknown>(`/shortcut/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const setLinkStatus = (
  id: string,
  status: 'active' | 'inactive',
): Promise<unknown> =>
  request<unknown>(`/shortcut/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ---------- Статистика ----------

/** Статистика кликов по ссылке. days — период (по умолчанию 30). */
export const fetchLinkStatistics = async (
  id: string,
  days = 30,
): Promise<LinkStatistics> => {
  const data = await request<ApiResponse<ApiStatistics>>(
    `/shortcut/${id}/statistics?days=${days}`,
  );
  return toStatistics(data.data[0]);
};

/** Статистика кликов по кампании (с linksCount). */
export const fetchCampaignStatistics = async (
  id: string,
  days = 30,
): Promise<LinkStatistics> => {
  const data = await request<ApiResponse<ApiStatistics>>(
    `/campaign/${id}/statistics?days=${days}`,
  );
  return toStatistics(data.data[0]);
};

// ---------- Кампании ----------

export const fetchCampaigns = async (): Promise<CampaignRow[]> => {
  const data = await request<ApiResponse<ApiCampaign>>('/campaigns/');
  return data.data.map(toCampaignRow);
};

export const fetchCampaign = async (id: string): Promise<CampaignRow> => {
  const data = await request<ApiResponse<ApiCampaign>>(`/campaign/${id}`);
  return toCampaignRow(data.data[0]);
};

export interface CreateCampaignInput {
  name: string;
  description?: string;
  tags?: string[];
}

export const createCampaign = async (
  input: CreateCampaignInput,
): Promise<CampaignRow> => {
  const data = await request<ApiResponse<ApiCampaign>>('/campaign/', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return toCampaignRow(data.data[0]);
};

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  tags?: string[];
}

export const updateCampaign = (
  id: string,
  input: UpdateCampaignInput,
): Promise<unknown> =>
  request<unknown>(`/campaign/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

// ---------- Теги ----------

/** Список тегов текущего проекта: [{ name, count }] */
export const fetchTags = async (): Promise<TagItem[]> => {
  const data = await request<ApiResponse<ApiTag>>('/tags/');
  return data.data.map((tag) => ({ name: tag.name, count: tag.count }));
};

// ---------- Редирект ----------

/** Построить URL редиректа через базу: {API_BASE_URL}/s/{код} */
export const buildRedirectUrl = (shortcut: string): string =>
  `${API_BASE_URL}/s/${shortcut}`;

// Получить id кампании по имени, при отсутствии — создать новую.
export const ensureCampaignId = async (
  name: string,
): Promise<string | null> => {
  if (!name || name === 'Без кампании') return null;
  const existing = await fetchCampaigns();
  const found = existing.find((campaign) => campaign.name === name);
  if (found) return found.id;
  const created = await createCampaign({ name });
  return created.id;
};
