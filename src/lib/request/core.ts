import { ApiRequestOptions, ApiResult, OpenAPIConfig } from "./types";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: number,
    public readonly data?: unknown,
    public readonly url?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class RequestCancelledError extends Error {
  constructor() {
    super("Request cancelled");
    this.name = "RequestCancelledError";
  }
}

export class RequestTimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timeout after ${timeout}ms`);
    this.name = "RequestTimeoutError";
  }
}

export const getUrl = (
  config: OpenAPIConfig,
  options: ApiRequestOptions<unknown>,
): string => {
  const baseUrl = config.BASE.replace(/\/$/, "");
  let path = options.path;
  if (config.ENCODE_PATH) path = config.ENCODE_PATH(path);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) params.append(key, String(item));
      });
    } else if (typeof value === "object") {
      params.set(key, JSON.stringify(value));
    } else {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return `${baseUrl}${path}${query ? `${path.includes("?") ? "&" : "?"}${query}` : ""}`;
};

export const getHeaders = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions<unknown>,
): Promise<Headers> => {
  const headers = new Headers(config.HEADERS ? await resolve(config.HEADERS) : undefined);
  new Headers(options.headers).forEach((value, key) => headers.set(key, value));
  if (config.TOKEN) {
    const token = await resolve(config.TOKEN);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

const resolve = async <T>(value: T | (() => T | Promise<T>)): Promise<T> =>
  typeof value === "function" ? (value as () => T | Promise<T>)() : value;

export const getFormData = (
  options: ApiRequestOptions<unknown>,
): FormData | undefined => {
  if (!options.formData) return undefined;
  const formData = new FormData();
  for (const [key, value] of Object.entries(options.formData)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((item) => appendFormValue(formData, key, item));
    } else {
      appendFormValue(formData, key, value);
    }
  }
  return formData;
};

const appendFormValue = (formData: FormData, key: string, value: string | Blob | number | boolean): void => {
  formData.append(key, value instanceof Blob ? value : String(value));
};

export const getRequestBody = (options: ApiRequestOptions<unknown>): BodyInit | undefined => {
  if (options.formData || options.body === undefined || options.body === null) return undefined;
  if (
    typeof options.body === "string" ||
    options.body instanceof Blob ||
    options.body instanceof ArrayBuffer ||
    options.body instanceof URLSearchParams
  ) {
    return options.body;
  }
  return JSON.stringify(options.body);
};

export const sendRequest = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions<unknown>,
  url: string,
  body: BodyInit | undefined,
  formData: FormData | undefined,
  headers: Headers,
  onCancel: { isCancelled: boolean },
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = options.timeout ?? 60_000;
  let timedOut = false;
  const timeoutId = timeout > 0
    ? setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeout)
    : undefined;

  const abortForCancel = () => controller.abort();
  if (onCancel.isCancelled) throw new RequestCancelledError();
  const checkCancelled = setInterval(() => {
    if (onCancel.isCancelled) abortForCancel();
  }, 25);

  if (formData) {
    headers.delete("Content-Type");
  } else if (body !== undefined && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    let requestInit: RequestInit = {
      method: options.method,
      headers,
      body: formData ?? body,
      credentials: config.CREDENTIALS,
      signal: controller.signal,
    };

    for (const interceptor of config.interceptors.request._fns) {
      requestInit = await interceptor(requestInit);
    }
    if (onCancel.isCancelled) throw new RequestCancelledError();
    return await fetch(url, requestInit);
  } catch (error) {
    if (onCancel.isCancelled) throw new RequestCancelledError();
    if (timedOut) throw new RequestTimeoutError(timeout);
    throw error;
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    clearInterval(checkCancelled);
  }
};

export const getResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204 || response.status === 205) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("+json")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("The server returned invalid JSON");
    }
  }
  return text;
};

export const getResponseHeader = (response: Response, header?: string): string | null =>
  header ? response.headers.get(header) : null;

export const isApiResponse = (value: unknown): value is { code: number; message: string; data?: unknown } =>
  typeof value === "object" && value !== null &&
  typeof (value as { code?: unknown }).code === "number" &&
  typeof (value as { message?: unknown }).message === "string";

export const catchErrorCodes = (options: ApiRequestOptions<unknown>, result: ApiResult): void => {
  const apiResponse = isApiResponse(result.body) ? result.body : undefined;
  if (!result.ok || (options.errorCodes && options.errorCodes.includes(result.status))) {
    throw new ApiError(
      apiResponse?.message || result.statusText || "Request failed",
      result.status,
      apiResponse?.code,
      apiResponse?.data,
      result.url,
    );
  }
  if (!apiResponse) {
    throw new ApiError("The server returned an invalid API response", result.status, undefined, result.body, result.url);
  }
  if (apiResponse.code !== 0) {
    throw new ApiError(apiResponse.message || "Request failed", result.status, apiResponse.code, apiResponse.data, result.url);
  }
};
