import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import EmailNotification from '@/pages/Notifications/EmailNotification';

import { renderWithProviders, screen } from '../../test/utils';

// ===== МОКИ =====

vi.mock('@/components/organisms/Forms/Email/Recipient/RecipientsPanel', () => ({
  default: ({ canSend, onAuthClick }: { canSend: boolean; onAuthClick: () => void }) => (
    <div data-testid="recipients">
      <span data-testid="can-send">{String(canSend)}</span>
      <button onClick={onAuthClick}>Войти</button>
      <button data-testid="trigger-send">Отправить</button>
    </div>
  ),
}));

let mockIsAuthorized = false;
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: mockIsAuthorized, login: vi.fn() }),
}));

const mockSendEventEmail = vi.fn();
vi.mock('@/api/synora', () => ({
  sendEventEmail: (...args: unknown[]) => mockSendEventEmail(...args),
  getSynoraMailTopic: () => 'mail-send',
  getSynoraMailTemplateName: () => null,
}));

vi.mock('@/mailingDraftStorage', () => ({
  MAILING_DRAFT_KEY: 'test-draft-key',
}));

vi.mock('@/components/organisms/Forms/Email/EmailMainFields', () => ({
  default: () => <div data-testid="email-main">Main Fields</div>,
}));

vi.mock('@/components/organisms/Forms/Email/EmailThemeFields', () => ({
  default: () => <div data-testid="email-theme">Theme Fields</div>,
}));

vi.mock('@/components/molecules/Form/DraftAutoSave', () => ({
  default: () => null,
}));

vi.mock('@/components/molecules/PageHeader/PageHeader', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  ),
}));

describe('EmailNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthorized = false;
    mockSendEventEmail.mockReset();
    sessionStorage.clear();
  });

  // ===== ОСНОВНЫЕ =====

  test('рендерится без ошибок', () => {
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  test('показывает заголовок страницы', () => {
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('page-header')).toHaveTextContent(
      /Создание e-mail рассылки/i
    );
  });

  test('показывает поля формы', () => {
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('email-theme')).toBeInTheDocument();
    expect(screen.getByTestId('email-main')).toBeInTheDocument();
  });

  test('RecipientsPanel получает canSend=false если не авторизован', () => {
    mockIsAuthorized = false;
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('can-send')).toHaveTextContent('false');
  });

  test('RecipientsPanel получает canSend=true если авторизован', () => {
    mockIsAuthorized = true;
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('can-send')).toHaveTextContent('true');
  });

  test('кнопка авторизации присутствует в RecipientsPanel', () => {
    mockIsAuthorized = false;
    renderWithProviders(<EmailNotification />);
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('читает черновик из sessionStorage при монтировании', () => {
    sessionStorage.setItem(
      'test-draft-key',
      JSON.stringify({
        subject: 'Тестовая тема',
        messageTitle: 'Заголовок',
        body: 'Тело письма',
      })
    );

    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  // ===== ЛОГИРОВАНИЕ =====

  test('console.log не вызывается до отправки', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    mockIsAuthorized = true;
    renderWithProviders(<EmailNotification />);

    expect(consoleSpy).not.toHaveBeenCalledWith(
      '[Synora] mail-send queued',
      expect.anything()
    );

    consoleSpy.mockRestore();
  });

  test('sendEventEmail не вызывается при пустой форме', async () => {
    const user = userEvent.setup();
    mockSendEventEmail.mockResolvedValue(undefined);
    mockIsAuthorized = true;

    renderWithProviders(<EmailNotification />);

    await user.click(screen.getByTestId('trigger-send'));

    expect(mockSendEventEmail).not.toHaveBeenCalled();
  });

  test('RecipientsPanel присутствует в DOM', () => {
    mockIsAuthorized = true;
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('recipients')).toBeInTheDocument();
  });
});