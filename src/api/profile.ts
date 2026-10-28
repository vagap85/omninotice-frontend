import type { ChangePasswordPayload } from '@/types/profile';

const DEFAULT_USERCENTER_BASE_URL = 'https://api.users.skroy.ru';
const DEFAULT_BASIS_CFG_BASE_URL = 'https://cfg.basis.skroy.ru';
const AUTH_STORAGE_KEY = 'usercenter_auth';

export const getUserCenterBaseUrl = (): string => {
  const url = import.meta.env.VITE_USERCENTER_BASE_URL?.trim();
  return (url || DEFAULT_USERCENTER_BASE_URL).replace(/\/$/, '');
};

export const getBasisConfigBaseUrl = (): string => {
  const url = import.meta.env.VITE_BASIS_CFG_BASE_URL?.trim();
  return (url || DEFAULT_BASIS_CFG_BASE_URL).replace(/\/$/, '');
};

export const getUserCenterProjectId = (): string => {
  return import.meta.env.VITE_USERCENTER_PROJECT_ID?.trim() || '';
};

export const getStoredAccessToken = (): string | undefined => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed.accessToken?.trim() || undefined;
  } catch {
    return undefined;
  }
};

function decodeBase64(str: string): string {
  if (typeof atob === 'function') {
    return atob(str);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64').toString('binary');
  }
  return '';
}

export interface JwtSubData {
  user_id?: string;
  profile_id?: string | null;
  account_id?: string | null;
  project_id?: string;
}

/**
 * Извлечение sub-полезной нагрузки из JWT токена
 */
export function parseJwtPayload(token?: string): JwtSubData | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const raw = decodeBase64(base64);
    const json = decodeURIComponent(
      raw
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(json);
    return parsed?.sub ?? null;
  } catch {
    return null;
  }
}

export function extractApiErrorMessage(
  responseBody: unknown,
  fallback = 'Произошла непредвиденная ошибка'
): string {
  if (!responseBody || typeof responseBody !== 'object') {
    return fallback;
  }

  const asRecord = responseBody as Record<string, unknown>;

  if (typeof asRecord.message === 'string' && asRecord.message.trim()) {
    return asRecord.message;
  }

  const detail = asRecord.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (detail && typeof detail === 'object') {
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as Record<string, unknown>;
      if (typeof first?.msg === 'string' && first.msg.trim()) {
        return first.msg;
      }
    }

    const detailRecord = detail as Record<string, unknown>;
    if (
      typeof detailRecord.message === 'string' &&
      detailRecord.message.trim()
    ) {
      return detailRecord.message;
    }
  }

  return fallback;
}

export interface ApiRegistryItem {
  title: string;
  value: string;
}

export interface ApiProfileData {
  profile_id?: string;
  profile_type?: string;
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  birth_date?: string | null;
  sex?: 'male' | 'female' | null;
  contact_phone?: ApiRegistryItem[] | null;
  contact_email?: ApiRegistryItem[] | null;
  social_media?: ApiRegistryItem[] | null;
  photo_main?: string | null;
  photo_small?: string | null;
  info?: Record<string, { title: string; value: unknown }> | null;
}

export interface ApiProfileResponse {
  detail?: { code: string | null; message: string | null };
  data?: ApiProfileData[];
}

export interface ApiBasisConfigResponse<T = Record<string, unknown>> {
  detail?: { code: string | null; message: string | null };
  data?: Array<{
    config_code: string;
    title: string;
    settings?: T;
  }>;
}

const buildHeaders = (
  token?: string,
  projectId?: string,
  contentType = 'application/json'
): HeadersInit => {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const effectiveToken = token || getStoredAccessToken();
  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  const effectiveProject = projectId || getUserCenterProjectId();
  if (effectiveProject) {
    headers['Project-ID'] = effectiveProject;
  }

  return headers;
};

/**
 * Определение user_id и profile_id текущего пользователя.
 * Если в JWT profile_id отсутствует, проверяет запись пользователя в базе данных.
 */
export async function resolveProfileId(
  token?: string,
  projectId?: string
): Promise<{
  userId?: string;
  profileId?: string | null;
  accountId?: string | null;
}> {
  const effectiveToken = token || getStoredAccessToken();
  const sub = parseJwtPayload(effectiveToken);
  const userId = sub?.user_id;
  let profileId = sub?.profile_id ?? null;
  const accountId = sub?.account_id ?? null;

  if (profileId) {
    return { userId, profileId, accountId };
  }

  // Если в токене нет profile_id, но есть user_id, проверяем актуальный профиль в UserCenter
  if (userId && effectiveToken) {
    try {
      const baseUrl = getUserCenterBaseUrl();
      const response = await fetch(`${baseUrl}/user/${userId}`, {
        method: 'GET',
        headers: buildHeaders(effectiveToken, projectId, '')
      });
      if (response.ok) {
        const json = (await response.json()) as {
          data?: Array<{ profile_id?: string | null }>;
        };
        const remoteProfileId = json.data?.[0]?.profile_id;
        if (remoteProfileId) {
          profileId = remoteProfileId;
        }
      }
    } catch {
      // Игнорируем ошибки сетевой проверки
    }
  }

  return { userId, profileId, accountId };
}

