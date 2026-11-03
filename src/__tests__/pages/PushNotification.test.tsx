import { describe, test, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import PushNotification from '@/pages/Notifications/PushNotification';
import { renderWithProviders, screen } from '../../test/utils';

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/api/templatesApi', () => ({
  getTemplates: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/components/organisms/Forms/Push/ActionFields', () => ({
  default: () => <div data-testid="action-sect">Action Section</div>,
}));
vi.mock('@/components/organisms/Forms/Push/NotificationContentFields', () => ({
  default: () => <div data-testid="notif-cont">Notification Content</div>,
}));
vi.mock(
  '@/components/organisms/Forms/Push/SelectingRecipientApp/SelectingRecipientApp',
  () => ({ default: () => <div data-testid="recipients">Recipients Panel</div> }),
);
vi.mock('@/components/organisms/Forms/Push/PushDraftUrlSync', () => ({
  default: () => null,
}));

let mockIsAuthorized = false;
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: mockIsAuthorized, login: vi.fn() }),
}));

describe('PushNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthorized = false;
  });

  test('не падает при отсутствии авторизации', () => {
    expect(() => renderWithProviders(<PushNotification />)).not.toThrow();
  });

  test('рендерит форму если авторизован', async () => {
    mockIsAuthorized = true;
    renderWithProviders(<PushNotification />);

    expect(await screen.findByTestId('notif-cont')).toBeInTheDocument();
    expect(screen.getByTestId('action-sect')).toBeInTheDocument();
    expect(screen.getByTestId('recipients')).toBeInTheDocument();
  });

  test('не редиректит если авторизован', async () => {
    mockIsAuthorized = true;
    renderWithProviders(<PushNotification />);
    await waitFor(() => expect(mockNavigate).not.toHaveBeenCalled());
  });
});

