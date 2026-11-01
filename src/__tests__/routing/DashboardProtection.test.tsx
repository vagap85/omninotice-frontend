import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import App from '@/App';

let mockIsAuthorized = false;

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: mockIsAuthorized,
    login: vi.fn(),
    logout: vi.fn()
  })
}));

vi.mock('@/components/organisms/Sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('@/components/molecules/PageHeader/PageHeader', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="page-header">{title}</div>
  )
}));

vi.mock('@/pages/Auth/AuthLoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}));

vi.mock('@/pages/ProfilePage/ProfilePage', () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>
}));

vi.mock('@/pages/OverviewPage/OverviewPage', () => ({
  OverviewPage: () => <div data-testid="overview-page">Overview Page</div>
}));

function renderApp(initialPath: string) {
  return render(
    <ChakraProvider>
      <MemoryRouter
        initialEntries={[initialPath]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe('Dashboard and Overview route protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthorized = false;
  });

  test('неавторизованный пользователь при переходе на /dashboard перенаправляется на /login', async () => {
    mockIsAuthorized = false;
    renderApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('overview-page')).not.toBeInTheDocument();
  });

  test('неавторизованный пользователь при переходе на /overview перенаправляется на /login', async () => {
    mockIsAuthorized = false;
    renderApp('/overview');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('overview-page')).not.toBeInTheDocument();
  });

  test('неавторизованный пользователь при переходе на /dashboard/profile перенаправляется на /login', async () => {
    mockIsAuthorized = false;
    renderApp('/dashboard/profile');

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('profile-page')).not.toBeInTheDocument();
  });

  test('авторизованный пользователь получает доступ к /overview', async () => {
    mockIsAuthorized = true;
    renderApp('/overview');

    await waitFor(() => {
      expect(screen.getByTestId('overview-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  test('авторизованный пользователь при переходе на /dashboard перенаправляется на /overview', async () => {
    mockIsAuthorized = true;
    renderApp('/dashboard');

    await waitFor(() => {
      expect(screen.getByTestId('overview-page')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
