export function sanitizeSubmitValue(value: string): string {
  return value
    .trim()                 // убираем пробелы по краям
    .replace(/\s{2,}/g, ' '); // схлопываем несколько пробелов подряд в один
}