import { describe, test, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../../test/utils';
import AuthLoginPage from '@/pages/Auth/AuthLoginPage';

// ===== МОКИ =====

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockLogin = vi.fn();
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

vi.mock('@/api/userCenter', () => ({
  loginUserCenter: vi.fn(),
  createUserCenter: vi.fn(),
}));

vi.mock('@/assets/image 1.jpg', () => ({ default: 'bg.jpg' }));
vi.mock('@/assets/Vector.svg', () => ({ default: 'logo.svg' }));

import { loginUserCenter } from '@/api/userCenter';

describe('AuthLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('рендерит форму логина', () => {
    renderWithProviders(<AuthLoginPage />);
    expect(screen.getByPlaceholderText(/example@omninotice/i)).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('есть ссылка "Зарегистрируйтесь"', () => {
    renderWithProviders(<AuthLoginPage />);
    expect(screen.getByText(/Зарегистрируйтесь/i)).toBeInTheDocument();
  });

  test('есть кнопка "На главную"', () => {
    renderWithProviders(<AuthLoginPage />);
    expect(screen.getByText('На главную')).toBeInTheDocument();
  });

  test('клик по "Зарегистрируйтесь" ведёт на /registration', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthLoginPage />);

    await user.click(screen.getByText(/Зарегистрируйтесь/i));

    expect(mockNavigate).toHaveBeenCalledWith('/registration');
  });

  test('клик по "На главную" ведёт на /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthLoginPage />);

    await user.click(screen.getByText('На главную'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('успешный логин вызывает setAuth и редирект', async () => {
    const user = userEvent.setup();
    (loginUserCenter as any).mockResolvedValueOnce({
      accessToken: 'token123',
      tokenType: 'bearer',
      login: 'user@mail.com',
      firstName: 'Иван',
      lastName: 'Иванов',
    });

    renderWithProviders(<AuthLoginPage />);

    await user.type(screen.getByPlaceholderText(/example@omninotice/i), 'user@mail.com');
    await user.type(screen.getByPlaceholderText(/введите пароль/i), 'password123');
    await user.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/create/email');
    });
  });
});