import { getAccessTokenCookie, getAccountIdCookie } from '@/auth/authCookies';
import type { NotificationTemplate } from '@/types/template';
/* ────────────────────────────── BASE URL ────────────────────────────── */

const DEFAULT_BASE_URL = 'https://vishenka.skroy.ru';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_VISHENKA_BASE_URL;
  if (!url) {
    console.warn('VITE_VISHENKA_BASE_URL not set, using placeholder');
    return DEFAULT_BASE_URL;
  }
  return url.replace(/\/$/, '');
};

/* ────────────────────────────── ОШИБКИ ────────────────────────────── */

export class DispatchError extends Error {
  constructor(
    public status: number,
    public detail: unknown
  ) {
    super(`Dispatch error ${status}`);
    this.name = 'DispatchError';
  }
}

export class TemplatesError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'TemplatesError';
  }
}

/* ────────────────────────────── DISPATCH ────────────────────────────── */

export interface DispatchRequest {
  request_id: string; // UUID, генерирует фронт
  delegated_token: string;
  account_id: string;
  application_id: string; // "sigma", "raida", ...
  channels: Array<'in_app' | 'tg'>;
  title: string; // 1-200
  body: string; // 1-4000
  recipients: string[];
  created_at: string;
  action?: DispatchAction;
  picture?: {
    main: string;
    icon: string;
    emoji: string;
  };
}

export type DispatchAction =
  | {
      title: string;
      url: string;
      type: 'button';
    }
  | {
      name: string;
      url: string;
    };

export interface ResponseDetail {
  code: 'OK' | 'ALREADY_APPLIED' | null;
  message: string | null;
}

export interface DispatchData {
  request_id: string;
  status: 'accepted' | 'replayed' | 'failed';
  already_applied: boolean;
  author_user_id: string;
  created_at: string;
}

export interface ResponseInfo {
  api_version: string;
  count?: number;
  total?: number;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}

export interface SuccessfulResponse {
  detail: ResponseDetail;
  data: DispatchData[];
  info: ResponseInfo;
}

//!УБРАТЬ НА ПРОДАКШЕНЕ
//! ЭТО USERID ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ КОМАНДЫ ФОКУСА
export const ALL_RECIPIENTS_FALLBACK_ID =
  '9c4e2f5a-1115-4b7e-83fd-8eb64e4383b2';

/** Генератор UUID для `request_id` (крипто-стойкий, если доступен). */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback для старых браузеров
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createDispatch(
  payload: DispatchRequest,
  signal?: AbortSignal
): Promise<SuccessfulResponse> {
  const base = getBaseUrl();

  const response = await fetch(`${base}/api/v1/dispatches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    ...(signal ? { signal } : {})
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new DispatchError(response.status, error.detail);
  }

  return response.json();
}

export type NotificationDispatchInput = Omit<
  DispatchRequest,
  'request_id' | 'delegated_token' | 'account_id' | 'created_at'
>;

export async function dispatchNotification(
  payload: NotificationDispatchInput,
  signal?: AbortSignal
): Promise<SuccessfulResponse> {
  const delegated_token = getAccessTokenCookie();
  if (!delegated_token) {
    throw new Error(
      'Не удалось получить omni_access_token для отправки уведомления.'
    );
  }

  const account_id = getAccountIdCookie();
  if (!account_id) {
    throw new Error('Не удалось определить аккаунт для отправки уведомления.');
  }

  return createDispatch(
    {
      ...payload,
      request_id: generateRequestId(),
      delegated_token,
      account_id,
      created_at: new Date().toISOString()
    },
    signal
  );
}

/* ────────────────────────────── TEMPLATES ────────────────────────────── */

let cachedTemplates: NotificationTemplate[] | null = null;

export async function getTemplates(
  forceRefresh = false
): Promise<NotificationTemplate[]> {
  if (cachedTemplates && !forceRefresh) {
    return cachedTemplates;
  }

  const baseUrl = getBaseUrl();
  const projectId = import.meta.env.VITE_SYNORA_PROJECT_ID;

  if (!projectId) {
    throw new Error('VITE_SYNORA_PROJECT_ID не задан в .env');
  }

  const token = getAccessTokenCookie();

  if (!token) {
    throw new Error('Токен авторизации не найден. Пожалуйста, авторизуйтесь.');
  }

  const response = await fetch(`${baseUrl}/api/v1/templates`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Project-ID': projectId,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new TemplatesError(
        response.status,
        'Ошибка авторизации. Проверьте токен.'
      );
    }
    throw new TemplatesError(
      response.status,
      `Ошибка загрузки шаблонов: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  const data = (json.data || []) as NotificationTemplate[];

  cachedTemplates = data;

  return data;
}

export function invalidateTemplatesCache(): void {
  cachedTemplates = null;
}

/* ────────────────────────────── DISPATCH LOGS ────────────────────────────── */

interface RawDispatchLog {
  event_id?: string;
  application_id?: string;
  channel?: string;
  send_method?: string;
  title?: string;
  body?: string;
  audience_type?: string;
  recipients?: string[];
  account_id?: string;
  created_at?: string;
  status?: string;
  template_name?: string;
  [key: string]: unknown;
}

export interface DispatchLog {
  event_id: string;
  application_id: string;
  channel: string;
  send_method: string;
  title: string;
  body: string;
  audience_type: string;
  recipients: string[];
  account_id: string;
  created_at: string;
  status: string;
  template_name: string;
}

export interface DispatchLogsResponse {
  data: DispatchLog[];
  info?: {
    total?: number;
    page?: number;
    per_page?: number;
  };
}

export async function getDispatchLogs(
  page: number = 1,
  perPage: number = 6,
  signal?: AbortSignal
): Promise<DispatchLogsResponse> {
  const baseUrl = getBaseUrl();
  const token = getAccessTokenCookie();

  if (!token) {
    throw new Error('Токен авторизации не найден. Пожалуйста, авторизуйтесь.');
  }

  const url = new URL(`${baseUrl}/info/dispatches/logs`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('per_page', perPage.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    ...(signal ? { signal } : {})
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Ошибка авторизации. Проверьте токен.');
    }
    throw new Error(
      `Ошибка загрузки журнала: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();

  // Бэкенд может не возвращать некоторые поля (например, recipients).
  const mappedData: DispatchLog[] = (
    Array.isArray(json.data) ? json.data : []
  ).map((item: RawDispatchLog) => ({
    event_id: item.event_id ?? '',
    application_id: item.application_id ?? '',
    title: item.title ?? 'Без названия',
    created_at: item.created_at ?? new Date().toISOString(),
    status: item.status ?? 'error',
    send_method: item.send_method ?? 'manual',

    channel: item.channel ?? 'popup',
    body: item.body ?? '',
    audience_type: item.audience_type ?? 'all',
    recipients: item.recipients ?? [],
    account_id: item.account_id ?? 'none',
    template_name: item.template_name ?? 'Без шаблона'
  }));

  return {
    data: mappedData,
    info: json.info
  };
}
