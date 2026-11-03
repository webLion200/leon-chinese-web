declare module "*.css";

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_HOST: string;
    readonly NEXT_PUBLIC_API: string;
    readonly NEXT_PUBLIC_SOCKET_HOST?: string;
  }
}
