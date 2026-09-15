import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen } from '../../test/utils';
import PushNotification from '@/pages/Notifications/PushNotification';

// ===== МОКИ =====

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Изменяемый мок useAuth — управляем через переменную
let mockIsAuthorized = false;
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: mockIsAuthorized, login: vi.fn() }),
}));

// Мокаем тяжёлые дочерние компоненты
vi.mock('@/components/organisms/Forms/Push/PushDraftUrlSync', () => ({
  default: () => null,
}));
vi.mock('@/components/organisms/Forms/Push/ActionSectTest', () => ({
  default: () => <div data-testid="action-sect">Action Section</div>,
}));
vi.mock('@/components/organisms/Forms/Push/NotifContSectTest', () => ({
  default: () => <div data-testid="notif-cont">Notification Content</div>,
}));
vi.mock('@/components/organisms/SelectingRecipientApp-v2/SelectingRecipientAppTest', () => ({
  default: () => <div data-testid="recipients">Recipients Panel</div>,
}));
vi.mock('@/components/molecules/PageHeader/PageHeader', () => ({
  default: ({ title }: any) => <div data-testid="page-header">{title}</div>,
}));

describe('PushNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthorized = false;
  });

  test('редиректит на /login если не авторизован', () => {
    mockIsAuthorized = false;
    renderWithProviders(<PushNotification />);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('рендерит форму если авторизован', () => {
    mockIsAuthorized = true;
    renderWithProviders(<PushNotification />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('notif-cont')).toBeInTheDocument();
    expect(screen.getByTestId('action-sect')).toBeInTheDocument();
    expect(screen.getByTestId('recipients')).toBeInTheDocument();
  });

  test('показывает заголовок страницы', () => {
    mockIsAuthorized = true;
    renderWithProviders(<PushNotification />);

    expect(screen.getByTestId('page-header')).toHaveTextContent(
      /Создание рассылки push-уведомлений/i
    );
  });

  test('не редиректит если авторизован', () => {
    mockIsAuthorized = true;
    renderWithProviders(<PushNotification />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});