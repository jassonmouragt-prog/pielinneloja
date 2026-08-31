import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";

const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
if (!url) throw new Error("DATABASE_URL required");
const db = drizzle(neon(url));

const ADMIN_EMAIL = "pielinneadmin@admin.com";
const NEW_PASSWORD = "admin123";

async function main() {
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  const res = await db.execute(
    sql`UPDATE public.users SET password_hash = ${hash}, updated_at = now()
        WHERE email = ${ADMIN_EMAIL} RETURNING id, email`,
  );
  if (res.rows.length === 0) {
    console.log("ERROR: admin user not found.");
    process.exit(1);
  }
  console.log("Senha do admin atualizada com sucesso!");
  console.log("Email:", ADMIN_EMAIL);
  console.log("Senha: admin123");
}
main().catch((e) => { console.error(e); process.exit(1); });
