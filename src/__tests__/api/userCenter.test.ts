import { type Mock, describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { loginUserCenter, createUserCenter } from '@/api/userCenter';

describe('userCenter API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_USERCENTER_PROJECT_ID', 'test-project');
    vi.stubEnv('VITE_USERCENTER_BASE_URL', 'https://api.users.test.ru');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  // ===== loginUserCenter =====

  test('возвращает данные при успешном логине', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            auth_data: { access_token: 'token123', token_type: 'bearer' },
            user_data: { user_id: 'user-123', login: 'user@mail.com' },
            organization_data: { account_id: 'account-123' }
          }
        ]
      })
    });

    const result = await loginUserCenter('user@mail.com', 'pass');

    expect(result.accessToken).toBe('token123');
    expect(result.userId).toBe('user-123');
    expect(result.login).toBe('user@mail.com');
    expect(result.accountId).toBe('account-123');
  });

  test('бросает "Неверный логин или пароль" при 401', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({})
    });

    await expect(loginUserCenter('user@mail.com', 'wrong')).rejects.toThrow(
      'Неверный логин или пароль'
    );
  });

  test('бросает ошибку при отсутствии access_token', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{}] })
    });

    test('бросает ошибку если в ответе нет user_id или account_id', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              auth_data: { access_token: 'token123' },
              user_data: { login: 'user@mail.com' },
              organization_data: {}
            }
          ]
        })
      });

      await expect(loginUserCenter('user@mail.com', 'pass')).rejects.toThrow(
        'UserCenter не вернул user_id'
      );
    });

    await expect(loginUserCenter('user@mail.com', 'pass')).rejects.toThrow(
      'UserCenter не вернул access_token'
    );
  });

  test('отправляет Project-ID в заголовках', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            auth_data: { access_token: 'token123' },
            user_data: { user_id: 'user-123', login: 'user@mail.com' },
            organization_data: { account_id: 'account-123' }
          }
        ]
      })
    });

    await loginUserCenter('user@mail.com', 'pass');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Project-ID': 'test-project'
        })
      })
    );
  });

  // ===== createUserCenter =====

  test('createUserCenter возвращает login/password при успехе', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '{}'
    });

    const result = await createUserCenter('new@mail.com', 'pass123');

    expect(result.login).toBe('new@mail.com');
    expect(result.password).toBe('pass123');
  });

  test('createUserCenter бросает ошибку при сети', async () => {
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    await expect(createUserCenter('user@mail.com', 'pass')).rejects.toThrow(
      'Сетевая ошибка при создании аккаунта'
    );
  });
});
