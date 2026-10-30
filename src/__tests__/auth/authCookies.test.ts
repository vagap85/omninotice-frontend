import { afterEach, describe, expect, test } from 'vitest';

import {
  clearAuthCookies,
  getAccessTokenCookie,
  readAuthCookies,
  saveAuthCookies
} from '@/auth/authCookies';

describe('auth cookies', () => {
  afterEach(() => {
    clearAuthCookies();
  });

  test('stores identity and token in cookies, exposing only identity in auth state', () => {
    saveAuthCookies({
      userId: 'user-123',
      login: 'user+test@example.com',
      accountId: 'account-123',
      accessToken: 'secret-token'
    });

    expect(readAuthCookies()).toEqual({
      userId: 'user-123',
      login: 'user+test@example.com',
      accountId: 'account-123'
    });
    expect(getAccessTokenCookie()).toBe('secret-token');
  });

  test('clears the auth cookies', () => {
    saveAuthCookies({
      userId: 'user-123',
      login: 'user@example.com',
      accountId: 'account-123',
      accessToken: 'secret-token'
    });

    clearAuthCookies();

    expect(readAuthCookies()).toBeNull();
    expect(getAccessTokenCookie()).toBeNull();
  });
  test('reads auth state successfully when accountId is missing/null', () => {
    saveAuthCookies({
      userId: 'user-123',
      login: 'user+test@example.com',
      accountId: null,
      accessToken: 'secret-token'
    });

    expect(readAuthCookies()).toEqual({
      userId: 'user-123',
      login: 'user+test@example.com',
      accountId: null
    });
    expect(getAccessTokenCookie()).toBe('secret-token');
  });
});
