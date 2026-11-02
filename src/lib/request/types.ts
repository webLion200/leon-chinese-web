export type Resolver<T> = T | (() => T | Promise<T>);

export interface Interceptors<T> {
  _fns: Array<(input: T) => Promise<T> | T>;
  use(fn: (input: T) => Promise<T> | T): void;
}

export class Interceptors<T> implements Interceptors<T> {
  constructor() {
    this._fns = [];
  }
  use(fn: (input: T) => Promise<T> | T) {
    this._fns.push(fn);
  }
}

export interface OpenAPIConfig {
  BASE: string;
  CREDENTIALS: 'include' | 'omit' | 'same-origin';
  ENCODE_PATH?: (path: string) => string;
  HEADERS?: HeadersInit | Resolver<HeadersInit>;
  PASSWORD?: string | Resolver<string>;
  TOKEN?: Resolver<string | undefined>;
  USERNAME?: string | Resolver<string>;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  interceptors: {
    request: Interceptors<RequestInit>;
    response: Interceptors<Response>;
  };
  responseTransformer?: <T>(data: any) => T | Promise<T>;
}

export interface ApiRequestOptions<T> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  formData?: Record<string, any>;
  body?: any;
  responseHeader?: string;
  responseTransformer?: (data: any) => Promise<T> | T;
  errorCodes?: number[];
  timeout?: number; // 设置接口超时时间
}

export interface ApiResult {
  url: string;
  ok: boolean;
  status: number;
  statusText: string;
  body: any;
}

/**
 * 接口返回结构
 * {
 *   code: number
 *   message: string
 *   data?: T
 * }
 */
export type ApiResponse<T = any> = {
  code: number;
  message: string;
  data?: T;
} & Record<string, any>;
