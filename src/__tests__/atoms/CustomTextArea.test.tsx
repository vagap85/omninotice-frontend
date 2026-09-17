import { describe, test, expect } from 'vitest';

import CustomTextArea from '@/components/atoms/TextArea/CustomTextArea';

import { renderWithProviders, screen } from '../../test/utils';

describe('CustomTextArea', () => {
  test('рендерит textarea', () => {
    renderWithProviders(<CustomTextArea value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('показывает счётчик при maxLength', () => {
    renderWithProviders(
      <CustomTextArea value="Тест" onChange={() => {}} maxLength={100} />
    );
    expect(screen.getByText('4/100')).toBeInTheDocument();
  });

  test('пробрасывает placeholder', () => {
    renderWithProviders(
      <CustomTextArea value="" onChange={() => {}} placeholder="Введите текст" />
    );
    expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument();
  });

  test('можно скрыть счётчик', () => {
    renderWithProviders(
      <CustomTextArea
        value="Тест"
        onChange={() => {}}
        maxLength={100}
        showCounter={false}
      />
    );
    expect(screen.queryByText('4/100')).not.toBeInTheDocument();
  });
});