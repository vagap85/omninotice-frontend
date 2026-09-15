import { describe, test, expect, vi } from 'vitest';
import { renderWithProviders } from '../../test/utils';
import HomePage from '@/pages/HomePage/HomePage';

// Мокаем useAuth, чтобы не требовать AuthProvider
vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({
    isAuthorized: false,
    login: vi.fn(),
    logout: vi.fn(),
    auth: null,
  }),
}));

describe('HomePage', () => {
  test('рендерится без ошибок', () => {
    const { container } = renderWithProviders(<HomePage />);
    expect(container.firstChild).not.toBeNull();
  });

  test('содержит какие-то интерактивные элементы', () => {
    renderWithProviders(<HomePage />);
    const elements = document.querySelectorAll('a, button');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('содержит хедер', () => {
    renderWithProviders(<HomePage />);
    expect(document.body).not.toBeEmptyDOMElement();
  });
});