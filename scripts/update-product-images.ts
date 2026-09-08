import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

interface Def {
  file: string;
  key: string;
  contentType: string;
  productName: string;
}

const FILES: Def[] = [
  {
    file: "src/assets/prod-brincos-real.webp",
    key: "prod-brincos-real.webp",
    contentType: "image/webp",
    productName: "Brincos Pérola de Rio",
  },
  {
    file: "src/assets/prod-pulseiras-real.webp",
    key: "prod-pulseiras-real.webp",
    contentType: "image/webp",
    productName: "Pulseira Dourada Fina",
  },
  {
    file: "src/assets/prod-aneis-real.avif",
    key: "prod-aneis-real.avif",
    contentType: "image/avif",
    productName: "Anel Coração Zircônia",
  },
];

async function main() {
  const accountId = process.env["R2_ACCOUNT_ID"]!;
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"]!;
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"]!;
  const bucket = process.env["R2_BUCKET_NAME"]!;
  const publicBase = process.env["R2_PUBLIC_BASE_URL"]!;

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL required");
  const db = drizzle(neon(url));

  for (const f of FILES) {
    const body = await readFile(resolve(f.file));
    const key = `products/${randomUUID().slice(0, 8)}-${f.key}`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: f.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const imageUrl = `${publicBase.replace(/\/$/, "")}/${key}`;
    console.log(`Uploaded ${f.file} → ${imageUrl}`);

    const prodRes = await db.execute(
      sql`SELECT id FROM public.products WHERE name = ${f.productName} LIMIT 1`,
    );
    const productId = (prodRes.rows[0] as any)?.id;
    if (!productId) {
      console.log(`  SKIP: product "${f.productName}" not found`);
      continue;
    }

    await db.execute(
      sql`UPDATE public.product_images SET url = ${imageUrl} WHERE product_id = ${productId} AND is_main = true`,
    );
    const del = await db.execute(
      sql`DELETE FROM public.product_images WHERE product_id = ${productId} AND is_main = false`,
    );
    console.log(`  Updated main image for "${f.productName}" (${productId})`);
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
