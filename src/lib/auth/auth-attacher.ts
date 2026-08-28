import { createMiddleware } from "@tanstack/react-start";
import { tokenStorage } from "./token-storage";

export const attachAuthToken = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const token = tokenStorage.get();
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
