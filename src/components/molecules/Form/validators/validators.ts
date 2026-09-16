import { isValidEmail } from "@/utils/recipient";

import { Validator } from "../../types/form";

export const maxLength = (
  max: number,
  message = "Превышено количество знаков. Уберите лишние, чтобы отправить.",
): Validator<string> => {
  const validator: Validator<string> = (value) =>
    typeof value === "string" && value.length > max ? message : undefined;
  validator.immediate = true; // проверяется сразу при вводе, а не только после сабмита
  return validator;
};

export const required =
  (message = "Поле обязательно для заполнения"): Validator<string> =>
  (value) =>
    !value?.trim() ? message : undefined;

export const minLength =
  (min: number, message?: string): Validator<string> =>
  (value) =>
    typeof value === "string" && value.length < min
      ? (message ?? `Минимум ${min} символов`)
      : undefined;

export const pattern =
  (regexp: RegExp, message = "Неверный формат"): Validator<string> =>
  (value) =>
    typeof value === "string" && value !== "" && !regexp.test(value)
      ? message
      : undefined;

export const httpUrl = (message = 'Введите корректную ссылку'): Validator<string> => {
  const validator: Validator<string> = (value) => {
    const v = value?.trim();
    if (!v) return undefined; // пустое поле — забота required(), не наша

    // Пока пользователь только начал печатать, не мешаем — прощаем первые символы.
    if (v.length < 3) return undefined;

    try {
      const url = new URL(v);
      return url.protocol === 'http:' || url.protocol === 'https:' ? undefined : message;
    } catch {
      return message;
    }
  };
  validator.immediate = true;
  return validator;
};

export const email =
  (message = "Введите корректный email"): Validator<string> =>
  (value) => {
    if (!value) return undefined; // пустое поле — забота required(), не наша
    return isValidEmail(value) ? undefined : message;
  };

// ← новое, для подтверждения пароля
export const matchesField =
  (fieldName: string, message = "Пароли не совпадают"): Validator<string> =>
  (value, allValues) =>
    value !== allValues[fieldName] ? message : undefined;
