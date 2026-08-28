import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";

const ALG = "HS256";
const ISSUER = "sualojinhamakeup";
const AUDIENCE = "sualojinhamakeup-admin";
const EXPIRES_IN = "7d";

function getSecret(): Uint8Array {
  const secret = process.env["AUTH_SECRET"] || process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("Missing AUTH_SECRET (or JWT_SECRET). Set a strong random string in env.");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionClaims extends JWTPayload {
  sub: string;
  email: string;
  role: "admin" | "user";
}

export interface SessionUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub || !payload["email"] || !payload["role"]) return null;
    return payload as SessionClaims;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const rows = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase().trim()))
    .limit(1);
  const user = rows[0];
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;

  const roleRows = await db
    .select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, user.id))
    .limit(1);
  const role = roleRows[0]?.role ?? "user";

  return { id: user.id, email: user.email, role };
}

export async function getUserRole(userId: string): Promise<"admin" | "user" | null> {
  const rows = await db
    .select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId))
    .limit(1);
  return rows[0]?.role ?? null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase().trim() === "sualojinhaadmin@admin.com";
}
