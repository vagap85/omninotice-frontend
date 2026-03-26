/**
 * Клиент для Synora API.
 * POST BASE_URL/event/send/{event_topic}
 * EventForEMail: send_to (email), template_name?, data?
 */

export interface EventForEMail {
  send_to: string
  template_name?: string
  data?: Record<string, unknown>
}

export interface EventForAPI {
  send_to: string
  answer_to?: string
  method: string
  data: Record<string, unknown>
  headers?: Record<string, string>
}

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_SYNORA_BASE_URL
  if (!url) {
    console.warn('VITE_SYNORA_BASE_URL not set, using placeholder')
    return 'https://api.synora.skroy.ru'
  }
  return url.replace(/\/$/, '')
}

export async function sendEventEmail(
  eventTopic: string,
  payload: EventForEMail
): Promise<{ event_id?: string }> {
  const base = getBaseUrl()
  const res = await fetch(`${base}/event/send/${encodeURIComponent(eventTopic)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Synora API error ${res.status}: ${text}`)
  }
  return res.json().catch(() => ({}))
}
