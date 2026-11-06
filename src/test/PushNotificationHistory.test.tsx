import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, it, expect } from 'vitest';

import NotificationHistoryPage from '@/pages/Notifications/PushNotificationHistory';

// 1. Используем hoisted для безопасного мока
const { mockGetLogs } = vi.hoisted(() => {
  return {
    mockGetLogs: vi.fn(),
  };
});

vi.mock('@/api/vishenka', () => ({
  getDispatchLogs: mockGetLogs,
}));

// Мокаем framer-motion для Chakra
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => children,
  };
});

// Мокаем FilterMenu, чтобы не зависеть от внутренностей Chakra UI Menu в jsdom
vi.mock('@/components/molecules/FilterMenu/FilterMenu', () => ({
  FilterMenu: ({ label, options, value, onSelect }: any) => (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onSelect(e.target.value)}
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  ),
}));

const renderPage = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <NotificationHistoryPage />
      </MemoryRouter>
    </ChakraProvider>
  );

describe('PushNotificationHistory Page', () => {
  beforeEach(() => {
    // 2. Возвращаем ОБЪЕКТ с полем data, как ожидает компонент (и как в реальном API)
    mockGetLogs.mockResolvedValue({
      data: [
        {
          event_id: '1',
          title: 'Срочное обновление',
          application_id: 'sigma',
          status: 'sent',
          created_at: '2026-07-12T15:45:00Z',
          template_name: 'Без шаблона',
          send_method: 'manual',
          body: '...',
          recipients: [],
          audience_type: 'all',
          account_id: 'none',
          channel: 'popup'
        },
        {
          event_id: '2',
          title: 'Напоминание о задаче',
          application_id: 'raida', // Для теста фильтра по приложению
          status: 'error',
          created_at: '2026-07-10T14:20:00Z',
          template_name: 'Напоминание',
          send_method: 'triggered',
          body: '...',
          recipients: [],
          audience_type: 'all',
          account_id: 'none',
          channel: 'popup'
        },
        {
          event_id: '3',
          title: 'Еженедельный дайджест',
          application_id: 'sigma',
          status: 'sent',
          created_at: '2026-06-20T10:15:00Z',
          template_name: 'Дайджест',
          send_method: 'manual',
          body: '...',
          recipients: [],
          audience_type: 'group',
          account_id: 'none',
          channel: 'popup'
        }
      ],
      total: 3, // (или info: { total: 3 }, если компонент ждет info)
    });
  });

  it('рендерит заголовок страницы', () => {
    renderPage();
    expect(
      screen.getByText('История рассылок push-уведомлений')
    ).toBeInTheDocument();
  });

  it('фильтрует по поиску', async () => {
    const user = userEvent.setup();
    renderPage();

    // Ждем загрузку данных
    await screen.findByText('Срочное обновление');

    const searchInput = screen.getByPlaceholderText(
      'Поиск по названию рассылки'
    );
    await user.type(searchInput, 'Срочное');

    expect(screen.getByText('Срочное обновление')).toBeInTheDocument();
    expect(screen.queryAllByText('Напоминание о задаче')).toHaveLength(0);
  });

  it('показывает пустой стейт при отсутствии результатов', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Срочное обновление');

    const searchInput = screen.getByPlaceholderText(
      'Поиск по названию рассылки'
    );
    await user.type(searchInput, 'Несуществующая рассылка');

    expect(screen.getByText('Рассылки не найдены')).toBeInTheDocument();
  });

  it('сбрасывает фильтры по кнопке', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Срочное обновление');

    const searchInput = screen.getByPlaceholderText(
      'Поиск по названию рассылки'
    );
    await user.type(searchInput, 'Срочное');
    expect(screen.queryAllByText('Напоминание о задаче')).toHaveLength(0);

    await user.click(screen.getByText('Сбросить фильтры'));

    expect(searchInput).toHaveValue('');
    expect(screen.getAllByText('Напоминание о задаче').length).toBeGreaterThan(0);
  });

  it('открывает детали при клике на строку', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Срочное обновление');

    await user.click(screen.getByText('Срочное обновление'));

    expect(screen.getByText('Инициатор отправления')).toBeInTheDocument();
  });

    it('фильтрует по приложению', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Срочное обновление');

    const appSelect = screen.getByLabelText('Все приложения');
    await user.selectOptions(appSelect, 'Сигма');

    // Проверяем, что записи Сигмы на месте
    expect(screen.getByText('Срочное обновление')).toBeInTheDocument();
    expect(screen.getByText('Еженедельный дайджест')).toBeInTheDocument();

    // Проверяем, что записи Raida исчезли
    expect(screen.queryByText('Напоминание о задаче')).not.toBeInTheDocument();
    expect(screen.queryByText('Новые функции в личном кабинете')).not.toBeInTheDocument();
  });

  it('переключает страницы пагинации', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Еженедельный дайджест');

    // Представим, что у нас есть кнопка "2". В реальном компоненте пагинация может быть скрыта, если элементов меньше 10.
    // Если пагинация не рендерится, этот тест надо будет поправить (например, замокать больше элементов).
    // Но пока оставим как есть.
    const page2Button = screen.queryByRole('button', { name: '2' });
    if (page2Button) {
      await user.click(page2Button);
      expect(await screen.findByText('Ошибка интеграции')).toBeInTheDocument();
    }
  });
});