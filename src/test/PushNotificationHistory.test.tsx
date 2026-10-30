import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { vi } from 'vitest';

import NotificationHistoryPage from '@/pages/Notifications/PushNotificationHistory';

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
  it('рендерит заголовок страницы', () => {
    renderPage();
    expect(
      screen.getByText('История рассылок push-уведомлений')
    ).toBeInTheDocument();
  });

  it('фильтрует по поиску', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(
      'Поиск по названию рассылки'
    );
    await user.type(searchInput, 'Срочное');

    // «Срочное обновление» должно остаться
    expect(screen.getByText('Срочное обновление')).toBeInTheDocument();
    // «Напоминание о задаче» должно исчезнуть
    expect(screen.queryAllByText('Напоминание о задаче')).toHaveLength(0);
  });

  it('показывает пустой стейт при отсутствии результатов', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(
      'Поиск по названию рассылки'
    );
    await user.type(searchInput, 'Несуществующая рассылка');

    expect(screen.getByText('Рассылки не найдены')).toBeInTheDocument();
  });

  it('сбрасывает фильтры по кнопке', async () => {
    const user = userEvent.setup();
    renderPage();

    const searchInput = screen.getByPlaceholderText(
      'Поиск по названию рассылки'
    );
    await user.type(searchInput, 'Срочное');
    expect(screen.queryAllByText('Напоминание о задаче')).toHaveLength(0);

    await user.click(screen.getByText('Сбросить фильтры'));

    expect(searchInput).toHaveValue('');
    expect(screen.getAllByText('Напоминание о задаче').length).toBeGreaterThan(
      0
    );
  });

  it('открывает детали при клике на строку', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByText('Срочное обновление'));

    expect(screen.getByText('Инициатор отправления')).toBeInTheDocument();
  });

  it('фильтрует по приложению', async () => {
    const user = userEvent.setup();
    renderPage();

    const appSelect = screen.getByLabelText('Все приложения');
    await user.selectOptions(appSelect, 'Сигма');

    // Записи «Сигма» должны остаться (текст встречается в двух колонках, поэтому getAllByText)
    expect(
      screen.getAllByText('Напоминание о задаче').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Срочное обновление')).toBeInTheDocument();

    // Записи «raida» должны исчезнуть (проверяем по уникальным заголовкам)
    expect(
      screen.queryByText('Новые функции в личном кабинете')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Запрос на отпуск')).not.toBeInTheDocument();
  });

  it('переключает страницы пагинации', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByText('Еженедельный дайджест')).toBeInTheDocument();

    const page2Button = screen.getByRole('button', { name: '2' });
    await user.click(page2Button);

    expect(screen.getByText('Ошибка интеграции')).toBeInTheDocument();
    expect(screen.queryByText('Еженедельный дайджест')).not.toBeInTheDocument();
  });
});