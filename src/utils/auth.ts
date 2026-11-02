// src/utils/auth.ts
export const getToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('token') || undefined;
};
export const setToken = (t: string) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');
