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

  test('изменение рабочего e-mail не меняет e-mail учетной записи в секции безопасности', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Рабочий e-?mail/i)).not.toBeDisabled();
    });

    const securityEmail = screen.getByText('ivan@example.com');
    expect(securityEmail).toHaveClass('profile-page__security-email');

    const emailInput = screen.getByLabelText(/Рабочий e-?mail/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'newwork@corporate.ru');

    expect(screen.getByText('ivan@example.com')).toHaveClass(
      'profile-page__security-email'
    );
  });
  test('скрывает кнопку Отменить изменения и блокирует Сохранить изменения при отсутствии изменений', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Имя/i)).not.toBeDisabled();
    });

    const saveButton = screen.getByRole('button', {
      name: 'Сохранить изменения'
    });

    // Исходно: кнопка отмены скрыта, сохранения - неактивна
    expect(screen.queryByText('Отменить изменения')).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    // Вносим изменения в поле
    const nameInput = screen.getByLabelText(/Имя/i);
    await user.type(nameInput, ' добавлено');

    // Кнопка отмены появляется, кнопка сохранения становится активной
    expect(screen.getByText('Отменить изменения')).toBeInTheDocument();
    expect(saveButton).toBeEnabled();

    // Нажимаем Отменить изменения
    await user.click(screen.getByText('Отменить изменения'));

    // Кнопка отмены снова скрыта, сохранения - неактивна
    expect(screen.queryByText('Отменить изменения')).not.toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
  test('скрывает кнопку Отмена и блокирует Изменить пароль при отсутствии изменений в форме пароля', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Текущий пароль/i)).not.toBeDisabled();
    });

    const changePwdButton = screen.getByRole('button', {
      name: 'Изменить пароль'
    });

    // Исходно: кнопка Отмена скрыта, кнопка Изменить пароль неактивна
    expect(screen.queryByText('Отмена')).not.toBeInTheDocument();
    expect(changePwdButton).toBeDisabled();

    // Вводим значение в текущий пароль
    const currentPwdInput = screen.getByLabelText(/Текущий пароль/i);
    await user.type(currentPwdInput, 'old-password');

    // Кнопка Отмена появляется, кнопка Изменить пароль становится активной
    expect(screen.getByText('Отмена')).toBeInTheDocument();
    expect(changePwdButton).toBeEnabled();

    // Нажимаем Отмена
    await user.click(screen.getByText('Отмена'));

    // Кнопка Отмена снова скрыта, кнопка Изменить пароль неактивна, значение очищено
    expect(screen.queryByText('Отмена')).not.toBeInTheDocument();
    expect(changePwdButton).toBeDisabled();
    expect(currentPwdInput).toHaveValue('');
  });
});
