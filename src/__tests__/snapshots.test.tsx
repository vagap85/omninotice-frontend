import { describe, test, expect, vi } from 'vitest';

import CustomButton from '@/components/atoms/Button/CustomButton';
import CustomInput from '@/components/atoms/Input/CustomInput';
import SpinnerLoader from '@/components/atoms/Loaders/SpinnerLoader/SpinnerLoader';
import CustomTextArea from '@/components/atoms/TextArea/CustomTextArea';

import { renderWithProviders } from '../test/utils';

vi.mock('@/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthorized: false, login: vi.fn() }),
}));

describe('Snapshot tests', () => {
  test('CustomButton — базовый рендер', () => {
    const { container } = renderWithProviders(
      <CustomButton>Нажми</CustomButton>
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('CustomInput — с счётчиком', () => {
    const { container } = renderWithProviders(
      <CustomInput value="Привет" onChange={() => {}} maxLength={70} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('CustomTextArea — с счётчиком', () => {
    const { container } = renderWithProviders(
      <CustomTextArea value="Тест" onChange={() => {}} maxLength={100} />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('SpinnerLoader — базовый рендер', () => {
    const { container } = renderWithProviders(<SpinnerLoader />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('CustomButton — с isLoading', () => {
    const { container } = renderWithProviders(
      <CustomButton isLoading>Загрузка</CustomButton>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});