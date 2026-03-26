/**
 * Проверка получателя: корректный email или номер телефона.
 */

const EMAIL_RE =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export function isValidEmail(raw: string): boolean {
  const v = raw.trim()
  if (!v) return false
  if (/\s/.test(v) || v.includes('..')) return false
  return EMAIL_RE.test(v)
}

export function isValidPhone(raw: string): boolean {
  const v = raw.trim()
  if (!v) return false
  if (/[a-zA-Zа-яА-ЯёЁ@]/.test(v)) return false
  if (!/^[\d\s+().-]+$/.test(v)) return false
  const digits = v.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function isValidRecipient(raw: string): boolean {
  return isValidEmail(raw) || isValidPhone(raw)
}
