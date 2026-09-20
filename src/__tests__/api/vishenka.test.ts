import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { createDispatch, DispatchError, generateRequestId } from '@/api/vishenka';

describe('createDispatch (Vishenka API)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_VISHENKA_BASE_URL', 'https://vishenka.test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test('успешная отправка → 201 OK', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'OK', message: 'Рассылка принята' },
        data: [{
          request_id: 'uuid-1',
          status: 'accepted',
          already_applied: false,
          author_user_id: 'uuid-2',
          created_at: '2026-09-19T10:00:00Z',
        }],
        info: { api_version: '2.8.0', count: 1, total: 1, page: 1, page_size: 1 },
      }),
    });

    const result = await createDispatch({
      request_id: 'uuid-1',
      application_id: 'sigma',
      channel: 'popup',
      title: 'Тест',
      body: 'Текст',
      audience_type: 'selected',
      recipient_ids: ['uuid-3'],
    });

    expect(result.detail.code).toBe('OK');
    expect(result.data[0].status).toBe('accepted');
    expect(result.info.api_version).toBe('2.8.0');
  });

  test('повтор → ALREADY_APPLIED + replayed', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'ALREADY_APPLIED', message: 'Уже применено' },
        data: [{
          request_id: 'uuid-1',
          status: 'replayed',
          already_applied: true,
          author_user_id: 'uuid-2',
          created_at: '2026-09-19T10:00:00Z',
        }],
        info: { api_version: '2.8.0' },
      }),
    });

    const result = await createDispatch({
      request_id: 'uuid-1',
      application_id: 'sigma',
      channel: 'popup',
      title: 'Тест',
      body: 'Текст',
      audience_type: 'all',
      recipient_ids: [],
    });

    expect(result.detail.code).toBe('ALREADY_APPLIED');
    expect(result.data[0].already_applied).toBe(true);
  });

  test('422 → DispatchError с валидацией', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        detail: [{ loc: ['body', 'recipient_ids'], msg: 'Обязательно' }],
      }),
    });

    await expect(createDispatch({
      request_id: 'uuid-1',
      application_id: 'sigma',
      channel: 'popup',
      title: 'Тест',
      body: 'Текст',
      audience_type: 'selected',
      recipient_ids: [],
    })).rejects.toThrow(DispatchError);
  });

  test('503 → DispatchError "Synora should retry"', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        detail: 'Upstream service timeout. Synora should retry.',
      }),
    });

    const error = await createDispatch({
      request_id: 'uuid-1',
      application_id: 'sigma',
      channel: 'popup',
      title: 'Тест',
      body: 'Текст',
      audience_type: 'all',
      recipient_ids: [],
    }).catch((e) => e);

    expect(error).toBeInstanceOf(DispatchError);
    expect(error.status).toBe(503);
    expect(error.detail).toContain('Synora should retry');
  });

  test('отправляет правильный payload', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        detail: { code: 'OK' },
        data: [],
        info: { api_version: '2.8.0' },
      }),
    });

    const payload = {
      request_id: 'uuid-1',
      application_id: 'sigma',
      channel: 'popup' as const,
      title: 'Тест',
      body: 'Текст',
      audience_type: 'selected' as const,
      recipient_ids: ['uuid-3'],
    };

    await createDispatch(payload);

    expect(fetch).toHaveBeenCalledWith(
      'https://vishenka.test/api/v1/dispatches',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    );
  });
});

describe('generateRequestId', () => {
  test('возвращает валидный UUID v4', () => {
    const id = generateRequestId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('генерирует уникальные ID', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });
});