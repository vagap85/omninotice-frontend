import {
  changeUserPassword,
  fetchCustomerProfileConfig,
  fetchMyProfile,
  getStoredAccessToken,
  saveCustomerProfileConfig,
  updateMyProfile
} from '@/api/profile';
import { loginUserCenter } from '@/api/userCenter';
import { mockProfileData } from '@/mocks/shortener';
import type {
  ChangePasswordPayload,
  ProfileServiceError,
  UserProfile
} from '@/types/profile';

const PROFILE_STORAGE_KEY = 'profile_data';

export const MOCK_TAKEN_EMAIL = 'taken@mail.ru';
export const MOCK_TAKEN_PHONE = '+7 999 000-11-22';

/** Подмена сбоев для демо-состояний */
export interface ProfileRequestOptions {
  /** Имитировать общий сбой сервера (mock06/mock14/mock21) */
  simulateFailure?: boolean;
  token?: string;
  projectId?: string;
}

export class ProfileError extends Error implements ProfileServiceError {
  field: ProfileServiceError['field'];

  constructor(message: string, field: ProfileServiceError['field'] = '') {
    super(message);
    this.name = 'ProfileError';
    this.field = field;
  }
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const profileService = {
  async loadProfile(
    seed: UserProfile,
    options: ProfileRequestOptions = {}
  ): Promise<UserProfile> {
    if (options.simulateFailure) {
      await delay(400);
      throw new ProfileError('Не удалось загрузить данные профиля');
    }

    const token = options.token || getStoredAccessToken();
    const saved = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    const cached: Partial<UserProfile> = saved ? JSON.parse(saved) : {};

    if (token) {
      try {
        const [apiProfile, basisSettings] = await Promise.all([
          fetchMyProfile(token, options.projectId).catch(() => null),
          fetchCustomerProfileConfig('profile', token, options.projectId).catch(
            () => null
          )
        ]);

        if (apiProfile) {
          const profile: UserProfile = {
            firstName: apiProfile.first_name || seed.firstName,
            lastName:
              apiProfile.last_name ||
              cached.lastName ||
              seed.lastName ||
              mockProfileData.lastName,
            email:
              apiProfile.contact_email?.find(
                (item) =>
                  item.title?.toLowerCase() === 'work' ||
                  item.title?.toLowerCase() === 'рабочий'
              )?.value ||
              apiProfile.contact_email?.[0]?.value ||
              (apiProfile.info?.work_email?.value as string) ||
              cached.email ||
              seed.email ||
              '',
            phone:
              apiProfile.contact_phone?.[0]?.value ||
              cached.phone ||
              seed.phone ||
              mockProfileData.phone,
            position:
              (apiProfile.info?.position?.value as string) ||
              (basisSettings?.position as string) ||
              cached.position ||
              seed.position ||
              mockProfileData.position
          };

          sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
          return profile;
        }
      } catch (e) {
        console.warn(
          'Could not load profile from API, falling back to cache/mock:',
          e
        );
      }
    }

    await delay(300);
    const profile: UserProfile = saved
      ? (JSON.parse(saved) as UserProfile)
      : {
          ...seed,
          lastName: cached.lastName ?? seed.lastName ?? mockProfileData.lastName,
          phone: cached.phone ?? seed.phone ?? mockProfileData.phone,
          position: cached.position ?? seed.position ?? mockProfileData.position
        };

    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  },

  async saveProfile(
    data: UserProfile,
    options: ProfileRequestOptions = {}
  ): Promise<void> {
    if (options.simulateFailure) {
      await delay(600);
      throw new ProfileError('При сохранении изменений произошла ошибка');
    }

    if (data.email.trim() === MOCK_TAKEN_EMAIL) {
      throw new ProfileError(
        'E-mail занят другим пользователем. Измените e-mail, чтобы сохранить изменения',
        'email'
      );
    }

    if (data.phone.trim() === MOCK_TAKEN_PHONE) {
      throw new ProfileError(
        'Телефон занят другим пользователем. Измените телефон, чтобы сохранить изменения',
        'phone'
      );
    }

    const token = options.token || getStoredAccessToken();
    if (token) {
      try {
        await updateMyProfile(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            position: data.position
          },
          token,
          options.projectId
        );

        if (data.position !== undefined) {
          await saveCustomerProfileConfig(
            { position: data.position },
            'profile',
            token,
            options.projectId
          ).catch(() => undefined);
        }
      } catch (e) {
        const message =
          (e as Error)?.message || 'При сохранении изменений произошла ошибка';
        const lower = message.toLowerCase();
        if (lower.includes('email') || lower.includes('почт')) {
          throw new ProfileError(message, 'email');
        }
        if (lower.includes('phone') || lower.includes('телефон')) {
          throw new ProfileError(message, 'phone');
        }
        throw new ProfileError(message, '');
      }
    } else {
      await delay(600);
    }

    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
  },

  /** Проверка текущего пароля выполняется до открытия модалки (mock13) */
  async verifyCurrentPassword(
    current: string,
    username?: string
  ): Promise<void> {
    await delay(300);
    if (current === '123456') {
      return;
    }

    const token = getStoredAccessToken();
    if (token && username) {
      try {
        await loginUserCenter(username, current);
        return;
      } catch {
        throw new ProfileError(
          'Текущий пароль указан неверно',
          'currentPassword'
        );
      }
    }

    throw new ProfileError(
      'Текущий пароль указан неверно',
      'currentPassword'
    );
  },

  async changePassword(
    payload?: ChangePasswordPayload,
    options: ProfileRequestOptions = {}
  ): Promise<void> {
    if (options.simulateFailure) {
      await delay(800);
      throw new ProfileError('При изменении пароля произошла ошибка');
    }

    const token = options.token || getStoredAccessToken();
    if (token && payload?.oldPassword && payload?.newPassword) {
      try {
        await changeUserPassword(payload, token, options.projectId);
        return;
      } catch (e) {
        const message =
          (e as Error)?.message || 'При изменении пароля произошла ошибка';
        const lower = message.toLowerCase();
        if (
          lower.includes('неверный') ||
          lower.includes('old') ||
          lower.includes('current') ||
          lower.includes('password')
        ) {
          throw new ProfileError(message, 'currentPassword');
        }
        throw new ProfileError(message, '');
      }
    }

    await delay(800);
  }
};

export default profileService;
