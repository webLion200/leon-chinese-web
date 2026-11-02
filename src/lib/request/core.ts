import { ApiRequestOptions, ApiResult, OpenAPIConfig } from "./types";

export const getUrl = (
  config: OpenAPIConfig,
  options: ApiRequestOptions<any>,
): string => {
  const baseUrl = config.BASE.replace(/\/$/, "");
  let path = options.path;
  if (config.ENCODE_PATH) path = config.ENCODE_PATH(path);

  const query = options.query
    ? new URLSearchParams(options.query).toString()
    : "";
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
};

export const getHeaders = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions<any>,
): Promise<HeadersInit> => {
  let headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (config.HEADERS) {
    const resolved =
      typeof config.HEADERS === "function"
        ? await config.HEADERS()
        : config.HEADERS;
    headers = { ...resolved, ...headers };
  }
  if (config.TOKEN) {
    const token =
      typeof config.TOKEN === "function" ? await config.TOKEN() : config.TOKEN;
    // @ts-expect-error - 类型错误
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const getFormData = (
  options: ApiRequestOptions<any>,
): FormData | undefined => {
  if (!options.formData) return undefined;
  const formData = new FormData();
  for (const key in options.formData) {
    formData.append(key, options.formData[key]);
  }
  return formData;
};

export const getRequestBody = (options: ApiRequestOptions<any>): any => {
  if (options.formData) return undefined;
  return options.body ? JSON.stringify(options.body) : undefined;
};

export const sendRequest = async (
  config: OpenAPIConfig,
  options: ApiRequestOptions<any>,
  url: string,
  body: any,
  formData: FormData | undefined,
  headers: HeadersInit,
  onCancel: { isCancelled: boolean },
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = options.timeout ?? 60 * 1000; // 默认 60 秒超时
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let requestInit: RequestInit = {
    method: options.method,
    headers,
    body: formData || body,
    credentials: config.CREDENTIALS,
    signal: controller.signal, // ✅ 注入 signal
  };

  try {
    for (const interceptor of config.interceptors.request._fns) {
      requestInit = await interceptor(requestInit);
    }

    if (onCancel.isCancelled) throw new Error("Request cancelled");

    const response = await fetch(url, requestInit);
    clearTimeout(timeoutId); // ✅ 请求成功则清除定时器
    return response;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw err;
  }
};

export const getResponseBody = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  } else {
    return await response.text();
  }
};

export const getResponseHeader = (
  response: Response,
  header?: string,
): string | null => {
  return header ? response.headers.get(header) : null;
};

export const catchErrorCodes = (
  options: ApiRequestOptions<any>,
  result: ApiResult,
): void => {
  if (
    !result.ok ||
    (options.errorCodes && options.errorCodes.includes(result.status))
  ) {
    const message = typeof result.body === "object" && result.body?.message;
    throw new Error(message || result.statusText);
  }
};
