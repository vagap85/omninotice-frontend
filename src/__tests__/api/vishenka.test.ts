import {
  type Mock,
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest';

import {
  createDispatch,
  dispatchNotification,
  DispatchError,
  generateRequestId,
  getTemplates,
  invalidateTemplatesCache,
} from '@/api/vishenka';
import { clearAuthCookies, saveAuthCookies } from '@/auth/authCookies';
import { DispatchRequest } from '@/api/types';

describe('createDispatch (Vishenka API)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_VISHENKA_BASE_URL', 'https://vishenka.test');
  });

  afterEach(() => {
    clearAuthCookies();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test('успешная отправка → 201 OK', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'OK', message: 'Рассылка принята' },
        data: [
          {
            request_id: 'uuid-1',
            status: 'accepted',
            already_applied: false,
            author_user_id: 'uuid-2',
            created_at: '2026-09-19T10:00:00Z'
          }
        ],
        info: {
          api_version: '2.8.0',
          count: 1,
          total: 1,
          page: 1,
          page_size: 1
        }
      })
    });

    const result = await createDispatch({
      request_id: 'uuid-1',
      delegated_token: 'test-token',
      account_id: 'account-1',
      application_id: 'sigma',
      channels: ['in_app'],
      title: 'Тест',
      body: 'Текст',
      recipients: ['uuid-3'],
      created_at: '2026-09-19T10:00:00Z'
    });

    expect(result.detail.code).toBe('OK');
    expect(result.data[0].status).toBe('accepted');
    expect(result.info.api_version).toBe('2.8.0');
  });

  test('повтор → ALREADY_APPLIED + replayed', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'ALREADY_APPLIED', message: 'Уже применено' },
        data: [
          {
            request_id: 'uuid-1',
            status: 'replayed',
            already_applied: true,
            author_user_id: 'uuid-2',
            created_at: '2026-09-19T10:00:00Z'
          }
        ],
        info: { api_version: '2.8.0' }
      })
    });

    const result = await createDispatch({
      request_id: 'uuid-1',
      delegated_token: 'test-token',
      account_id: 'account-1',
      application_id: 'sigma',
      channels: ['in_app'],
      title: 'Тест',
      body: 'Текст',
      recipients: [],
      created_at: '2026-09-19T10:00:00Z'
    });

    expect(result.detail.code).toBe('ALREADY_APPLIED');
    expect(result.data[0].already_applied).toBe(true);
  });

  test('422 → DispatchError с валидацией', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [{ loc: ['body', 'recipients'], msg: 'Обязательно' }]
      })
    });

    await expect(
      createDispatch({
        request_id: 'uuid-1',
        delegated_token: 'test-token',
        account_id: 'account-1',
        application_id: 'sigma',
        channels: ['in_app'],
        title: 'Тест',
        body: 'Текст',
        recipients: [],
        created_at: '2026-09-19T10:00:00Z'
      })
    ).rejects.toThrow(DispatchError);
  });

  test('503 → DispatchError "Synora should retry"', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        detail: 'Upstream service timeout. Synora should retry.'
      })
    });

    const error = await createDispatch({
      request_id: 'uuid-1',
      delegated_token: 'test-token',
      account_id: 'account-1',
      application_id: 'sigma',
      channels: ['in_app'],
      title: 'Тест',
      body: 'Текст',
      recipients: [],
      created_at: '2026-09-19T10:00:00Z'
    }).catch((e) => e);

    expect(error).toBeInstanceOf(DispatchError);
    expect(error.status).toBe(503);
    expect(error.detail).toContain('Synora should retry');
  });

  test('отправляет правильный payload', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'OK' },
        data: [],
        info: { api_version: '2.8.0' }
      })
    });

    const payload: DispatchRequest = {
      request_id: 'uuid-1',
      delegated_token: 'test-token',
      account_id: 'account-1',
      application_id: 'sigma',
      channels: ['in_app'],
      title: 'Тест',
      body: 'Текст',
      recipients: ['uuid-3'],
      created_at: '2026-09-19T10:00:00Z'
    };

    await createDispatch(payload);

    expect(fetch).toHaveBeenCalledWith(
      'https://vishenka.test/api/v1/dispatches',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    );
  });

  test('dispatchNotification adds auth and generated metadata to the payload', async () => {
    saveAuthCookies({
      userId: 'user-1',
      login: 'user@example.com',
      accountId: 'account-1',
      accessToken: 'delegated-token'
    });
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'OK' },
        data: [],
        info: { api_version: '2.8.0' }
      })
    });

    await dispatchNotification({
      application_id: 'cloveri-start',
      channels: ['tg'],
      title: 'Telegram',
      body: '<b>Message</b>',
      recipients: ['recipient-1']
    });

    const requestBody = JSON.parse((fetch as Mock).mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      delegated_token: 'delegated-token',
      account_id: 'account-1',
      application_id: 'cloveri-start',
      channels: ['tg'],
      title: 'Telegram',
      body: '<b>Message</b>',
      recipients: ['recipient-1']
    });
    expect(requestBody.request_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(new Date(requestBody.created_at).toISOString()).toBe(
      requestBody.created_at
    );
  });

  test('dispatchNotification forwards the cancellation signal', async () => {
    saveAuthCookies({
      userId: 'user-1',
      login: 'user@example.com',
      accountId: 'account-1',
      accessToken: 'delegated-token'
    });
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'OK' },
        data: [],
        info: { api_version: '2.8.0' }
      })
    });
    const controller = new AbortController();

    await dispatchNotification(
      {
        application_id: 'sigma',
        channels: ['in_app'],
        title: 'Тест',
        body: 'Текст',
        recipients: ['recipient-1']
      },
      controller.signal
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://vishenka.test/api/v1/dispatches',
      expect.objectContaining({ signal: controller.signal })
    );
  });
});

