import type { ValidationResult } from '@/types/shortener';

/**
 * Проверяет формат URL на клиенте.
 * Это базовая проверка до запроса в API — нужна, чтобы:
 *   1. Не отправлять заведомо неверные ссылки в сеть.
 *   2. Дать пользователю мгновенный фидбэк.
 *
 * Глубокая проверка безопасности (по спискам, TLD, фишинговые слова)
 * выполняется через POST /public/check-url/.
 */
export const validateUrlFormat = (input: string): ValidationResult => {
  if (!input || !input.trim()) {
    return { valid: false, message: 'Введите ссылку', type: 'empty' };
  }

  const trimmed = input.trim();

  try {
    const urlObj = new URL(trimmed);

    if (!urlObj.protocol.startsWith('http')) {
      return {
        valid: false,
        message: 'Некорректный URL. Проверьте формат адреса.',
        type: 'invalid',
      };
    }

    return { valid: true, message: '', type: '', url: trimmed };
  } catch {
    return {
      valid: false,
      message: 'Некорректный URL. Проверьте формат адреса.',
      type: 'invalid',
    };
  }
};
