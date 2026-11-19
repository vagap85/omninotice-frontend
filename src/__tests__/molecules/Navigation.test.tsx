import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Navigation from '@/components/molecules/Navigation/Navigation';

let mockIsAuthorized = false;

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: mockIsAuthorized,
    logout: vi.fn(),
    authState: null,
    updateUser: vi.fn()
  })
}));

function renderNavigationWithRoutes(initialEntry = '/') {
  return render(
    <ChakraProvider>
      <MemoryRouter
        initialEntries={[initialEntry]}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<Navigation />} />
          <Route path="/links" element={<div data-testid="links-page">Страница списка ссылок</div>} />
          <Route path="/links-landing" element={<div data-testid="links-landing-page">Лендинг ссылок</div>} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe('Navigation', () => {
  beforeEach(() => {
    mockIsAuthorized = false;
  });

  test('неавторизованный пользователь видит ссылку "Сократить ссылку", ведущую на /links-landing', () => {
    mockIsAuthorized = false;
    renderNavigationWithRoutes();

    const link = screen.getByRole('link', { name: /сократить ссылку/i });
    expect(link).toHaveAttribute('href', '/links-landing');
  });

  test('авторизованный пользователь видит ссылку "Сократить ссылку", ведущую на /links', () => {
    mockIsAuthorized = true;
    renderNavigationWithRoutes();

    const link = screen.getByRole('link', { name: /сократить ссылку/i });
    expect(link).toHaveAttribute('href', '/links');
  });

  test('при клике авторизованный пользователь переходит в раздел со списком ссылок /links', async () => {
    mockIsAuthorized = true;
    const user = userEvent.setup();
    renderNavigationWithRoutes();

    const link = screen.getByRole('link', { name: /сократить ссылку/i });
    await user.click(link);

    expect(screen.getByTestId('links-page')).toBeInTheDocument();
  });

  test('при клике неавторизованный пользователь переходит на лендинг /links-landing', async () => {
    mockIsAuthorized = false;
    const user = userEvent.setup();
    renderNavigationWithRoutes();

    const link = screen.getByRole('link', { name: /сократить ссылку/i });
    await user.click(link);

    expect(screen.getByTestId('links-landing-page')).toBeInTheDocument();
  });
});
