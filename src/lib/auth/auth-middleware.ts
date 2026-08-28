import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { db, schema } from "@/db/client";
import { verifySessionToken, getUserRole } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

export interface AuthContext {
  userId: string;
  email: string;
  role: "admin" | "user";
  db: typeof db;
}

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  if (!request?.headers) {
    throw new Error("Unauthorized: No request headers available");
  }
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: No bearer token provided");
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new Error("Unauthorized: No token provided");

  const claims = await verifySessionToken(token);
  if (!claims) throw new Error("Unauthorized: Invalid token");

  const role = await getUserRole(claims.sub);
  if (role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return next({
    context: {
      userId: claims.sub,
      email: claims.email,
      role: "admin" as const,
      db,
    } satisfies AuthContext,
  });
});

export const optionalAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  let context: Partial<AuthContext> = { db };
  if (request?.headers) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const claims = await verifySessionToken(token);
      if (claims) {
        const role = await getUserRole(claims.sub);
        context = {
          ...context,
          userId: claims.sub,
          email: claims.email,
          role: role ?? "user",
        };
      }
    }
  }
  return next({ context });
});