/**
 * Получить личный профиль текущего пользователя из UserCenter
 * GET /profile/{profile_id} или GET /profile/my
 */
export async function fetchMyProfile(
  token?: string,
  projectId?: string
): Promise<ApiProfileData | null> {
  const baseUrl = getUserCenterBaseUrl();
  const effectiveToken = token || getStoredAccessToken();
  if (!effectiveToken) return null;

  const { profileId } = await resolveProfileId(effectiveToken, projectId);

  // Если точно известно, что у пользователя еще нет сущности профиля,
  // не отправляем заведомо приводящий к 404 запрос /profile/my
  const sub = parseJwtPayload(effectiveToken);
  if (!profileId && sub && sub.profile_id === null) {
    return null;
  }

  const targetUrl = profileId
    ? `${baseUrl}/profile/${profileId}`
    : `${baseUrl}/profile/my?add_organization_data=false&add_specialty_data=false`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: buildHeaders(effectiveToken, projectId, '')
    });

    if (response.status === 404) {
      // Профиль еще не создан для данного аккаунта
      return null;
    }

    const rawJson = (await response.json().catch(() => ({}))) as ApiProfileResponse;

    if (!response.ok) {
      throw new Error(
        extractApiErrorMessage(rawJson, 'Не удалось загрузить данные профиля')
      );
    }

    if (Array.isArray(rawJson.data) && rawJson.data.length > 0) {
      return rawJson.data[0];
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('Не удалось')) {
      throw e;
    }
  }

  return null;
}

/**
 * Обновить личный профиль пользователя в UserCenter.
 * Если профиля еще нет (первое сохранение), создает профиль через POST /profile
 * и привязывает его к пользователю через PATCH /user/{user_id}.
 */
export async function updateMyProfile(
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    position?: string;
  },
  token?: string,
  projectId?: string
): Promise<{ profileId?: string }> {
  const baseUrl = getUserCenterBaseUrl();
  const effectiveToken = token || getStoredAccessToken();
  const { userId, profileId: existingProfileId } = await resolveProfileId(
    effectiveToken,
    projectId
  );

  const contactEmail =
    data.email !== undefined
      ? data.email
        ? [{ title: 'email', value: data.email }]
        : []
      : undefined;

  const contactPhone =
    data.phone !== undefined
      ? data.phone
        ? [{ title: 'phone', value: data.phone }]
        : []
      : undefined;

  // Случай 1: Профиль еще не создан -> POST /profile + привязка к пользователю
  if (!existingProfileId) {
    const createBody: Record<string, unknown> = {
      profile_type: 'person',
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      contact_email: contactEmail,
      contact_phone: contactPhone
    };

    if (data.position !== undefined) {
      createBody.info = {
        position: {
          title: 'Должность',
          value: data.position
        }
      };
    }

    const response = await fetch(`${baseUrl}/profile`, {
      method: 'POST',
      headers: buildHeaders(effectiveToken, projectId),
      body: JSON.stringify(createBody)
    });

    const rawJson = (await response.json().catch(() => ({}))) as ApiProfileResponse;
    if (!response.ok) {
      throw new Error(
        extractApiErrorMessage(
          rawJson,
          'При сохранении изменений произошла ошибка'
        )
      );
    }

    const newProfileId = rawJson.data?.[0]?.profile_id;
    if (newProfileId && userId) {
      await fetch(`${baseUrl}/user/${userId}`, {
        method: 'PATCH',
        headers: buildHeaders(effectiveToken, projectId),
        body: JSON.stringify({ profile_id: newProfileId })
      }).catch(() => undefined);
    }

    return { profileId: newProfileId };
  }

  // Случай 2: Профиль существует -> PATCH /profile/{profileId} или /profile/my
  const patchUrl = existingProfileId
    ? `${baseUrl}/profile/${existingProfileId}`
    : `${baseUrl}/profile/my`;

  const body: Record<string, unknown> = {};
  if (data.firstName !== undefined) body.first_name = data.firstName;
  if (data.lastName !== undefined) body.last_name = data.lastName;
  if (contactEmail !== undefined) body.contact_email = contactEmail;
  if (contactPhone !== undefined) body.contact_phone = contactPhone;

  const response = await fetch(patchUrl, {
    method: 'PATCH',
    headers: buildHeaders(effectiveToken, projectId),
    body: JSON.stringify(body)
  });

  const rawJson = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    throw new Error(
      extractApiErrorMessage(
        rawJson,
        'При сохранении изменений произошла ошибка'
      )
    );
  }

  // Обновление должности в свойствах профиля UserCenter (info.position)
  if (data.position !== undefined) {
    const infoUrl = existingProfileId
      ? `${baseUrl}/profile/${existingProfileId}/info`
      : `${baseUrl}/profile/my/info`;

    const infoBody = {
      position: {
        title: 'Должность',
        value: data.position
      }
    };

    const infoPatchRes = await fetch(infoUrl, {
      method: 'PATCH',
      headers: buildHeaders(effectiveToken, projectId),
      body: JSON.stringify(infoBody)
    });

    if (!infoPatchRes.ok) {
      // Если секция info еще не была создана, отправляем POST
      await fetch(infoUrl, {
        method: 'POST',
        headers: buildHeaders(effectiveToken, projectId),
        body: JSON.stringify(infoBody)
      }).catch(() => undefined);
    }
  }

  return { profileId: existingProfileId };
}

