import { createMiddleware } from "@tanstack/react-start";

const TOKEN_KEY = "sualojinha_token";

export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

export const attachAuthToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = tokenStorage.get();
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});
