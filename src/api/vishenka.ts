import { getAccessTokenCookie, getAccountIdCookie } from '@/auth/authCookies';

/**
 * Клиент для Vishenka-services API.
 * POST {BASE_URL}/api/v1/dispatches
 * Dispatch-уведомления для in_app и Telegram.
 */

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

export class DispatchError extends Error {
  constructor(
    public status: number,
    public detail: unknown
  ) {
    super(`Dispatch error ${status}`);
    this.name = 'DispatchError';
  }
}

//!УБРАТЬ НА ПРОДАКШЕНЕ
//! ЭТО USERID ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ КОМАНДЫ ФОКУСА
export const ALL_RECIPIENTS_FALLBACK_ID =
  '9c4e2f5a-1115-4b7e-83fd-8eb64e4383b2';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_VISHENKA_BASE_URL;
  if (!url) {
    console.warn('VITE_VISHENKA_BASE_URL not set, using placeholder');
    return 'https://vishenka.skroy.ru';
  }
  return url.replace(/\/$/, '');
};

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
