import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

interface ProductImageDef {
  file: string;
  key: string;
  contentType: string;
}

const FILES: ProductImageDef[] = [
  { file: "src/assets/prod-brincos.png", key: "prod-brincos.png", contentType: "image/png" },
  { file: "src/assets/prod-pulseiras.png", key: "prod-pulseiras.png", contentType: "image/png" },
  { file: "src/assets/prod-aneis.png", key: "prod-aneis.png", contentType: "image/png" },
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

  const results: Record<string, string> = {};
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
    const url = `${publicBase.replace(/\/$/, "")}/${key}`;
    results[f.key] = url;
    console.log(`Uploaded ${f.file} → ${url}`);
  }

  require("node:fs").writeFileSync(
    resolve("scripts/.product-image-urls.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("Saved URLs to scripts/.product-image-urls.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
