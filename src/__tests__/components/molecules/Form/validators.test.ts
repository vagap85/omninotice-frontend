import { describe, test, expect } from 'vitest';
import {
  required,
  minLength,
  maxLength,
  pattern,
  httpUrl,
  email,
  matchesField,
} from '@/components/molecules/Form/validators/validators';

describe('validators', () => {
  describe('required', () => {
    test('возвращает ошибку для пустой строки', () => {
      const validate = required('Обязательное поле');
      expect(validate('', {})).toBe('Обязательное поле');
    });

    test('возвращает ошибку для строки из пробелов', () => {
      const validate = required('Обязательное поле');
      expect(validate('   ', {})).toBe('Обязательное поле');
    });

    test('возвращает undefined для заполненного', () => {
      const validate = required('Обязательное поле');
      expect(validate('значение', {})).toBeUndefined();
    });
  });

  describe('minLength', () => {
    test('возвращает ошибку если меньше минимума', () => {
      const validate = minLength(5);
      expect(validate('abc', {})).toBeDefined();
    });

    test('возвращает undefined если длина равна минимуму', () => {
      const validate = minLength(5);
      expect(validate('abcde', {})).toBeUndefined();
    });

    test('использует кастомное сообщение', () => {
      const validate = minLength(5, 'Мало символов');
      expect(validate('abc', {})).toBe('Мало символов');
    });
  });

  describe('maxLength', () => {
    test('возвращает ошибку если больше максимума', () => {
      const validate = maxLength(3);
      expect(validate('abcd', {})).toBeDefined();
    });

    test('возвращает undefined если длина равна максимуму', () => {
      const validate = maxLength(3);
      expect(validate('abc', {})).toBeUndefined();
    });

    test('имеет флаг immediate', () => {
      const validate = maxLength(3);
      expect(validate.immediate).toBe(true);
    });
  });

  describe('pattern', () => {
    test('возвращает undefined если паттерн совпал', () => {
      const validate = pattern(/^\d+$/);
      expect(validate('12345', {})).toBeUndefined();
    });

    test('возвращает ошибку если паттерн не совпал', () => {
      const validate = pattern(/^\d+$/);
      expect(validate('abc', {})).toBeDefined();
    });

    test('не валидирует пустую строку', () => {
      const validate = pattern(/^\d+$/);
      expect(validate('', {})).toBeUndefined();
    });
  });

  describe('httpUrl', () => {
    test('валиден для https://example.com', () => {
      const validate = httpUrl();
      expect(validate('https://example.com', {})).toBeUndefined();
    });

    test('валиден для http://example.com', () => {
      const validate = httpUrl();
      expect(validate('http://example.com', {})).toBeUndefined();
    });

    test('невалиден для ftp://example.com', () => {
      const validate = httpUrl();
      expect(validate('ftp://example.com', {})).toBeDefined();
    });

    test('невалиден для "abc"', () => {
      const validate = httpUrl();
      expect(validate('abc', {})).toBeDefined();
    });

    test('прощает короткие строки (<3 символов)', () => {
      const validate = httpUrl();
      expect(validate('ab', {})).toBeUndefined();
    });

    test('не валидирует пустую строку', () => {
      const validate = httpUrl();
      expect(validate('', {})).toBeUndefined();
    });
  });

  describe('email', () => {
    test('валиден для корректного email', () => {
      const validate = email();
      expect(validate('test@mail.com', {})).toBeUndefined();
    });

    test('невалиден для "abc"', () => {
      const validate = email();
      expect(validate('abc', {})).toBeDefined();
    });

    test('невалиден для "abc@"', () => {
      const validate = email();
      expect(validate('abc@', {})).toBeDefined();
    });

    test('не валидирует пустую строку', () => {
      const validate = email();
      expect(validate('', {})).toBeUndefined();
    });
  });

  describe('matchesField', () => {
    test('возвращает undefined если значения совпадают', () => {
      const validate = matchesField('password');
      expect(validate('secret', { password: 'secret' })).toBeUndefined();
    });

    test('возвращает ошибку если значения не совпадают', () => {
      const validate = matchesField('password');
      expect(validate('secret', { password: 'other' })).toBe('Пароли не совпадают');
    });

    test('использует кастомное сообщение', () => {
      const validate = matchesField('password', 'Не совпадает');
      expect(validate('a', { password: 'b' })).toBe('Не совпадает');
    });
  });
});