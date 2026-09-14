import { isValidEmail } from "@/utils/recipient";
import { Validator } from "../../types/form";

export const hasValidRecipient =
  (message = "Нет корректных email адресов для отправки"): Validator<string> =>
  (value) => {
    const tokens = value.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return "Добавьте хотя бы один email адрес";
    return tokens.some(isValidEmail) ? undefined : message;
  };