/**
 * Изменить пароль пользователя в UserCenter
 * PATCH /auth/password
 */
export async function changeUserPassword(
  payload: ChangePasswordPayload,
  token?: string,
  projectId?: string
): Promise<void> {
  const baseUrl = getUserCenterBaseUrl();

  const response = await fetch(`${baseUrl}/auth/password`, {
    method: 'PATCH',
    headers: buildHeaders(token, projectId),
    body: JSON.stringify({
      old_password: payload.oldPassword,
      new_password: payload.newPassword,
      locale: payload.locale || 'ru'
    })
  });

  const rawJson = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    throw new Error(
      extractApiErrorMessage(rawJson, 'При изменении пароля произошла ошибка')
    );
  }
}

/**
 * Получить конфигурацию пользователя из Basis CFG
 * GET /account/my/customer/my/config/{config_code}
 */
export async function fetchCustomerProfileConfig(
  configCode = 'profile',
  token?: string,
  projectId?: string
): Promise<Record<string, unknown> | null> {
  const effectiveToken = token || getStoredAccessToken();
  if (!effectiveToken) return null;

  // Basis CFG требует контекст аккаунта; пропускаем запрос при отсутствии account_id
  const sub = parseJwtPayload(effectiveToken);
  if (!sub?.account_id) {
    return null;
  }

  const baseUrl = getBasisConfigBaseUrl();
  try {
    const response = await fetch(
      `${baseUrl}/account/my/customer/my/config/${encodeURIComponent(configCode)}`,
      {
        method: 'GET',
        headers: buildHeaders(effectiveToken, projectId, '')
      }
    );

    if (!response.ok) return null;
    const rawJson = (await response.json().catch(
      () => ({})
    )) as ApiBasisConfigResponse;
    if (Array.isArray(rawJson.data) && rawJson.data.length > 0) {
      return rawJson.data[0].settings || null;
    }
  } catch {
    // Basis config опционален
  }
  return null;
}

/**
 * Сохранить конфигурацию пользователя в Basis CFG
 * PATCH /account/my/customer/my/config/{config_code}/settings
 */
export async function saveCustomerProfileConfig(
  settings: Record<string, unknown>,
  configCode = 'profile',
  token?: string,
  projectId?: string
): Promise<void> {
  const effectiveToken = token || getStoredAccessToken();
  if (!effectiveToken) return;

  const sub = parseJwtPayload(effectiveToken);
  if (!sub?.account_id) {
    return;
  }

  const baseUrl = getBasisConfigBaseUrl();
  try {
    const patchRes = await fetch(
      `${baseUrl}/account/my/customer/my/config/${encodeURIComponent(configCode)}/settings`,
      {
        method: 'PATCH',
        headers: buildHeaders(effectiveToken, projectId),
        body: JSON.stringify({ settings })
      }
    );

    if (!patchRes.ok && (patchRes.status === 404 || patchRes.status === 405)) {
      await fetch(
        `${baseUrl}/account/my/customer/my/config/${encodeURIComponent(configCode)}`,
        {
          method: 'POST',
          headers: buildHeaders(effectiveToken, projectId),
          body: JSON.stringify({
            config_code: configCode,
            title: 'Профиль пользователя',
            settings
          })
        }
      );
    }
  } catch {
    // Игнорируем сетевые ошибки синхронизации конфигурации
  }
}
