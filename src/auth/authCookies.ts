import type { AuthCredentials, AuthState } from './types';

const COOKIE_NAMES = {
  userId: 'omni_user_id',
  login: 'omni_login',
  accountId: 'omni_account_id',
  accessToken: 'omni_access_token'
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
}

export function readAuthCookies(): AuthState | null {
  const userId = readCookie(COOKIE_NAMES.userId);
  const login = readCookie(COOKIE_NAMES.login);
  const accountId = readCookie(COOKIE_NAMES.accountId);
  const accessToken = readCookie(COOKIE_NAMES.accessToken);

  if (!userId || !login || !accessToken) return null;

  return { userId, login, accountId: accountId ?? null };
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
