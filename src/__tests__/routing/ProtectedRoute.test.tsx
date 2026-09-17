import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import ProtectedRoute from '@/routing/ProtectedRoute';

let mockIsAuthorized = false;
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: mockIsAuthorized }),
}));

function renderWithRouting(ui: React.ReactNode, initialEntries: string[] = ['/']) {
  return render(
    <ChakraProvider>
      <MemoryRouter
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {ui}
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe('ProtectedRoute', () => {
  test('редиректит на /login если не авторизован', () => {
    mockIsAuthorized = false;

    renderWithRouting(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/create/push" element={<div data-testid="secret">Secret</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>,
      ['/create/push']
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
  });

  test('рендерит контент если авторизован', () => {
    mockIsAuthorized = true;

    renderWithRouting(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/create/push" element={<div data-testid="secret">Secret</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login-page">Login</div>} />
      </Routes>,
      ['/create/push']
    );

    expect(screen.getByTestId('secret')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});