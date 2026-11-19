import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';

import ProtectedRoute from '@/routing/ProtectedRoute';

let mockIsAuthorized = false;
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: mockIsAuthorized })
}));

function renderWithRouting(
  ui: React.ReactNode,
  initialEntries: string[] = ['/']
) {
  return render(
    <ChakraProvider>
      <MemoryRouter
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        {ui}
      </MemoryRouter>
    </ChakraProvider>
  );
}

function TestProtectedRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route
          path="/create/push"
          element={<div data-testid="secret-push">Push content</div>}
        />
        <Route
          path="/links"
          element={<div data-testid="secret-links">Links content</div>}
        />
        <Route
          path="/campaigns"
          element={<div data-testid="secret-campaigns">Campaigns content</div>}
        />
      </Route>
      <Route
        path="/login"
        element={<div data-testid="login-page">Login</div>}
      />
    </Routes>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockIsAuthorized = false;
  });

  test('редиректит на /login если не авторизован', () => {
    mockIsAuthorized = false;

    renderWithRouting(<TestProtectedRoutes />, ['/create/push']);

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('secret-push')).not.toBeInTheDocument();
  });

  test('рендерит контент если авторизован', () => {
    mockIsAuthorized = true;

    renderWithRouting(<TestProtectedRoutes />, ['/create/push']);

    expect(screen.getByTestId('secret-push')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  test('страница /links недоступна неавторизованному пользователю и редиректит на /login', () => {
    mockIsAuthorized = false;

    renderWithRouting(<TestProtectedRoutes />, ['/links']);

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('secret-links')).not.toBeInTheDocument();
  });

  test('страница /links доступна авторизованному пользователю', () => {
    mockIsAuthorized = true;

    renderWithRouting(<TestProtectedRoutes />, ['/links']);

    expect(screen.getByTestId('secret-links')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  test('страница /campaigns недоступна неавторизованному пользователю и редиректит на /login', () => {
    mockIsAuthorized = false;

    renderWithRouting(<TestProtectedRoutes />, ['/campaigns']);

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('secret-campaigns')).not.toBeInTheDocument();
  });

  test('страница /campaigns доступна авторизованному пользователю', () => {
    mockIsAuthorized = true;

    renderWithRouting(<TestProtectedRoutes />, ['/campaigns']);

    expect(screen.getByTestId('secret-campaigns')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
