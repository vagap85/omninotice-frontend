import { createRef } from 'react';
import { describe, test, expect } from 'vitest';

import CustomInput from '@/components/atoms/Input/CustomInput';

import { renderWithProviders, screen } from '../../test/utils';


describe('CustomInput', () => {
  test('рендерит input', () => {
    renderWithProviders(<CustomInput value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('показывает счётчик при maxLength', () => {
    renderWithProviders(
      <CustomInput value="Привет" onChange={() => {}} maxLength={70} />
    );
    expect(screen.getByText('6/70')).toBeInTheDocument();
  });

  test('не показывает счётчик без maxLength', () => {
    renderWithProviders(<CustomInput value="Привет" onChange={() => {}} />);
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  test('можно скрыть счётчик через showCounter={false}', () => {
    renderWithProviders(
      <CustomInput
        value="Тест"
        onChange={() => {}}
        maxLength={70}
        showCounter={false}
      />
    );
    expect(screen.queryByText('4/70')).not.toBeInTheDocument();
  });

  test('пробрасывает ref', () => {
    const ref = createRef<HTMLInputElement>();
    renderWithProviders(
      <CustomInput ref={ref} value="" onChange={() => {}} />
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('maxLength ограничивает ввод', () => {
    renderWithProviders(
      <CustomInput value="" onChange={() => {}} maxLength={5} />
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '5');
  });

  test('пробрасывает placeholder', () => {
    renderWithProviders(
      <CustomInput value="" onChange={() => {}} placeholder="Введите текст" />
    );
    expect(screen.getByPlaceholderText('Введите текст')).toBeInTheDocument();
  });
});