describe('generateRequestId', () => {
  test('возвращает валидный UUID v4', () => {
    const id = generateRequestId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test('генерирует уникальные ID', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});

describe('getTemplates', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_VISHENKA_BASE_URL', 'https://vishenka.test');
    vi.stubEnv('VITE_SYNORA_PROJECT_ID', 'project-1');
    saveAuthCookies({
      userId: 'user-1',
      login: 'user@example.com',
      accountId: 'account-1',
      accessToken: 'delegated-token'
    });
    invalidateTemplatesCache();
  });

  afterEach(() => {
    clearAuthCookies();
    invalidateTemplatesCache();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test('throws TemplatesError for a successful response with an invalid schema', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        detail: { code: 'OK', message: 'Шаблоны получены' },
        data: [
          {
            id: 'welcome_template',
            title: 'Добро пожаловать, {{name}}!',
            body: 'Ваш аккаунт в проекте {{project}} успешно активирован.',
            buttonText: 'Перейти в профиль'
          },
          {
            id: 'alert_template',
            title: 'Важное уведомление: {{event}}',
            body: 'Здравствуйте, {{name}}! Проверьте статус задачи в системе.',
            buttonText: 'Открыть'
          }
        ],
        info: { count: 2 }
      })
    });

    await expect(getTemplates()).rejects.toMatchObject({
      name: 'TemplatesError',
      status: 200,
      code: 'INVALID_RESPONSE'
    });
  });

  test('returns templates with the expected schema', async () => {
    const templates = [
      {
        id: 'welcome_template',
        name: 'Welcome',
        title: 'Добро пожаловать, {{name}}!',
        body: 'Ваш аккаунт активирован.',
        channel: 'cherry',
        variables: [{ key: 'name', label: 'Имя' }],
        updatedAt: '2026-11-08T00:00:00.000Z',
        usageCount: 0
      }
    ];
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: templates })
    });

    await expect(getTemplates()).resolves.toEqual(templates);
  });
});
