import { describe, test, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

import {
  fetchMyProfile,
  updateMyProfile,
  changeUserPassword,
  fetchCustomerProfileConfig,
  saveCustomerProfileConfig,
  extractApiErrorMessage,
  parseJwtPayload
} from '@/api/profile';
import {
  profileService,
  MOCK_TAKEN_EMAIL,
  MOCK_TAKEN_PHONE
} from '@/services/profile';
import type { UserProfile } from '@/types/profile';

// Mock JWT with sub { user_id: 'u-123', profile_id: 'p-123', account_id: 'a-123' }
const MOCK_TOKEN_WITH_ALL =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsidXNlcl9pZCI6InUtMTIzIiwicHJvZmlsZV9pZCI6InAtMTIzIiwiYWNjb3VudF9pZCI6ImEtMTIzIn19.sig';

// Mock JWT with sub { user_id: 'u-456', profile_id: null, account_id: null }
const MOCK_TOKEN_NO_PROFILE =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsidXNlcl9pZCI6InUtNDU2IiwicHJvZmlsZV9pZCI6bnVsbCwiYWNjb3VudF9pZCI6bnVsbH19.sig';

describe('profile API and service', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_USERCENTER_PROJECT_ID', 'test-project-id');
    vi.stubEnv('VITE_USERCENTER_BASE_URL', 'https://api.users.test.ru');
    vi.stubEnv('VITE_BASIS_CFG_BASE_URL', 'https://cfg.basis.test.ru');
    vi.stubGlobal('fetch', vi.fn());
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    sessionStorage.clear();
    localStorage.clear();
  });

  test('parseJwtPayload извлекает sub из валидного JWT токена', () => {
    const payload = parseJwtPayload(MOCK_TOKEN_WITH_ALL);
    expect(payload?.user_id).toBe('u-123');
    expect(payload?.profile_id).toBe('p-123');
    expect(payload?.account_id).toBe('a-123');

    expect(parseJwtPayload('invalid.token')).toBeNull();
    expect(parseJwtPayload('')).toBeNull();
  });

  test('extractApiErrorMessage корректно извлекает текст ошибки из разных форматов', () => {
    expect(extractApiErrorMessage({ detail: 'Не авторизован' })).toBe('Не авторизован');
    expect(extractApiErrorMessage({ detail: { message: 'Кастомная ошибка' } })).toBe('Кастомная ошибка');
    expect(extractApiErrorMessage({ detail: [{ msg: 'Поле обязательно' }] })).toBe('Поле обязательно');
    expect(extractApiErrorMessage(null, 'Фолбэк')).toBe('Фолбэк');
  });

  test('fetchMyProfile успешно возвращает данные профиля по ID из токена', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            profile_id: 'p-123',
            first_name: 'Петр',
            last_name: 'Петров',
            contact_email: [{ title: 'email', value: 'petr@test.ru' }],
            contact_phone: [{ title: 'phone', value: '+79991112233' }],
            info: { position: { title: 'Должность', value: 'Разработчик' } }
          }
        ]
      })
    });

    const result = await fetchMyProfile(MOCK_TOKEN_WITH_ALL, 'proj123');
    expect(result?.first_name).toBe('Петр');
    expect(result?.last_name).toBe('Петров');
    expect(result?.contact_email?.[0].value).toBe('petr@test.ru');
    expect(result?.info?.position?.value).toBe('Разработчик');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/profile/p-123'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: `Bearer ${MOCK_TOKEN_WITH_ALL}`,
          'Project-ID': 'proj123'
        })
      })
    );
  });

  test('fetchMyProfile возвращает null без 404 ошибок, если профиль еще не создан', async () => {
    // Пользователь без профиля в токене и в БД
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ user_id: 'u-456', profile_id: null }] })
    });

    const result = await fetchMyProfile(MOCK_TOKEN_NO_PROFILE, 'proj123');
    expect(result).toBeNull();
  });

  test('updateMyProfile обновляет существующий профиль через PATCH', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ detail: { code: 'OK', message: null } })
    });

    await updateMyProfile(
      {
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'ivan@test.ru',
        phone: '+79998887766'
      },
      MOCK_TOKEN_WITH_ALL,
      'proj123'
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/profile/p-123'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          Authorization: `Bearer ${MOCK_TOKEN_WITH_ALL}`,
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          first_name: 'Иван',
          last_name: 'Иванов',
          contact_email: [{ title: 'work', value: 'ivan@test.ru' }],
          contact_phone: [{ title: 'phone', value: '+79998887766' }]
        })
      })
    );
  });

  test('updateMyProfile создает профиль через POST /profile и привязывает к user, если профиля еще нет', async () => {
    // 1. resolveProfileId -> GET /user/u-456 returns profile_id: null
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ user_id: 'u-456', profile_id: null }] })
    });

    // 2. POST /profile -> returns new profile_id 'new-prof-id'
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ profile_id: 'new-prof-id' }] })
    });

    // 3. PATCH /user/u-456 -> links profile_id
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user_id: 'u-456', profile_id: 'new-prof-id' })
    });

    const res = await updateMyProfile(
      {
        firstName: 'Ольга',
        lastName: 'Смирнова',
        email: 'olga@test.ru',
        phone: '+79995554433',
        position: 'Дизайнер'
      },
      MOCK_TOKEN_NO_PROFILE,
      'proj123'
    );

    expect(res.profileId).toBe('new-prof-id');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/profile'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"first_name":"Ольга"')
      })
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/user/u-456'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ profile_id: 'new-prof-id' })
      })
    );
  });

  test('changeUserPassword отправляет старый и новый пароли в /auth/password', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({})
    });

    await changeUserPassword(
      { oldPassword: 'oldSecret', newPassword: 'newSecret123' },
      'token123',
      'proj123'
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/password'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          old_password: 'oldSecret',
          new_password: 'newSecret123',
          locale: 'ru'
        })
      })
    );
  });

  test('fetchCustomerProfileConfig и saveCustomerProfileConfig обращаются к Basis CFG при наличии account_id', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ config_code: 'profile', title: 'Профиль', settings: { position: 'Аналитик' } }]
      })
    });

    const settings = await fetchCustomerProfileConfig('profile', MOCK_TOKEN_WITH_ALL, 'proj123');
    expect(settings?.position).toBe('Аналитик');

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({})
    });

    await saveCustomerProfileConfig({ position: 'Тимлид' }, 'profile', MOCK_TOKEN_WITH_ALL, 'proj123');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/account/my/customer/my/config/profile/settings'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ settings: { position: 'Тимлид' } })
      })
    );
  });

  test('profileService.loadProfile загружает профиль из API при наличии токена', async () => {
    localStorage.setItem(
      'usercenter_auth',
      JSON.stringify({ accessToken: MOCK_TOKEN_WITH_ALL, tokenType: 'bearer' })
    );

    (fetch as Mock).mockImplementation((url: string) => {
      if (url.includes('/profile/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                first_name: 'Алексей',
                last_name: 'Смирнов',
                contact_email: [{ title: 'email', value: 'alex@test.ru' }],
                contact_phone: [{ title: 'phone', value: '+79993334455' }],
                info: { position: { title: 'Должность', value: 'Архитектор' } }
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ data: [] })
      });
    });

    const seed: UserProfile = {
      firstName: 'Дефолт',
      lastName: '',
      email: 'default@test.ru',
      phone: '',
      position: ''
    };

    const loaded = await profileService.loadProfile(seed);
    expect(loaded.firstName).toBe('Алексей');
    expect(loaded.lastName).toBe('Смирнов');
    expect(loaded.email).toBe('alex@test.ru');
    expect(loaded.phone).toBe('+79993334455');
    expect(loaded.position).toBe('Архитектор');
  });

  test('profileService.loadProfile отдает предпочтение рабочему email с title "work"', async () => {
    localStorage.setItem(
      'usercenter_auth',
      JSON.stringify({ accessToken: MOCK_TOKEN_WITH_ALL, tokenType: 'bearer' })
    );

    (fetch as Mock).mockImplementation((url: string) => {
      if (url.includes('/profile/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            data: [
              {
                first_name: 'Анна',
                last_name: 'Павлова',
                contact_email: [
                  { title: 'personal', value: 'personal@mail.ru' },
                  { title: 'work', value: 'work.anna@corporate.ru' }
                ],
                contact_phone: [{ title: 'phone', value: '+79990001122' }]
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ data: [] })
      });
    });

    const seed: UserProfile = {
      firstName: 'Анна',
      lastName: '',
      email: 'account_login@mail.ru',
      phone: '',
      position: ''
    };

    const loaded = await profileService.loadProfile(seed);
    expect(loaded.email).toBe('work.anna@corporate.ru');
  });

  test('profileService.saveProfile выбрасывает ошибки для занятого email и телефона', async () => {
    const profile: UserProfile = {
      firstName: 'Иван',
      lastName: 'Иванов',
      email: MOCK_TAKEN_EMAIL,
      phone: '+7 900 111-22-33',
      position: 'Разработчик'
    };

    await expect(profileService.saveProfile(profile)).rejects.toThrow(
      expect.objectContaining({
        field: 'email'
      })
    );

    const profilePhoneTaken: UserProfile = {
      ...profile,
      email: 'free@mail.ru',
      phone: MOCK_TAKEN_PHONE
    };

    await expect(profileService.saveProfile(profilePhoneTaken)).rejects.toThrow(
      expect.objectContaining({
        field: 'phone'
      })
    );
  });

  test('profileService.verifyCurrentPassword принимает 123456 и отклоняет некорректный пароль', async () => {
    await expect(profileService.verifyCurrentPassword('123456')).resolves.toBeUndefined();
    await expect(profileService.verifyCurrentPassword('wrong-pwd')).rejects.toThrow(
      expect.objectContaining({
        field: 'currentPassword'
      })
    );
  });
});
