import { describe, test, expect } from 'vitest';

import SpinnerLoader from '@/components/atoms/Loaders/SpinnerLoader/SpinnerLoader';

import { renderWithProviders } from '../../test/utils';

describe('SpinnerLoader', () => {
  test('рендерится без ошибок', () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    expect(container.firstChild).not.toBeNull();
  });

  test('имеет класс spinner-loader', () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    expect(container.querySelector('.spinner-loader')).toBeInTheDocument();
  });

  test('рендерит div с нужным классом', () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    const spinner = container.querySelector('.spinner-loader');
    expect(spinner?.tagName).toBe('DIV');
  });
});