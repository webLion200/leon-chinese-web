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

      const responseBody = await getResponseBody(response);
      const responseHeader = getResponseHeader(
        response,
        options.responseHeader,
      );
      const transformedBody =
        options.responseTransformer && response.ok
          ? await options.responseTransformer(responseBody)
          : config.responseTransformer && response.ok
            ? await config.responseTransformer<T>(responseBody)
            : responseBody;

      const result: ApiResult = {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: responseHeader ?? transformedBody,
      };

      catchErrorCodes(options, result);

      resolve(result.body as ApiResponse<T>);
    } catch (error) {
      reject(error);
    }
  });
};

export const Get = <T>(
  path: string,
  query?: Record<string, any>,
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
