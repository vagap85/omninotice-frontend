type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface ApiRequestOptions<TBody = unknown> extends Omit<RequestInit, "method" | "body"> {
  url: string;
  method?: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined | null>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

function buildUrl(url: string, params?: ApiRequestOptions["params"]): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Универсальная типизированная функция для запросов.
 * TResponse — тип ожидаемого ответа
 * TBody — тип тела запроса
 */
export async function apiRequest<TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>
): Promise<TResponse> {
  const {
    url,
    method = "GET",
    body,
    headers,
    params,
    ...rest
  } = options;

  const finalUrl = buildUrl(url, params);

  const finalHeaders: HeadersInit = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  const response = await fetch(finalUrl, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  let data: unknown;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }

  return data as TResponse;
}