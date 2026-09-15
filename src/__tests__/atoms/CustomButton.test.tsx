import { describe, test, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test/utils';
import CustomButton from '@/components/atoms/Button/CustomButton';

describe('CustomButton', () => {
  test('рендерит текст', () => {
    renderWithProviders(<CustomButton>Нажми</CustomButton>);
    expect(screen.getByText('Нажми')).toBeInTheDocument();
  });

  test('имеет роль button', () => {
    renderWithProviders(<CustomButton>Кнопка</CustomButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('вызывает onClick при клике', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <CustomButton onClick={handleClick}>Нажми</CustomButton>
    );
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('не вызывает onClick при disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(
      <CustomButton onClick={handleClick} disabled>
        Нажми
      </CustomButton>
    );
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  test('пробрасывает type=submit', () => {
    renderWithProviders(<CustomButton type="submit">Отправить</CustomButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});