import { afterEach, describe, expect, test, vi } from 'vitest';

import { sendEventEmail } from '@/api/synora';

describe('sendEventEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test('forwards the cancellation signal to fetch', async () => {
    vi.stubEnv('VITE_SYNORA_BASE_URL', 'https://synora.test');
    vi.stubEnv('VITE_SYNORA_PROJECT_ID', 'project-1');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ event_id: 'event-1' })
      })
    );
    const controller = new AbortController();

    await sendEventEmail(
      'mail-send',
      {
        send_to: 'user@example.com',
        data: {
          subject: 'Test',
          message_title: 'Test',
          preheader: '',
          body: 'Body',
          signature: '',
          action_text: '',
          action_link: '',
          source: 'test'
        }
      },
      controller.signal
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://synora.test/event/send/mail-send',
      expect.objectContaining({ signal: controller.signal })
    );
  });
});
