import type { AuthCredentials, AuthState } from './types';

const COOKIE_NAMES = {
  userId: 'omni_user_id',
  login: 'omni_login',
  accountId: 'omni_account_id',
  accessToken: 'omni_access_token',
  firstName: 'omni_first_name',
  lastName: 'omni_last_name'
} as const;

const cookieAttributes = (): string =>
  `Path=/; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieAttributes()}`;
}

function clearCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; ${cookieAttributes()}`;
}

export function saveAuthCookies(auth: AuthCredentials): void {
  writeCookie(COOKIE_NAMES.userId, auth.userId);
  writeCookie(COOKIE_NAMES.login, auth.login);
  if (auth.accountId) {
    writeCookie(COOKIE_NAMES.accountId, auth.accountId);
  } else {
    clearCookie(COOKIE_NAMES.accountId);
  }
  writeCookie(COOKIE_NAMES.accessToken, auth.accessToken);
  if (auth.firstName) {
    writeCookie(COOKIE_NAMES.firstName, auth.firstName);
  } else {
    clearCookie(COOKIE_NAMES.firstName);
  }
  if (auth.lastName) {
    writeCookie(COOKIE_NAMES.lastName, auth.lastName);
  } else {
    clearCookie(COOKIE_NAMES.lastName);
  }
}

export function updateAuthCookies(partial: Partial<AuthState>): void {
  if (partial.firstName !== undefined) {
    if (partial.firstName) {
      writeCookie(COOKIE_NAMES.firstName, partial.firstName);
    } else {
      clearCookie(COOKIE_NAMES.firstName);
    }
  }
  if (partial.lastName !== undefined) {
    if (partial.lastName) {
      writeCookie(COOKIE_NAMES.lastName, partial.lastName);
    } else {
      clearCookie(COOKIE_NAMES.lastName);
    }
  }
  if (partial.login !== undefined) {
    writeCookie(COOKIE_NAMES.login, partial.login);
  }
  if (partial.accountId !== undefined) {
    if (partial.accountId) {
      writeCookie(COOKIE_NAMES.accountId, partial.accountId);
    } else {
      clearCookie(COOKIE_NAMES.accountId);
    }
  }
}

export function readAuthCookies(): AuthState | null {
  const userId = readCookie(COOKIE_NAMES.userId);
  const login = readCookie(COOKIE_NAMES.login);
  const accountId = readCookie(COOKIE_NAMES.accountId);
  const accessToken = readCookie(COOKIE_NAMES.accessToken);
  const firstName = readCookie(COOKIE_NAMES.firstName);
  const lastName = readCookie(COOKIE_NAMES.lastName);

  if (!userId || !login || !accessToken) return null;

  const result: AuthState = { userId, login, accountId: accountId ?? null };
  if (firstName) {
    result.firstName = firstName;
  }
  if (lastName) {
    result.lastName = lastName;
  }
  return result;
}

export function getAccessTokenCookie(): string | null {
  return readCookie(COOKIE_NAMES.accessToken);
}

export function getAccountIdCookie(): string | null {
  return readCookie(COOKIE_NAMES.accountId);
}

export function clearAuthCookies(): void {
  Object.values(COOKIE_NAMES).forEach(clearCookie);
}
