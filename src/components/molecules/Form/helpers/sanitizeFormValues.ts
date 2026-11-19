import { sanitizeSubmitValue } from '@/utils/sanitizeSubmitValue';

export function sanitizeFormValues<T extends Record<string, unknown>>(
  values: T
): T {
  const result = { ...values };

  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitizeSubmitValue(result[key] as string) as T[typeof key];
    }
  }

  return result;
}
