import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

interface AssetJson {
  version: number;
  asset_id: string;
  project_id: string;
  url: string;
  r2_key: string;
  original_filename: string;
  size: number;
  content_type: string;
  created_at: string;
}

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

  const jsonPath = resolve("src/assets/pielinne-banner.png.asset.json");
  const metadata = JSON.parse(await readFile(jsonPath, "utf-8")) as AssetJson;
  const body = await readFile(resolve("src/assets/pielinne-banner.png"));
  const ext = "png";
  const key = `${"site"}/${metadata.asset_id}-${randomUUID().slice(0, 8)}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const updated: AssetJson = {
    ...metadata,
    r2_key: key,
    url: `${publicBase.replace(/\/$/, "")}/${key}`,
    original_filename: "banner meio de sessao v2.png",
    size: body.length,
  };
  await writeFile(jsonPath, JSON.stringify(updated, null, 2) + "\n", "utf-8");
  console.log(`Uploaded new banner → ${updated.url}`);
  console.log("Updated pielinne-banner.png.asset.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});