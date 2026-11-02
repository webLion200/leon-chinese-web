export type IResponse<T = any> = {
  code: number;
  info: string;
} & T;
