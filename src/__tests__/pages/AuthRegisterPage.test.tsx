import userEvent from '@testing-library/user-event';
import { type Mock, describe, test, expect, vi, beforeEach } from 'vitest';

import { createUserCenter, loginUserCenter } from '@/api/userCenter';
import AuthPages from '@/pages/Auth/AuthPages';

import { renderWithProviders, screen, waitFor } from '../../test/utils';

// ===== МОКИ =====

const mockNavigate = vi.fn();
const mockLocationState = { value: null as unknown };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState.value })
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

// ===== НИКАКИХ МОКОВ СТРАНИЦ! =====

describe('AuthRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState.value = null;
  });

  test('рендерит форму регистрации', async () => {
    renderWithProviders(<AuthPages mode="register" />);
    
    // Ждем появления реального поля ввода (Suspense загрузит компонент)
    expect(
      await screen.findByPlaceholderText(/example@omninotice/i, {}, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Создать аккаунт', {}, { timeout: 4000 })
    ).toBeInTheDocument();
  });

  test('есть 3 поля: логин, пароль, подтверждение', async () => {
    renderWithProviders(<AuthPages mode="register" />);
    
    expect(
      await screen.findByPlaceholderText(/example@omninotice/i, {}, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByPlaceholderText(/введите пароль/i, {}, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByPlaceholderText(/повторите пароль/i, {}, { timeout: 4000 })
    ).toBeInTheDocument();
  });

  test('есть ссылка "У меня уже есть аккаунт"', async () => {
    renderWithProviders(<AuthPages mode="register" />);
    
    expect(
      await screen.findByText(/У меня уже есть аккаунт/i, {}, { timeout: 4000 })
    ).toBeInTheDocument();
  });

  test('клик по "У меня уже есть аккаунт" ведёт на /login', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPages mode="register" />);

    await user.click(await screen.findByText(/У меня уже есть аккаунт/i, {}, { timeout: 4000 }));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('клик по "На главную" ведёт на /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPages mode="register" />);

    // Ждем загрузки формы
    await screen.findByPlaceholderText(/example@omninotice/i, {}, { timeout: 4000 });
    await user.click(screen.getByText('На главную'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('успешная регистрация вызывает setAuth и редирект', async () => {
    const user = userEvent.setup();
    mockLocationState.value = {
      from: { pathname: '/campaigns', search: '?status=active' }
    };
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

    renderWithProviders(<AuthPages mode="register" />);

    await user.type(
      await screen.findByPlaceholderText(/example@omninotice/i, {}, { timeout: 4000 }),
      'new@mail.com'
    );
    await user.type(
      await screen.findByPlaceholderText(/введите пароль/i, {}, { timeout: 4000 }),
      'password123'
    );
    await user.type(
      await screen.findByPlaceholderText(/повторите пароль/i, {}, { timeout: 4000 }),
      'password123'
    );
    
    await user.click(await screen.findByText('Создать аккаунт'));

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
      expect(mockNavigate).toHaveBeenCalledWith('/about-yourself', {
        state: mockLocationState.value
      });
    });
  });

  test('ошибка регистрации показывается пользователю', async () => {
    const user = userEvent.setup();
    (createUserCenter as Mock).mockRejectedValueOnce(
      new Error('Логин уже занят')
    );

    renderWithProviders(<AuthPages mode="register" />);

    await user.type(
      await screen.findByPlaceholderText(/example@omninotice/i, {}, { timeout: 4000 }),
      'taken@mail.com'
    );
    await user.type(
      await screen.findByPlaceholderText(/введите пароль/i, {}, { timeout: 4000 }),
      'password123'
    );
    await user.type(
      await screen.findByPlaceholderText(/повторите пароль/i, {}, { timeout: 4000 }),
      'password123'
    );
    
    await user.click(await screen.findByText('Создать аккаунт'));

    await waitFor(() => {
      expect(screen.getByText('Логин уже занят')).toBeInTheDocument();
    });
  });
});