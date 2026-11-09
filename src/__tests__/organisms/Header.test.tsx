import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

import { fetchMyProfile } from '@/api/profile';
import Header from '@/components/organisms/Header/Header';

import { renderWithProviders } from '../../test/utils';

let mockIsAuthorized = false;
let mockAuthState: {
  firstName?: string;
  lastName?: string;
  login: string;
} = {
  firstName: 'Тест',
  lastName: 'Пользователь',
  login: 'test@example.com'
};

const mockUpdateUser = vi.fn();

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: mockIsAuthorized,
    logout: vi.fn(),
    authState: mockAuthState,
    updateUser: mockUpdateUser
  })
}));

vi.mock('@/api/profile', () => ({
  fetchMyProfile: vi.fn()
}));

describe('Header', () => {
  beforeEach(() => {
    mockIsAuthorized = false;
    mockAuthState = {
      firstName: 'Тест',
      lastName: 'Пользователь',
      login: 'test@example.com'
    };
    sessionStorage.clear();
    vi.clearAllMocks();
    (fetchMyProfile as Mock).mockResolvedValue(null);
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

  test('показывает имя и фамилию из сохраненного профиля над логином', () => {
    mockIsAuthorized = true;
    mockAuthState = { login: 'test@example.com' };
    sessionStorage.setItem(
      'profile_data',
      JSON.stringify({
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'work@example.com'
      })
    );

    renderWithProviders(<Header />);

    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('загружает имя и фамилию из API если они отсутствуют в сессии и стейте', async () => {
    mockIsAuthorized = true;
    mockAuthState = { login: 'test@example.com' };
    (fetchMyProfile as Mock).mockResolvedValueOnce({
      first_name: 'Сергей',
      last_name: 'Сидоров',
      contact_email: [{ title: 'work', value: 'work@example.com' }]
    });

    renderWithProviders(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Сергей Сидоров')).toBeInTheDocument();
    });
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(mockUpdateUser).toHaveBeenCalledWith({
      firstName: 'Сергей',
      lastName: 'Сидоров'
    });
  });

  test('для неавторизованного пользователя ссылка "Сократить ссылку" ведет на лендинг коротких ссылок', () => {
    mockIsAuthorized = false;
    renderWithProviders(<Header />);

    const link = screen.getByRole('link', { name: /сократить ссылку/i });
    expect(link).toHaveAttribute('href', '/links-landing');
  });

  test('для авторизованного пользователя ссылка "Сократить ссылку" ведет на дашборд со списком ссылок', () => {
    mockIsAuthorized = true;
    renderWithProviders(<Header />);

    const link = screen.getByRole('link', { name: /сократить ссылку/i });
    expect(link).toHaveAttribute('href', '/links');
  });
});
