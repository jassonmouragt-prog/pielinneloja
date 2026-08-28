import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function getConnectionString(): string {
  const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
  if (!url) {
    throw new Error("Missing Neon DATABASE_URL. Set DATABASE_URL in your environment variables.");
  }
  return url;
}

const sql = neon(getConnectionString());

export const db = drizzle(sql, { schema, casing: "snake_case" });
export { schema };
export type Db = typeof db;
