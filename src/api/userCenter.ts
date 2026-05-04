const DEFAULT_USERCENTER_BASE_URL = "https://api.users.skroy.ru";

const getUserCenterBaseUrl = (): string => {
  const url = import.meta.env.VITE_USERCENTER_BASE_URL?.trim();
  if (!url) {
    return DEFAULT_USERCENTER_BASE_URL;
  }

  return url.replace(/\/$/, "");
};

const getUserCenterProjectId = (): string => {
  const id = import.meta.env.VITE_USERCENTER_PROJECT_ID?.trim();
  if (!id) {
    throw new Error(
      "VITE_USERCENTER_PROJECT_ID is required (UserCenter header: Project-ID)",
    );
  }
  return id;
};

export interface UserCenterLoginSuccess {
  accessToken: string;
  tokenType: string;
  login?: string;
  firstName?: string;
  lastName?: string;
}

export interface UserCenterCreateSuccess {
  login: string;
  password: string;
}

const getErrorMessage = (response: unknown): string | undefined => {
  if (!response || typeof response !== "object") {
    return undefined;
  }

  const asRecord = response as Record<string, unknown>;
  const detail = asRecord.detail;

  if (detail && typeof detail === "object") {
    const detailRecord = detail as Record<string, unknown>;
    const message = detailRecord.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return undefined;
};

export async function loginUserCenter(
  username: string,
  password: string,
): Promise<UserCenterLoginSuccess> {
  const baseUrl = getUserCenterBaseUrl();
  const projectId = getUserCenterProjectId();

  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Project-ID": projectId,
    },
    body: body.toString(),
  });

  const rawJson = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    const fallback =
      response.status === 401 || response.status === 403
        ? "Неверный логин или пароль"
        : "Не удалось авторизоваться. Повторите попытку.";
    throw new Error(getErrorMessage(rawJson) ?? fallback);
  }

  const data = Array.isArray(rawJson.data) ? rawJson.data[0] : undefined;
  const authData =
    data && typeof data === "object"
      ? (data as Record<string, unknown>).auth_data
      : undefined;
  const userData =
    data && typeof data === "object"
      ? (data as Record<string, unknown>).user_data
      : undefined;
  const profileData =
    data && typeof data === "object"
      ? (data as Record<string, unknown>).profile_data
      : undefined;

  const accessToken =
    authData && typeof authData === "object"
      ? (authData as Record<string, unknown>).access_token
      : undefined;

  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw new Error("UserCenter не вернул access_token");
  }

  const tokenType =
    authData && typeof authData === "object"
      ? (authData as Record<string, unknown>).token_type
      : undefined;

  const login =
    userData && typeof userData === "object"
      ? (userData as Record<string, unknown>).login
      : undefined;
  const firstName =
    profileData && typeof profileData === "object"
      ? (profileData as Record<string, unknown>).first_name
      : undefined;
  const lastName =
    profileData && typeof profileData === "object"
      ? (profileData as Record<string, unknown>).last_name
      : undefined;

  return {
    accessToken,
    tokenType: typeof tokenType === "string" ? tokenType : "bearer",
    login: typeof login === "string" ? login : undefined,
    firstName: typeof firstName === "string" ? firstName : undefined,
    lastName: typeof lastName === "string" ? lastName : undefined,
  };
}

export async function createUserCenter(
  login: string,
  password: string,
): Promise<UserCenterCreateSuccess> {
  const baseUrl = getUserCenterBaseUrl();
  const projectId = getUserCenterProjectId();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Project-ID": projectId,
      },
      body: JSON.stringify({
        user_type: "email",
        login: login,
        password: password,
      }),
    });
  } catch (networkError) {
    throw new Error("Сетевая ошибка при создании аккаунта. Повторите попытку.");
  }

  const rawText = await response.text();
  let rawJson: unknown = null;
  try {
    rawJson = rawText ? JSON.parse(rawText) : null;
  } catch {
    rawJson = null;
  }

  if (!response.ok) {
    const fallback = "Не удалось создать аккаунт. Повторите попытку.";
    throw new Error(getErrorMessage(rawJson) ?? fallback);
  }

  return {
    login: login,
    password: password,
  };
}
