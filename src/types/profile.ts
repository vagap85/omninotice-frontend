/** Данные профиля пользователя (Страница «Настройка профиля») */
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

/** Поле, к которому относится ошибка профиля ('' — общая ошибка) */
export type ProfileErrorField = 'email' | 'phone' | 'currentPassword' | '';

/** Структура ошибки мок-API профиля */
export interface ProfileServiceError {
  field: ProfileErrorField;
  message: string;
}

/** Данные для изменения пароля */
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  locale?: string;
}
