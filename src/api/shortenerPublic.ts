import type { LinkData, UrlSafetyData, QrCodeData } from '@/types/shortener';

const API_BASE_URL = import.meta.env.VITE_SHORTENER_API_URL || 'http://localhost:8000';

// ---------- Формат ответов API ----------
interface ApiResponse<T> {
  detail: { code: string; message: string };
  data: T[];
  info: Record<string, unknown>;
}

// Используем для первичной обработки ответа — до нормализации API-слоем.
interface RawShortcutData {
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  isSecure: boolean;
  shortcut_id: string; // snake_case — так отдаёт бэкенд
  shortcut: string;
  securityScore: number;
}

// ---------- Вспомогательная функция обработки ошибки ----------
const handleError = async (
  response: Response,
  fallbackMessage: string,
): Promise<never> => {
  let message = fallbackMessage;
  let code = 'UNKNOWN';

  try {
    const errorData = await response.json();
    if (errorData?.detail?.message) {
      message = errorData.detail.message;
      code = errorData.detail.code || code;
    }
  } catch {
    // игнорируем ошибку парсинга
  }

  const error = new Error(message);
  (error as Error & { code?: string }).code = code;
  throw error;
};

// ---------- Публичные функции ----------

// POST /public/shortcut/ — создать короткую ссылку
export const createShortcut = async (url: string): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/public/shortcut/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    await handleError(response, 'Ошибка при создании ссылки');
  }

  const data: ApiResponse<RawShortcutData> = await response.json();
  const raw = data.data[0];

  return {
    shortUrl: raw.shortUrl,
    originalUrl: raw.originalUrl,
    createdAt: raw.createdAt,
    isSecure: raw.isSecure,
    shortcut: raw.shortcut,
    shortcutId: raw.shortcut_id, // нормализация ключа
    securityScore: raw.securityScore,
  };
};

// POST /public/check-url/ — проверить URL
export const checkUrlSafety = async (
  url: string,
  signal?: AbortSignal,
): Promise<UrlSafetyData> => {
  const response = await fetch(`${API_BASE_URL}/public/check-url/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal,
  });

  if (!response.ok) {
    await handleError(response, 'Ошибка при проверке URL');
  }

  const data: ApiResponse<UrlSafetyData> = await response.json();
  return data.data[0];
};

// GET /public/qr/{code} — получить QR-код
export const getQrCode = async (shortcutCode: string): Promise<QrCodeData> => {
  const response = await fetch(`${API_BASE_URL}/public/qr/${shortcutCode}`);

  if (!response.ok) {
    await handleError(response, 'Ошибка при получении QR-кода');
  }

  const data: ApiResponse<QrCodeData> = await response.json();
  return data.data[0];
};

// POST /shortcut/{code}/claim — закрепить гостевую ссылку после авторизации
export const claimShortcut = async (
  shortcutCode: string,
  projectId: string,
  accessToken: string,
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/shortcut/${shortcutCode}/claim`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Project-ID': projectId,
      },
    },
  );

  if (!response.ok) {
    await handleError(response, 'Не удалось закрепить ссылку');
  }
};
