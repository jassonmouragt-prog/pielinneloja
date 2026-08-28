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

const STATIC_ASSETS: Array<{
  jsonPath: string;
  binaryPath: string | null;
  remoteUrl: string | null;
  folder: "site";
}> = [
  {
    jsonPath: "src/assets/logo.png.asset.json",
    binaryPath: "src/assets/logo.png",
    remoteUrl: null,
    folder: "site",
  },
  {
    jsonPath: "src/assets/hero-banner-new.png.asset.json",
    binaryPath: null,
    remoteUrl: null,
    folder: "site",
  },
  {
    jsonPath: "src/assets/banner-kits-new.png.asset.json",
    binaryPath: null,
    remoteUrl: null,
    folder: "site",
  },
];

function getR2Config() {
  const accountId = process.env["R2_ACCOUNT_ID"];
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"];
  const bucket = process.env["R2_BUCKET_NAME"];
  const publicBaseUrl = process.env["R2_PUBLIC_BASE_URL"];
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing R2 configuration. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.",
    );
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  const arr = new Uint8Array(await res.arrayBuffer());
  return Buffer.from(arr);
}

async function main() {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl } = getR2Config();

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  console.log(`Uploading static assets to R2 bucket "${bucket}"...`);
  if (publicBaseUrl) {
    console.log(`Public base URL: ${publicBaseUrl}`);
  }

  for (const asset of STATIC_ASSETS) {
    const jsonPath = resolve(asset.jsonPath);
    const metadata = JSON.parse(await readFile(jsonPath, "utf-8")) as AssetJson;

    let buffer: Buffer | null = null;
    if (asset.binaryPath) {
      const binPath = resolve(asset.binaryPath);
      try {
        buffer = await readFile(binPath);
        console.log(`  Read local file: ${asset.binaryPath} (${buffer.length} bytes)`);
      } catch (e: any) {
        if (e.code !== "ENOENT") throw e;
        console.log(`  Local file missing, will download: ${asset.binaryPath}`);
      }
    }

    if (!buffer) {
      const remoteCandidates = [
        metadata.r2_key?.startsWith("a/v1/")
          ? `https://aa4b9202-e8a7-47a0-9cf6-7abe122c26ad.r2.cloudflarestorage.com/${metadata.r2_key}`
          : null,
        metadata.r2_key
          ? `https://${accountId}.r2.cloudflarestorage.com/${metadata.r2_key}`
          : null,
        `https://aa4b9202-e8a7-47a0-9cf6-7abe122c26ad.lovableproject.com${metadata.url}`,
        `https://aa4b9202-e8a7-47a0-9cf6-7abe122c26ad.lovable.app${metadata.url}`,
      ].filter((x): x is string => !!x);

      let lastErr: unknown = null;
      for (const url of remoteCandidates) {
        try {
          console.log(`  Trying to download: ${url}`);
          buffer = await downloadFile(url);
          console.log(`  Downloaded ${buffer.length} bytes`);
          break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (!buffer) {
        throw new Error(
          `Could not fetch binary for ${asset.jsonPath}. Tried: ${remoteCandidates.join(", ")}. Last error: ${lastErr}`,
        );
      }
    }

    const ext = metadata.content_type?.split("/")[1] || "bin";
    const key = `${asset.folder}/${metadata.asset_id}-${randomUUID().slice(0, 8)}.${ext}`;

    console.log(`  Uploading → ${key}`);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: metadata.content_type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const updated: AssetJson = {
      ...metadata,
      r2_key: key,
      url: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}/${key}` : `/${key}`,
    };
    await writeFile(jsonPath, JSON.stringify(updated, null, 2) + "\n", "utf-8");
    console.log(`  Updated ${asset.jsonPath} → r2_key: ${key}`);
  }

  console.log("\nDone! Static assets uploaded and metadata files updated.");
  console.log("Restart `bun run dev` to see the new images.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
