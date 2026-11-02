declare module "*.css";

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_HOST: string;
    NEXT_PUBLIC_API: string;
    NEXT_PUBLIC_SOCKET_HOST: string;
  }
}
