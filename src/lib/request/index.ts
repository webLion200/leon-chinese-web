import {
  OpenAPIConfig,
  ApiRequestOptions,
  ApiResult,
  ApiResponse,
} from "./types";
import { CancelablePromise } from "./cancelablePromise";
import {
  getUrl,
  getHeaders,
  getFormData,
  getRequestBody,
  sendRequest,
  getResponseBody,
  getResponseHeader,
  catchErrorCodes,
  isApiResponse,
} from "./core";
import { OpenAPI } from "./openAPI";

export const request = <T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions<T>,
): CancelablePromise<ApiResponse<T>> => {
  return new CancelablePromise(async (resolve, reject, onCancel) => {
    try {
      const url = getUrl(config, options);
      const headers = await getHeaders(config, options);
      const formData = getFormData(options);
      const body = getRequestBody(options);
      if (onCancel.isCancelled) return;

      let response = await sendRequest(
        config,
        options,
        url,
        body,
        formData,
        headers,
        onCancel,
      );
      for (const fn of config.interceptors.response._fns) {
        response = await fn(response);
      }

      let responseBody = await getResponseBody(response);
      const responseHeader = getResponseHeader(
        response,
        options.responseHeader,
      );
      if (response.ok) {
        const transform = options.responseTransformer ?? config.responseTransformer;
        if (transform && isApiResponse(responseBody) && responseBody.data !== undefined) {
          const transformedData = await transform(responseBody.data);
          responseBody = {
            ...responseBody,
            data: transformedData,
          };
        }
      }

      // Always validate the server's envelope before exposing a selected header value.
      const result: ApiResult = {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: responseBody,
      };

      catchErrorCodes(options, result);

      if (responseHeader) {
        resolve({ code: 0, message: "success", data: responseHeader } as ApiResponse<T>);
      } else {
        resolve(result.body as ApiResponse<T>);
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const Get = <T>(
  path: string,
  query?: Record<string, unknown>,
  options?: Partial<ApiRequestOptions<T>>,
): CancelablePromise<ApiResponse<T>> => {
  return request<T>(OpenAPI, {
    method: "GET",
    path,
    query,
    ...options,
  });
};

export const Post = <T>(
  path: string,
  body?: any,
  options?: Partial<ApiRequestOptions<T>>,
): CancelablePromise<ApiResponse<T>> => {
  return request<T>(OpenAPI, {
    method: "POST",
    path,
    body,
    ...options,
  });
};

export const Put = <T>(
  path: string,
  body?: any,
  options?: Partial<ApiRequestOptions<T>>,
): CancelablePromise<ApiResponse<T>> => {
  return request<T>(OpenAPI, {
    method: "PUT",
    path,
    body,
    ...options,
  });
};

export const Del = <T>(
  path: string,
  options?: Partial<ApiRequestOptions<T>>,
): CancelablePromise<ApiResponse<T>> => {
  return request<T>(OpenAPI, {
    method: "DELETE",
    path,
    ...options,
  });
};
