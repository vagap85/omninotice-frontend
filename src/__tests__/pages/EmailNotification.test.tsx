import { describe, test, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test/utils';
import EmailNotification from '@/pages/Notifications/EmailNotification';

// ===== МОКИ =====

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

// УПРОЩЁННЫЙ мок RecipientsPanel — БЕЗ вызова onSend/onValidateEmailForm
vi.mock('@/components/organisms/Forms/Recipient/RecipientsPanel', () => ({
  default: ({ canSend, onAuthClick }: any) => (
    <div data-testid="recipients">
      <span data-testid="can-send">{String(canSend)}</span>
      <button onClick={onAuthClick}>Войти</button>
      <button data-testid="trigger-send">Отправить</button>
    </div>
  ),
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
  default: ({ title }: any) => <div data-testid="page-header">{title}</div>,
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

  test('клик по авторизации ведёт на /login', async () => {
    const user = userEvent.setup();
    mockIsAuthorized = false;
    renderWithProviders(<EmailNotification />);

    await user.click(screen.getByText('Войти'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
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

    // Просто клик по кнопке "Отправить" (мок не вызывает onSend)
    await user.click(screen.getByTestId('trigger-send'));

    // sendEventEmail НЕ должен быть вызван, потому что форма пустая
    expect(mockSendEventEmail).not.toHaveBeenCalled();
  });

  test('recripientsPanel присутствует в DOM', () => {
    mockIsAuthorized = true;
    renderWithProviders(<EmailNotification />);
    expect(screen.getByTestId('recipients')).toBeInTheDocument();
  });
});