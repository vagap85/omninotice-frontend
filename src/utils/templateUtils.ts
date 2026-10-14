/**
 * Регулярное выражение для поиска переменных вида {{переменная}} или {переменная}
 */
export const TEMPLATE_VAR_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Извлекает список уникальных ключей переменных из текста
 * Пример: "Привет, {{имя}}! Задача {{заголовок}}" -> ["имя", "заголовок"]
 */
export const extractVariables = (templateText: string): string[] => {
  if (!templateText) return [];
  const matches = templateText.matchAll(TEMPLATE_VAR_REGEX);
  const variables = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      variables.add(match[1].trim());
    }
  }

  return Array.from(variables);
};

/**
 * Проверяет, остались ли в тексте незаполненные переменные вида {{...}}
 */
export const hasUnfilledVariables = (text: string): boolean => {
  return /\{\{([^}]+)\}\}/.test(text);
};

/**
 * Интерполирует переменные в тексте шаблона
 * @param templateText Исходный текст с {{переменными}}
 * @param values Словарь значений, например { 'имя': 'Иван', 'заголовок задачи': 'Сдать отчет' }
 * @param keepUnmatched Если true — оставляет {{переменная}} на месте, если значение не передано
 */
export const interpolateTemplate = (
  templateText: string,
  values: Record<string, string>,
  keepUnmatched: boolean = true
): string => {
  if (!templateText) return '';

  // Создаем карту с ключами в нижнем регистре для безопасного поиска
  const lowerCaseValues: Record<string, string> = {};
  Object.keys(values).forEach((key) => {
    lowerCaseValues[key.toLowerCase()] = values[key];
  });

  return templateText.replace(TEMPLATE_VAR_REGEX, (fullMatch, rawKey) => {
    const key = rawKey.trim().toLowerCase();
    if (lowerCaseValues[key] !== undefined && lowerCaseValues[key] !== '') {
      return lowerCaseValues[key];
    }
    return keepUnmatched ? fullMatch : '';
  });
};
