import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import {
  authenticateUser,
  signSessionToken,
  hashPassword,
  isAdminEmail,
  verifySessionToken,
  getUserRole,
} from "@/lib/auth/auth";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { tokenStorage } from "@/lib/auth/token-storage";

export const signIn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = await authenticateUser(data.email, data.password);
    if (!user) throw new Error("E-mail ou senha incorretos.");

    const adminByEmail = isAdminEmail(user.email);
    if (user.role !== "admin" && !adminByEmail) {
      throw new Error("Acesso negado. Apenas administradores podem acessar esta área.");
    }

    if (user.role !== "admin" && adminByEmail) {
      try {
        await db
          .insert(schema.userRoles)
          .values({ userId: user.id, role: "admin" })
          .onConflictDoNothing();
      } catch (e) {
        console.warn("[auth] failed to ensure admin role for hardcoded admin email", e);
      }
    }

    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      role: "admin",
    });

    return {
      token,
      user: { id: user.id, email: user.email, role: "admin" as const },
    };
  });

export const getCurrentSession = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const request = getRequest();
      const authHeader = request?.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) return null;
      const token = authHeader.replace("Bearer ", "");
      const claims = await verifySessionToken(token);
      if (!claims) return null;
      const role = await getUserRole(claims.sub);
      return {
        userId: claims.sub,
        email: claims.email,
        role: role ?? "user",
      };
    } catch (e) {
      console.warn("[auth] getCurrentSession failed", e);
      return null;
    }
  },
);

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase().trim();
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (existing.length > 0) {
      const found = existing[0];
      if (!found) throw new Error("User lookup failed");
      return { ok: true, created: false, userId: found.id };
    }
    const passwordHash = await hashPassword(data.password);
    const inserted = await db
      .insert(schema.users)
      .values({ email, passwordHash })
      .returning();
    const user = inserted[0];
    if (!user) throw new Error("Failed to create user");
    await db.insert(schema.userRoles).values({ userId: user.id, role: "admin" });
    return { ok: true, created: true, userId: user.id };
  });

export { tokenStorage };
