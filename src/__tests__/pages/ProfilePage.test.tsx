import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import ProfilePage from '@/pages/ProfilePage/ProfilePage';

import { renderWithProviders, screen, waitFor } from '../../test/utils';

const mockAuthState = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  firstName: 'Иван',
  lastName: 'Иванов',
  login: 'ivan@example.com'
};

const mockUpdateUser = vi.fn();
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    authState: mockAuthState,
    isAuthorized: true,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: mockUpdateUser
  })
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  test('рендерит секции профиля пользователя', async () => {
    renderWithProviders(<ProfilePage />);

    expect(screen.getByText('Настройка профиля')).toBeInTheDocument();
    expect(screen.getByText('Личные данные')).toBeInTheDocument();
    expect(screen.getByText('Контакты')).toBeInTheDocument();
    expect(screen.getByText('Безопасность')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText(/Имя/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Рабочий e-?mail/i)).toBeInTheDocument();
    });
  });

  test('валидирует обязательные поля при редактировании', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await waitFor(
      () => {
        expect(screen.getByLabelText(/Имя/i)).not.toBeDisabled();
      },
      { timeout: 2000 }
    );

    const nameInput = screen.getByLabelText(/Имя/i);
    await user.clear(nameInput);

    expect(
      await screen.findByText('Имя обязательно для заполнения')
    ).toBeInTheDocument();
  });

  test('валидирует поля пароля в секции безопасности', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Придумайте новый пароль/i)
      ).toBeInTheDocument();
    });

    const newPwdInput = screen.getByLabelText(/Придумайте новый пароль/i);
    await user.type(newPwdInput, '123');

    expect(
      await screen.findByText('Пароль должен содержать минимум 8 символов')
    ).toBeInTheDocument();
  });
});
