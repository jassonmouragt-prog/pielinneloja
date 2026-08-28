import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
if (!url) {
  throw new Error("DATABASE_URL is required");
}

const connection = neon(url);
const db = drizzle(connection);

const NEW_CATEGORIES = [
  { name: "Pele", tone: "#F06292" },
  { name: "Olhos", tone: "#F06292" },
  { name: "Lábios", tone: "#F06292" },
  { name: "Sobrancelhas", tone: "#F06292" },
  { name: "Perfumaria", tone: "#F06292" },
  { name: "Skincare", tone: "#F06292" },
  { name: "Cabelos", tone: "#F06292" },
  { name: "Corpo", tone: "#F06292" },
  { name: "Acessórios", tone: "#F06292" },
];

async function main() {
  console.log("Fetching current categories...");
  const existing = await db.execute(sql`SELECT id, name FROM public.categories`);
  const existingNames = new Set((existing.rows as Array<{ name: string }>).map((r) => r.name));
  console.log(`Found ${existingNames.size} existing categories:`, Array.from(existingNames));

  const newNames = new Set(NEW_CATEGORIES.map((c) => c.name));
  const toDelete = Array.from(existingNames).filter((n) => !newNames.has(n));
  const toInsert = NEW_CATEGORIES.filter((c) => !existingNames.has(c.name));

  if (toDelete.length > 0) {
    console.log(`\nDeleting ${toDelete.length} categories that are not in the new list:`);
    for (const name of toDelete) {
      const products = await db.execute(
        sql`SELECT COUNT(*) as count FROM public.products WHERE category_id IN (SELECT id FROM public.categories WHERE name = ${name})`,
      );
      const productCount = Number((products.rows[0] as any)?.count ?? 0);
      if (productCount > 0) {
        console.log(`  ⚠️  ${name}: has ${productCount} products linked. Their category will be set to NULL.`);
      }
      await db.execute(sql`DELETE FROM public.categories WHERE name = ${name}`);
      console.log(`  ✓ Deleted: ${name}`);
    }
  } else {
    console.log("\nNo categories to delete.");
  }

  if (toInsert.length > 0) {
    console.log(`\nInserting ${toInsert.length} new categories:`);
    for (const cat of toInsert) {
      await db.execute(
        sql`INSERT INTO public.categories (name, tone) VALUES (${cat.name}, ${cat.tone})`,
      );
      console.log(`  ✓ Inserted: ${cat.name}`);
    }
  } else {
    console.log("\nNo new categories to insert (all already exist).");
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
