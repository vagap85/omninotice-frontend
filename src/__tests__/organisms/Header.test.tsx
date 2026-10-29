import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Header from '@/components/organisms/Header/Header';

import { renderWithProviders } from '../../test/utils';

let mockIsAuthorized = false;

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: mockIsAuthorized,
    logout: vi.fn(),
    authState: {
      firstName: 'Тест',
      lastName: 'Пользователь',
      login: 'test@example.com'
    }
  })
}));

describe('Header', () => {
  beforeEach(() => {
    mockIsAuthorized = false;
  });

  test('для неавторизованного пользователя отображает Войти и Попробовать, но не меню пользователя', () => {
    mockIsAuthorized = false;
    renderWithProviders(<Header />);

    expect(screen.getByRole('link', { name: /войти/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /попробовать/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Тест Пользователь')).not.toBeInTheDocument();
  });

  test('для авторизованного пользователя заменяет кнопку Выйти на AccountWidget справа от кнопки Попробовать', () => {
    mockIsAuthorized = true;
    renderWithProviders(<Header />);

    expect(
      screen.queryByRole('link', { name: /войти/i })
    ).not.toBeInTheDocument();

    const tryButton = screen.getByRole('link', { name: /попробовать/i });
    expect(tryButton).toBeInTheDocument();

    const accountMenu = screen.getByText('Тест Пользователь');
    expect(accountMenu).toBeInTheDocument();

    // Проверяем, что меню пользователя расположено после (справа от) кнопки Попробовать
    expect(
      tryButton.compareDocumentPosition(accountMenu) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
