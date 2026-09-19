/**
 * Клиент для Vishenka-services API.
 * POST {BASE_URL}/api/v1/dispatches
 * In-App уведомления (лента + плашка).
 */

export interface DispatchRequest {
  request_id: string;              // UUID, генерирует фронт
  application_id: string;          // "sigma", "raida", ...
  channel: 'feed' | 'popup';       // UC-02 / UC-02a
  title: string;                   // 1-200
  body: string;                    // 1-4000
  audience_type: 'all' | 'selected';
  recipient_ids: string[];         // обязательно при selected
}

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
    public detail: unknown,
  ) {
    super(`Dispatch error ${status}`);
    this.name = 'DispatchError';
  }
}

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
): Promise<SuccessfulResponse> {
  const base = getBaseUrl();

  const response = await fetch(`${base}/api/v1/dispatches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new DispatchError(response.status, error.detail);
  }

  return response.json();
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