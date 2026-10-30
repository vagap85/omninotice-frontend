import userEvent from '@testing-library/user-event';
import { type Mock, describe, test, expect, vi, beforeEach } from 'vitest';

import { createUserCenter, loginUserCenter } from '@/api/userCenter';
import AuthRegisterPage from '@/pages/Auth/AuthRegisterPage';

import { renderWithProviders, screen, waitFor } from '../../test/utils';

// ===== МОКИ =====

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockLogin = vi.fn();
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin })
}));

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast
  };
});

vi.mock('@/api/userCenter', () => ({
  loginUserCenter: vi.fn(),
  createUserCenter: vi.fn()
}));

vi.mock('@/assets/background.jpg', () => ({ default: 'bg.jpg' }));
vi.mock('@/assets/logo.svg', () => ({ default: 'logo.svg' }));

describe('AuthRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('рендерит форму регистрации', () => {
    renderWithProviders(<AuthRegisterPage />);
    expect(
      screen.getByPlaceholderText(/example@omninotice/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Создать аккаунт')).toBeInTheDocument();
  });

  test('есть 3 поля: логин, пароль, подтверждение', () => {
    renderWithProviders(<AuthRegisterPage />);
    expect(
      screen.getByPlaceholderText(/example@omninotice/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/введите пароль/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/повторите пароль/i)
    ).toBeInTheDocument();
  });

  test('есть ссылка "У меня уже есть аккаунт"', () => {
    renderWithProviders(<AuthRegisterPage />);
    expect(screen.getByText(/У меня уже есть аккаунт/i)).toBeInTheDocument();
  });

  test('клик по "У меня уже есть аккаунт" ведёт на /login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthRegisterPage />);

    await user.click(screen.getByText(/У меня уже есть аккаунт/i));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('клик по "На главную" ведёт на /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthRegisterPage />);

    await user.click(screen.getByText('На главную'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('успешная регистрация вызывает setAuth и редирект', async () => {
    const user = userEvent.setup();
    (createUserCenter as Mock).mockResolvedValueOnce({
      login: 'new@mail.com',
      password: 'password123'
    });
    (loginUserCenter as Mock).mockResolvedValueOnce({
      accessToken: 'token123',
      userId: 'user-123',
      login: 'new@mail.com',
      accountId: 'account-123'
    });

    renderWithProviders(<AuthRegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/example@omninotice/i),
      'new@mail.com'
    );
    await user.type(
      screen.getByPlaceholderText(/введите пароль/i),
      'password123'
    );
    await user.type(
      screen.getByPlaceholderText(/повторите пароль/i),
      'password123'
    );
    await user.click(screen.getByText('Создать аккаунт'));

    await waitFor(() => {
      expect(createUserCenter).toHaveBeenCalledWith(
        'new@mail.com',
        'password123'
      );
      expect(loginUserCenter).toHaveBeenCalledWith(
        'new@mail.com',
        'password123'
      );
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/about-yourself');
    });
  });

  test('ошибка регистрации показывается пользователю', async () => {
    const user = userEvent.setup();
    (createUserCenter as Mock).mockRejectedValueOnce(
      new Error('Логин уже занят')
    );

    renderWithProviders(<AuthRegisterPage />);

    await user.type(
      screen.getByPlaceholderText(/example@omninotice/i),
      'taken@mail.com'
    );
    await user.type(
      screen.getByPlaceholderText(/введите пароль/i),
      'password123'
    );
    await user.type(
      screen.getByPlaceholderText(/повторите пароль/i),
      'password123'
    );
    await user.click(screen.getByText('Создать аккаунт'));

    await waitFor(() => {
      expect(screen.getByText('Логин уже занят')).toBeInTheDocument();
    });
  });
});
