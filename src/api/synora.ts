/**
 * Клиент для Synora API.
 * POST BASE_URL/event/send/{event_topic}
 * EventForEMail: send_to (email), template_name?, data?
 */

import { EventForEMail } from './types';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_SYNORA_BASE_URL;
  if (!url) {
    console.warn('VITE_SYNORA_BASE_URL not set, using placeholder');
    return 'https://api.synora.skroy.ru';
  }
  return url.replace(/\/$/, '');
};

const getSynoraProjectId = (): string => {
  const id = import.meta.env.VITE_SYNORA_PROJECT_ID?.trim();
  if (!id) {
    throw new Error(
      'VITE_SYNORA_PROJECT_ID is required (Synora header: Project-ID)'
    );
  }
  return id;
};

/** Топик для общего конвейера mail-send → MailSend (см. конфиг Synora). */
export function getSynoraMailTopic(): string {
  const t = import.meta.env.VITE_SYNORA_EVENT_TOPIC?.trim();
  return t || 'mail-send';
}

/** Имя шаблона в Synora; если не задано — выбор шаблона целиком на стороне сервера. */
export function getSynoraMailTemplateName(): string | undefined {
  const t = import.meta.env.VITE_SYNORA_MAIL_TEMPLATE?.trim();
  return t || undefined;
}

export async function sendEventEmail(
  eventTopic: string,
  payload: EventForEMail,
  signal?: AbortSignal
): Promise<{ event_id?: string; raw?: unknown }> {
  const base = getBaseUrl();
  const projectId = getSynoraProjectId();
  const res = await fetch(
    `${base}/event/send/${encodeURIComponent(eventTopic)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Project-ID': projectId
      },
      body: JSON.stringify(payload),
      ...(signal ? { signal } : {})
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Synora API error ${res.status}: ${text}`);
  }
  const json: unknown = await res.json().catch(() => ({}));

  // Synora может возвращать event_id в разных местах — нормализуем для удобства логирования.
  const asRecord = json as {
    event_id?: string;
    data?: Array<{ event_id?: string }>;
  };
  const event_id: string | undefined =
    asRecord?.event_id ?? asRecord?.data?.[0]?.event_id ?? undefined;

  return { event_id, raw: json };
}
