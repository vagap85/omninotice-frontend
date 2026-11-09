import { getAccessTokenCookie } from '@/auth/authCookies';
import { parseJwtPayload } from './profile';
import type { UserCenterCreateSuccess, UserCenterLoginSuccess, ProjectUser, RawProjectUser } from './types';

const DEFAULT_USERCENTER_BASE_URL = 'https://api.users.skroy.ru';

const getUserCenterBaseUrl = (): string => {
  const url = import.meta.env.VITE_USERCENTER_BASE_URL?.trim();
  if (!url) {
    return DEFAULT_USERCENTER_BASE_URL;
  }

  return url.replace(/\/$/, '');
};

const getUserCenterProjectId = (): string => {
  const id = import.meta.env.VITE_USERCENTER_PROJECT_ID?.trim();
  if (!id) {
    throw new Error(
      'VITE_USERCENTER_PROJECT_ID is required (UserCenter header: Project-ID)'
    );
  }
  return id;
};

const getErrorMessage = (response: unknown): string | undefined => {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const asRecord = response as Record<string, unknown>;
  const detail = asRecord.detail;

  if (detail && typeof detail === 'object') {
    const detailRecord = detail as Record<string, unknown>;
    const message = detailRecord.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return undefined;
};

export async function loginUserCenter(
  username: string,
  password: string
): Promise<UserCenterLoginSuccess> {
  const baseUrl = getUserCenterBaseUrl();
  const projectId = getUserCenterProjectId();

  const body = new URLSearchParams();
  body.append('username', username);
  body.append('password', password);

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Project-ID': projectId
    },
    body: body.toString()
  });

  const rawJson = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    const fallback =
      response.status === 401 || response.status === 403
        ? 'Неверный логин или пароль'
        : 'Не удалось авторизоваться. Повторите попытку.';
    throw new Error(getErrorMessage(rawJson) ?? fallback);
  }

  const data = Array.isArray(rawJson.data) ? rawJson.data[0] : undefined;
  const authData =
    data && typeof data === 'object'
      ? (data as Record<string, unknown>).auth_data
      : undefined;
  const userData =
    data && typeof data === 'object'
      ? (data as Record<string, unknown>).user_data
      : undefined;
  const organizationData =
    data && typeof data === 'object'
      ? (data as Record<string, unknown>).organization_data
      : undefined;

  const authRecord =
    authData && typeof authData === 'object'
      ? (authData as Record<string, unknown>)
      : {};
  const userRecord =
    userData && typeof userData === 'object'
      ? (userData as Record<string, unknown>)
      : {};
  const organizationRecord =
    organizationData && typeof organizationData === 'object'
      ? (organizationData as Record<string, unknown>)
      : {};

  const accessToken = authRecord.access_token;
  const userId = userRecord.user_id;
  const login = userRecord.login;
  let accountId: string | null = null;
  if (
    typeof organizationRecord.account_id === 'string' &&
    organizationRecord.account_id.trim()
  ) {
    accountId = organizationRecord.account_id.trim();
  } else if (typeof accessToken === 'string' && accessToken.trim()) {
    const sub = parseJwtPayload(accessToken);
    if (typeof sub?.account_id === 'string' && sub.account_id.trim()) {
      accountId = sub.account_id.trim();
    }
  }

  if (typeof accessToken !== 'string' || !accessToken.trim()) {
    throw new Error('UserCenter не вернул access_token');
  }
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('UserCenter не вернул user_id');
  }
  if (typeof login !== 'string' || !login.trim()) {
    throw new Error('UserCenter не вернул login');
  }

  return {
    accessToken,
    userId,
    login,
    accountId
  };
}

export async function createUserCenter(
  login: string,
  password: string
): Promise<UserCenterCreateSuccess> {
  const baseUrl = getUserCenterBaseUrl();
  const projectId = getUserCenterProjectId();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Project-ID': projectId
      },
      body: JSON.stringify({
        user_type: 'email',
        login: login,
        password: password
      })
    });
  } catch (networkError) {
    console.error(networkError);
    throw new Error(
      'Сетевая ошибка при создании аккаунта. Повторите попытку.',
      { cause: networkError }
    );
  }

  const rawText = await response.text();
  let rawJson: unknown;
  try {
    rawJson = rawText ? JSON.parse(rawText) : null;
  } catch {
    rawJson = null;
  }

  if (!response.ok) {
    const fallback = 'Не удалось создать аккаунт. Повторите попытку.';
    throw new Error(getErrorMessage(rawJson) ?? fallback);
  }

  return {
    login: login,
    password: password
  };
}

const PROJECT_USERS_PER_PAGE = 200;

async function getProjectUsersPage(
  projectId: string,
  page: number,
  signal?: AbortSignal
): Promise<{ users: ProjectUser[]; total: number }> {
  const token = getAccessTokenCookie();
  if (!token) {
    throw new Error('Токен авторизации не найден.');
  }

  const url = new URL(`${DEFAULT_USERCENTER_BASE_URL}/users`);
  url.searchParams.append('page', String(page));
  url.searchParams.append('per_page', String(PROJECT_USERS_PER_PAGE));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Project-ID': projectId,
      'Content-Type': 'application/json'
    },
    ...(signal ? { signal } : {})
  });

  if (!response.ok) {
    throw new Error(
      `Не удалось загрузить пользователей: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  const rawUsers: RawProjectUser[] = Array.isArray(json.data) ? json.data : [];

  const users = rawUsers.map((user) => ({
    ...user,
    id: user.user_id,
    full_name: user.login
  }));
  const responseTotal = Number(json.info?.total);

  return {
    users,
    total: Number.isFinite(responseTotal) ? responseTotal : users.length
  };
}

export async function getProjectUsers(
  projectId: string,
  signal?: AbortSignal,
  onProgress?: (loaded: number, total: number) => void
): Promise<ProjectUser[]> {
  const usersById = new Map<string, ProjectUser>();
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await getProjectUsersPage(projectId, page, signal);
    result.users.forEach((user) => usersById.set(user.id, user));
    const total = Math.max(result.total, usersById.size);
    onProgress?.(usersById.size, total);

    hasMore = result.users.length > 0 && page * PROJECT_USERS_PER_PAGE < total;
    page += 1;
  }

  return [...usersById.values()];
}