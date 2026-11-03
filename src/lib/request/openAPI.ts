import { getToken } from "@/utils/auth";
import { OpenAPIConfig, Interceptors } from "./types";

const apiHost = process.env.NEXT_PUBLIC_HOST?.replace(/\/+$/, "");
const apiPrefix = process.env.NEXT_PUBLIC_API?.replace(/^\/+|\/+$/g, "");

if (!apiHost || !apiPrefix) {
  throw new Error("NEXT_PUBLIC_HOST and NEXT_PUBLIC_API must be configured");
}

const apiBase = `${apiHost}/${apiPrefix}`;

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
