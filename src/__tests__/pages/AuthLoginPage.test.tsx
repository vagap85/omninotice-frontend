import userEvent from '@testing-library/user-event';
import { type Mock, describe, test, expect, vi, beforeEach } from 'vitest';

import { fetchMyProfile } from '@/api/profile';
import { loginUserCenter } from '@/api/userCenter';
import AuthPages from '@/pages/Auth/AuthPages';

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

vi.mock('@/api/profile', () => ({
  fetchMyProfile: vi.fn()
}));

vi.mock('@/assets/background.jpg', () => ({ default: 'bg.jpg' }));
vi.mock('@/assets/logo.svg', () => ({ default: 'logo.svg' }));

describe('AuthLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    (fetchMyProfile as Mock).mockResolvedValue(null);
  });

  test('рендерит форму логина', async () => {
    renderWithProviders(<AuthPages mode="login" />);
    expect(
      await screen.findByPlaceholderText(/example@omninotice/i)
    ).toBeInTheDocument();
    expect(await screen.findByText('Войти')).toBeInTheDocument();
  });

  test('есть ссылка "Зарегистрируйтесь"', async () => {
    renderWithProviders(<AuthPages mode="login" />);
    expect(await screen.findByText(/Зарегистрируйтесь/i)).toBeInTheDocument();
  });

  test('есть кнопка "На главную"', () => {
    renderWithProviders(<AuthPages mode="login" />);
    expect(screen.getByText('На главную')).toBeInTheDocument();
  });

  test('клик по "Зарегистрируйтесь" ведёт на /registration', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPages mode="login" />);

    await user.click(await screen.findByText(/Зарегистрируйтесь/i));

    expect(mockNavigate).toHaveBeenCalledWith('/registration', {
      state: null
    });
  });

  test('клик по "На главную" ведёт на /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPages mode="login" />);

    await user.click(screen.getByText('На главную'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('успешный логин вызывает setAuth и редирект', async () => {
    const user = userEvent.setup();
    (loginUserCenter as Mock).mockResolvedValueOnce({
      accessToken: 'token123',
      userId: 'user-123',
      login: 'user@mail.com',
      accountId: 'account-123'
    });

    renderWithProviders(<AuthPages mode="login" />);

    await user.type(
      await screen.findByPlaceholderText(/example@omninotice/i),
      'user@mail.com'
    );
    await user.type(
      await screen.findByPlaceholderText(/введите пароль/i),
      'password123'
    );
    await user.click(await screen.findByText('Войти'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('при наличии профиля в UserCenter логин подгружает имя и фамилию в authState и сессию', async () => {
    const user = userEvent.setup();
    (loginUserCenter as Mock).mockResolvedValueOnce({
      accessToken: 'token123',
      userId: 'user-123',
      login: 'user@mail.com',
      accountId: 'account-123'
    });
    (fetchMyProfile as Mock).mockResolvedValueOnce({
      first_name: 'Алексей',
      last_name: 'Смирнов',
      contact_email: [{ title: 'work', value: 'alex@work.com' }]
    });

    renderWithProviders(<AuthPages mode="login" />);

    await user.type(
      screen.getByPlaceholderText(/example@omninotice/i),
      'user@mail.com'
    );
    await user.type(
      screen.getByPlaceholderText(/введите пароль/i),
      'password123'
    );
    await user.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          login: 'user@mail.com',
          firstName: 'Алексей',
          lastName: 'Смирнов'
        })
      );
    });

    const stored = JSON.parse(sessionStorage.getItem('profile_data') || '{}');
    expect(stored.firstName).toBe('Алексей');
    expect(stored.lastName).toBe('Смирнов');
  });
});
