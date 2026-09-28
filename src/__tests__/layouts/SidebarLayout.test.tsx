import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';

import SidebarLayout from '@/components/layouts/SidebarLayout';

// ===== МОКИ =====

vi.mock('@/components/organisms/Sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('@/components/molecules/PageHeader/PageHeader', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  )
}));

let mockIsAuthorized = false;
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: mockIsAuthorized, login: vi.fn() })
}));

// ===== СВОЙ RENDER (с MemoryRouter + initialEntries) =====

function renderLayout(path: string) {
  return render(
    <ChakraProvider>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <SidebarLayout />
      </MemoryRouter>
    </ChakraProvider>
  );
}

// ===== ТЕСТЫ =====

describe('SidebarLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthorized = false;
  });

  test('рендерит Sidebar', () => {
    renderLayout('/overview');
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('рендерит PageHeader', () => {
    renderLayout('/overview');
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  test('показывает заголовок для /create/email', () => {
    renderLayout('/create/email');
    expect(screen.getByTestId('page-header')).toHaveTextContent(
      /Создание e-mail рассылки/i
    );
  });

  test('показывает заголовок для /create/push', () => {
    renderLayout('/create/push');
    expect(screen.getByTestId('page-header')).toHaveTextContent(
      /Создание рассылки push-уведомлений/i
    );
  });

  test('показывает заголовок для /overview', () => {
    renderLayout('/overview');
    expect(screen.getByTestId('page-header')).toHaveTextContent(/Обзор/i);
  });

  test('не показывает заголовок для неизвестного пути', () => {
    renderLayout('/unknown');
    expect(screen.getByTestId('page-header')).toHaveTextContent('');
  });
});