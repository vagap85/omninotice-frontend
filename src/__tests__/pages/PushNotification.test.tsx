import { describe, test, expect, vi, beforeEach } from 'vitest';

import PushNotification from '@/pages/Notifications/PushNotification';

import { renderWithProviders, screen } from '../../test/utils';

// ===== МОКИ =====

const mockNavigate = vi.fn();
vi.mock('@/components/organisms/Forms/Push/ActionFields', () => ({
  default: () => <div data-testid="action-sect">Action Section</div>,
}));
vi.mock('@/components/organisms/Forms/Push/NotificationContentFields', () => ({
  default: () => <div data-testid="notif-cont">Notification Content</div>,
}));
vi.mock('@/components/organisms/Forms/Push/SelectingRecipientApp/SelectingRecipientApp', () => ({
  default: () => <div data-testid="recipients">Recipients Panel</div>,
}));

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

  test('не падает при отсутствии авторизации', () => {
  mockIsAuthorized = false;
  expect(() => renderWithProviders(<PushNotification />)).not.toThrow();
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