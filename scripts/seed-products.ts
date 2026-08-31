import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
if (!url) throw new Error("DATABASE_URL required");
const db = drizzle(neon(url));

const RAW_BASE = "https://pub-20840144408e4e118fdaf32eee061f25.r2.dev/products";

const PRODUCTS: Array<{
  name: string;
  subtitle: string;
  description: string;
  price: number;
  categoryName: string;
  stock: number;
  imagePath: string;
}> = [
  {
    name: "Brincos Pérola de Rio",
    subtitle: "Elegância clássica para o dia a dia",
    description:
      "Brincos de semijoia com pérolas de rio banhadas em dourado, delicados e atemporais. Ideal para looks de trabalho e ocasiões especiais.",
    price: 89.9,
    categoryName: "Brincos",
    stock: 12,
    imagePath: "e34ff554-prod-brincos.png",
  },
  {
    name: "Pulseira Dourada Fina",
    subtitle: "Minimalista e versátil",
    description:
      "Pulseira de semijoia em dourado fino, leve e versátil, perfeita para composições minimalistas ou para combinar com outras peças.",
    price: 69.9,
    categoryName: "Pulseiras",
    stock: 18,
    imagePath: "046380cc-prod-pulseiras.png",
  },
  {
    name: "Anel Coração Zircônia",
    subtitle: "O toque de brilho no seu dedo",
    description:
      "Anel de semijoia com zircônia em formato de coração, banhado em dourado. Um detalhe romântico e sofisticado para presentear ou se presentear.",
    price: 119.9,
    categoryName: "Anéis",
    stock: 9,
    imagePath: "3dd328cf-prod-aneis.png",
  },
];

async function main() {
  for (const p of PRODUCTS) {
    const catRes = await db.execute(
      sql`SELECT id FROM public.categories WHERE name = ${p.categoryName} LIMIT 1`,
    );
    const catId = (catRes.rows[0] as any)?.id;
    if (!catId) {
      console.log(`SKIP ${p.name}: category "${p.categoryName}" not found`);
      continue;
    }

    const exists = await db.execute(
      sql`SELECT id FROM public.products WHERE name = ${p.name} LIMIT 1`,
    );
    if ((exists.rows[0] as any)?.id) {
      console.log(`SKIP ${p.name}: already exists`);
      continue;
    }

    const ins = await db.execute(
      sql`INSERT INTO public.products (name, subtitle, description, price, category_id, stock_quantity, status)
          VALUES (${p.name}, ${p.subtitle}, ${p.description}, ${p.price}, ${catId}, ${p.stock}, 'active')
          RETURNING id`,
    );
    const productId = (ins.rows[0] as any).id as string;

    const imageUrl = `${RAW_BASE}/${p.imagePath}`;
    await db.execute(
      sql`INSERT INTO public.product_images (product_id, url, is_main)
          VALUES (${productId}, ${imageUrl}, true)`,
    );

    console.log(`INSERTED: ${p.name} (${p.categoryName}) → ${productId}`);
    console.log(`          image: ${imageUrl}`);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
