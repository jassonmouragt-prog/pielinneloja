import "dotenv/config";
import type { Config } from "drizzle-kit";

const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
if (!url) {
  throw new Error("DATABASE_URL is required for drizzle-kit");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  casing: "snake_case",
  strict: true,
  verbose: true,
} satisfies Config;
