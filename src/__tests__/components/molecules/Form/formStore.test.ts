import { describe, test, expect, vi } from 'vitest';

import { createFormStore } from '@/components/molecules/Form/formStore';
import { required } from '@/components/molecules/Form/validators/validators';

describe('createFormStore', () => {
  test('создаёт пустой store', () => {
    const store = createFormStore();
    expect(store.getValues()).toEqual({});
  });

  test('registerField регистрирует поле', () => {
    const store = createFormStore();
    store.registerField('name');
    expect(store.hasField('name')).toBe(true);
  });

  test('setValue устанавливает значение', () => {
    const store = createFormStore();
    store.registerField('name');
    store.setValue('name', 'Иван');
    expect(store.getValues().name).toBe('Иван');
  });

  test('setFieldError устанавливает ошибку', () => {
    const store = createFormStore();
    store.registerField('name');
    store.setFieldError('name', 'Ошибка');
    const snapshot = store.getSnapshot('name');
    expect(snapshot.error).toBe('Ошибка');
    expect(snapshot.touched).toBe(true);
  });

  test('validateField возвращает true для валидного поля', () => {
    const store = createFormStore();
    store.registerField('name', { validators: [required()] });
    store.setValue('name', 'Иван');
    expect(store.validateField('name')).toBe(true);
  });

  test('validateField возвращает false для невалидного', () => {
    const store = createFormStore();
    store.registerField('name', { validators: [required()] });
    store.setValue('name', '');
    expect(store.validateField('name')).toBe(false);
  });

  test('validateAll возвращает true если всё валидно', () => {
    const store = createFormStore();
    store.registerField('name', { validators: [required()] });
    store.registerField('email', { validators: [required()] });
    store.setValue('name', 'Иван');
    store.setValue('email', 'test@mail.com');
    expect(store.validateAll()).toBe(true);
  });

  test('validateAll возвращает false если есть ошибки', () => {
    const store = createFormStore();
    store.registerField('name', { validators: [required()] });
    store.setValue('name', '');
    expect(store.validateAll()).toBe(false);
  });

  test('subscribe вызывает listener при изменении поля', () => {
    const store = createFormStore();
    store.registerField('name');
    const listener = vi.fn();
    store.subscribe('name', listener);

    store.setValue('name', 'Иван');
    expect(listener).toHaveBeenCalled();
  });

  test('reset очищает значения', () => {
    const store = createFormStore();
    store.registerField('name');
    store.setValue('name', 'Иван');
    store.reset();
    expect(store.getValues().name).toBe('');
  });

  test('unregisterField удаляет поле', () => {
    const store = createFormStore();
    store.registerField('name');
    store.unregisterField('name');
    expect(store.hasField('name')).toBe(false);
  });
});