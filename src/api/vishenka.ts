import { getAccessTokenCookie, getAccountIdCookie } from '@/auth/authCookies';
import type { NotificationTemplate } from '@/types/template';
import type {
  ConnectedApp,
  ConnectedAppsResponseRaw,
  DispatchLog,
  DispatchRequest,
  RawDispatchLog,
  SuccessfulResponse
} from './types';

/* ────────────────────────────── BASE URL ────────────────────────────── */

const DEFAULT_BASE_URL = 'https://vishenka.skroy.ru';
const CFG_BASE_URL = 'https://cfg.basis.skroy.ru';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_VISHENKA_BASE_URL;
  if (!url) {
    console.warn('VITE_VISHENKA_BASE_URL not set, using placeholder');
    return DEFAULT_BASE_URL;
  }
  return url.replace(/\/$/, '');
};

const getProjectId = (): string => {
  const projectId = import.meta.env.VITE_SYNORA_PROJECT_ID;
  if (!projectId) {
    throw new Error('VITE_SYNORA_PROJECT_ID не задан в .env');
  }
  return projectId;
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
    message: string,
    public code: 'HTTP_ERROR' | 'INVALID_RESPONSE' = 'HTTP_ERROR'
  ) {
    super(message);
    this.name = 'TemplatesError';
  }
}

/* ────────────────────────────── DISPATCH ────────────────────────────── */

export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
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

const TEMPLATE_CHANNELS = new Set([
  'cherry',
  'email',
  'sms',
  'telegram',
  'max'
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNotificationTemplate(value: unknown): value is NotificationTemplate {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    typeof value.channel === 'string' &&
    TEMPLATE_CHANNELS.has(value.channel) &&
    Array.isArray(value.variables) &&
    value.variables.every(
      (variable) =>
        isRecord(variable) &&
        typeof variable.key === 'string' &&
        typeof variable.label === 'string' &&
        (variable.isAutoFilled === undefined ||
          typeof variable.isAutoFilled === 'boolean')
    ) &&
    typeof value.updatedAt === 'string' &&
    typeof value.usageCount === 'number' &&
    Number.isFinite(value.usageCount) &&
    (value.buttonText === undefined || typeof value.buttonText === 'string')
  );
}

export async function getTemplates(
  forceRefresh = false
): Promise<NotificationTemplate[]> {
  if (cachedTemplates && !forceRefresh) {
    return cachedTemplates;
  }

  const baseUrl = getBaseUrl();
  const projectId = getProjectId();

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

  const json: unknown = await response.json();
  if (
    !isRecord(json) ||
    !Array.isArray(json.data) ||
    !json.data.every(isNotificationTemplate)
  ) {
    throw new TemplatesError(
      response.status,
      'Ответ сервера содержит шаблоны в неверном формате. Пожалуйста, войдите в аккаунт повторно.',
      'INVALID_RESPONSE'
    );
  }

  const data = json.data;
  cachedTemplates = data;
  return data;
}

export function invalidateTemplatesCache(): void {
  cachedTemplates = null;
}

/* ────────────────────────────── CONNECTED APPS ────────────────────────────── */

let cachedConnectedApps: ConnectedApp[] | null = null;

export async function getConnectedApps(
  forceRefresh = false
): Promise<ConnectedApp[]> {
  if (cachedConnectedApps && !forceRefresh) {
    return cachedConnectedApps;
  }

  const token = getAccessTokenCookie();
  if (!token) {
    throw new Error('Токен авторизации не найден.');
  }

  const account_id = getAccountIdCookie();
  if (!account_id) {
    throw new Error('Не удалось определить аккаунт (account_id не найден).');
  }

  const projectId = getProjectId();
  const url = `${CFG_BASE_URL}/account/${account_id}/settings/connected_apps`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Project-ID': projectId,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Не удалось загрузить подключенные приложения: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as ConnectedAppsResponseRaw;
  const apps: ConnectedApp[] = [];

  if (json.data && Array.isArray(json.data)) {
    json.data.forEach((item) => {
      if (item.settings) {
        Object.values(item.settings).forEach((setting) => {
          if (Array.isArray(setting?.connected_apps)) {
            apps.push(...setting.connected_apps);
          }
        });
      }
    });
  }

  cachedConnectedApps = apps;
  return apps;
}

export function invalidateConnectedAppsCache(): void {
  cachedConnectedApps = null;
}

/* ────────────────────────────── DISPATCH LOGS ────────────────────────────── */

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
