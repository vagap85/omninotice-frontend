import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import LinksLandingPage from '@/pages/Shortener/LinksLandingPage/LinksLandingPage';

let mockIsAuthorized = false;

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: mockIsAuthorized,
    logout: vi.fn(),
    authState: mockIsAuthorized ? { login: 'test@example.com' } : null,
    updateUser: vi.fn()
  })
}));

vi.mock('@/api/profile', () => ({
  fetchMyProfile: vi.fn().mockResolvedValue(null)
}));

function renderPage(initialEntry = '/links-landing') {
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
          <Route path="/links-landing" element={<LinksLandingPage />} />
          <Route path="/links" element={<div data-testid="links-dashboard">Страница списка ссылок</div>} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  );
}

describe('LinksLandingPage', () => {
  beforeEach(() => {
    mockIsAuthorized = false;
    sessionStorage.clear();
    localStorage.clear();
  });

  test('для неавторизованного пользователя отображается лендинг сокращателя ссылок', () => {
    mockIsAuthorized = false;
    renderPage();

    expect(screen.queryByTestId('links-dashboard')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /сократить/i })).toBeInTheDocument();
  });

  test('для авторизованного пользователя происходит перенаправление на /links', () => {
    mockIsAuthorized = true;
    renderPage();

    expect(screen.getByTestId('links-dashboard')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /сократить/i })).not.toBeInTheDocument();
  });
});
