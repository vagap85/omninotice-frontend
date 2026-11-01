import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import SendController from '@/components/organisms/Modals/SendController/SendController';
import { renderWithProviders, screen } from '../../test/utils';

describe('SendController', () => {
  test('aborts the send request when canceled while loading', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn(
      (_payload: string, signal: AbortSignal) =>
        new Promise<void>((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true }
          );
        })
    );

    renderWithProviders(
      <SendController
        variant="push"
        isOpen
        onClose={vi.fn()}
        recipientsCount={1}
        getPayload={() => 'payload'}
        onSend={onSend}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Отправить' }));
    const signal = onSend.mock.calls[0][1];
    expect(signal.aborted).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Отмена' }));
    expect(signal.aborted).toBe(true);
  });
});
