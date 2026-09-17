import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

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
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            auth_data: { access_token: 'token123', token_type: 'bearer' },
            user_data: { login: 'user@mail.com' },
            profile_data: { first_name: 'Иван', last_name: 'Иванов' },
          },
        ],
      }),
    });

    const result = await loginUserCenter('user@mail.com', 'pass');

    expect(result.accessToken).toBe('token123');
    expect(result.tokenType).toBe('bearer');
    expect(result.login).toBe('user@mail.com');
    expect(result.firstName).toBe('Иван');
    expect(result.lastName).toBe('Иванов');
  });

  test('бросает "Неверный логин или пароль" при 401', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    });

    await expect(loginUserCenter('user@mail.com', 'wrong'))
      .rejects.toThrow('Неверный логин или пароль');
  });

  test('бросает ошибку при отсутствии access_token', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{}] }),
    });

    await expect(loginUserCenter('user@mail.com', 'pass'))
      .rejects.toThrow('UserCenter не вернул access_token');
  });

  test('отправляет Project-ID в заголовках', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ auth_data: { access_token: 'token123' } }],
      }),
    });

    await loginUserCenter('user@mail.com', 'pass');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Project-ID': 'test-project',
        }),
      })
    );
  });

  // ===== createUserCenter =====

  test('createUserCenter возвращает login/password при успехе', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      text: async () => '{}',
    });

    const result = await createUserCenter('new@mail.com', 'pass123');

    expect(result.login).toBe('new@mail.com');
    expect(result.password).toBe('pass123');
  });

  test('createUserCenter бросает ошибку при сети', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    await expect(createUserCenter('user@mail.com', 'pass'))
      .rejects.toThrow('Сетевая ошибка при создании аккаунта');
  });
});