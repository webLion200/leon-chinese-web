import { getToken } from "@/utils/auth";
import { OpenAPIConfig, Interceptors } from "./types";

const apiBase = process.env.NEXT_PUBLIC_HOST + process.env.NEXT_PUBLIC_API;

export const OpenAPI: OpenAPIConfig = {
  BASE: apiBase,
  CREDENTIALS: "omit",
  ENCODE_PATH: undefined,
  HEADERS: undefined,
  PASSWORD: undefined,
  TOKEN: () => getToken(), // ✅ 动态获取 token,
  USERNAME: undefined,
  VERSION: "1.0.0",
  WITH_CREDENTIALS: false,
  interceptors: {
    request: new Interceptors(),
    response: new Interceptors(),
  },
};
