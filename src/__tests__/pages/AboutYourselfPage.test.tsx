import userEvent from '@testing-library/user-event';
import { type Mock, describe, test, expect, vi, beforeEach } from 'vitest';

import AboutYourselfPage from '@/pages/Auth/AboutYourselfPage';
import { profileService } from '@/services/profile';

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

const mockUpdateUser = vi.fn();
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    authState: { userId: '123', login: 'user@example.com' },
    isAuthorized: true,
    updateUser: mockUpdateUser
  })
}));

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast
  };
});

vi.mock('@/services/profile', () => ({
  profileService: {
    saveProfile: vi.fn()
  }
}));

vi.mock('@/assets/background.jpg', () => ({ default: 'bg.jpg' }));
vi.mock('@/assets/logo.svg', () => ({ default: 'logo.svg' }));

describe('AboutYourselfPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocationState.value = null;
  });

  test('рендерит заголовок и поля формы', () => {
    renderWithProviders(<AboutYourselfPage />);

    expect(
      screen.getByText('Пожалуйста, расскажите о себе')
    ).toBeInTheDocument();
    expect(screen.getByText(/Имя/)).toBeInTheDocument();
    expect(screen.getByText('Фамилия')).toBeInTheDocument();
    expect(screen.getByText('Должность')).toBeInTheDocument();
    expect(screen.getByText('Номер телефона')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Например, Маркетолог')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+7 999 999 99 99')).toBeInTheDocument();
    expect(screen.getByText('Сохранить данные')).toBeInTheDocument();
  });

  test('клик по "На главную" ведёт на /', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AboutYourselfPage />);

    await user.click(screen.getByText('На главную'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('показывает ошибку при пустом имени', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AboutYourselfPage />);

    await user.click(screen.getByText('Сохранить данные'));

    expect(screen.getByText('Введите имя')).toBeInTheDocument();
    expect(profileService.saveProfile).not.toHaveBeenCalled();
  });

  test('после сохранения без исходной страницы переходит на главную', async () => {
    const user = userEvent.setup();
    (profileService.saveProfile as Mock).mockResolvedValueOnce(undefined);

    renderWithProviders(<AboutYourselfPage />);

    const inputs = screen.getAllByRole('textbox');
    // inputs[0] is Имя, inputs[1] is Фамилия, inputs[2] is Должность, inputs[3] is Телефон
    await user.type(inputs[0], 'Иван');
    await user.type(inputs[1], 'Иванов');
    await user.type(inputs[2], 'Маркетолог');
    await user.type(inputs[3], '+7 999 123 45 67');

    await user.click(screen.getByText('Сохранить данные'));

    await waitFor(() => {
      expect(profileService.saveProfile).toHaveBeenCalledWith({
        firstName: 'Иван',
        lastName: 'Иванов',
        position: 'Маркетолог',
        phone: '+7 999 123 45 67',
        email: 'user@example.com'
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({
        firstName: 'Иван',
        lastName: 'Иванов'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  test('после сохранения возвращает пользователя на внутреннюю страницу', async () => {
    const user = userEvent.setup();
    mockLocationState.value = {
      from: {
        pathname: '/campaigns',
        search: '?status=active',
        hash: '#list'
      }
    };
    (profileService.saveProfile as Mock).mockResolvedValueOnce(undefined);

    renderWithProviders(<AboutYourselfPage />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Иван');
    await user.click(screen.getByText('Сохранить данные'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/campaigns?status=active#list',
        {
          replace: true
        }
      );
    });
  });

  test('показывает ошибку при сбое сохранения', async () => {
    const user = userEvent.setup();
    (profileService.saveProfile as Mock).mockRejectedValueOnce(
      new Error('Ошибка сети при сохранении')
    );

    renderWithProviders(<AboutYourselfPage />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Иван');
    await user.click(screen.getByText('Сохранить данные'));

    await waitFor(() => {
      expect(
        screen.getByText('Ошибка сети при сохранении')
      ).toBeInTheDocument();
    });
  });
});
