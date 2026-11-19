import { screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

import HomePage from '@/pages/HomePage/HomePage';
import { MAILING_CHANNELS } from '@/routing/routes';

import { renderWithProviders } from '../../test/utils';

// Мокаем useAuth, чтобы не требовать AuthProvider
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: false,
    login: vi.fn(),
    logout: vi.fn(),
    auth: null
  })
}));

describe('HomePage', () => {
  test('рендерится без ошибок', () => {
    const { container } = renderWithProviders(<HomePage />);
    expect(container.firstChild).not.toBeNull();
  });

  test('содержит какие-то интерактивные элементы', () => {
    renderWithProviders(<HomePage />);
    const elements = document.querySelectorAll('a, button');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('содержит хедер', () => {
    renderWithProviders(<HomePage />);
    expect(document.body).not.toBeEmptyDOMElement();
  });

  test('показывает Push-уведомления последним каналом', () => {
    renderWithProviders(<HomePage />);

    const pushBadge = screen.getByText('Push-уведомления').closest('a');
    expect(pushBadge).not.toBeNull();

    MAILING_CHANNELS.filter((channel) => channel.id !== 'push').forEach(
      (channel) => {
        const badge = screen.getByText(channel.heroLabel).closest('a');
        expect(badge).not.toBeNull();
        expect(
          badge!.compareDocumentPosition(pushBadge!) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
      }
    );
  });
});
