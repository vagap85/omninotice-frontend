import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { NotificationsTable } from '@/components/organisms/Tables/NotificationTable';
import { MOCK_DATA } from '@/mocks/notificationMocks';

// Заглушка для framer-motion (Chakra Tooltip использует анимации)
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => children,
  };
});

describe('NotificationsTable', () => {
  const defaultProps = {
    data: MOCK_DATA.slice(0, 3),
    expandedId: null,
    onRowClick: vi.fn(),
  };

  it('рендерит заголовки таблицы', () => {
    render(<NotificationsTable {...defaultProps} />);

    expect(screen.getByText('Приложение')).toBeInTheDocument();
    expect(screen.getByText('Шаблон')).toBeInTheDocument();
    expect(screen.getByText('Заголовок')).toBeInTheDocument();
    expect(screen.getByText('Отправлено')).toBeInTheDocument();
    expect(screen.getByText('Дата и время')).toBeInTheDocument();
    expect(screen.getByText('Статус')).toBeInTheDocument();
  });

  it('рендерит строки с данными из моков', () => {
    render(<NotificationsTable {...defaultProps} />);

    expect(screen.getAllByText('Напоминание о задаче').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Срочное обновление')).toBeInTheDocument();
  });

  it('вызывает onRowClick при клике на строку', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <NotificationsTable
        {...defaultProps}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText('Срочное обновление'));

    expect(onRowClick).toHaveBeenCalledWith('evt_002');
  });

  it('раскрывает детали при isExpanded=true', () => {
    render(
      <NotificationsTable
        {...defaultProps}
        expandedId="evt_002"
      />
    );

    expect(screen.getByText('Описание')).toBeInTheDocument();
    expect(screen.getByText('Способ отправки')).toBeInTheDocument();
    expect(screen.getByText('Триггерная')).toBeInTheDocument();
    expect(screen.getByText('Инициатор отправления')).toBeInTheDocument();
  });

  it('не показывает детали, если строка не раскрыта', () => {
    render(<NotificationsTable {...defaultProps} />);

    expect(screen.queryByText('Инициатор отправления')).not.toBeInTheDocument();
  });
});