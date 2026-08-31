import "dotenv/config";
import { readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
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
  folder: "site";
}> = [
  {
    jsonPath: "src/assets/pielinne-logo.png.asset.json",
    binaryPath: "src/assets/pielinne-logo.png",
    folder: "site",
  },
  {
    jsonPath: "src/assets/pielinne-hero.png.asset.json",
    binaryPath: "src/assets/pielinne-hero.png",
    folder: "site",
  },
  {
    jsonPath: "src/assets/pielinne-banner.png.asset.json",
    binaryPath: "src/assets/pielinne-banner.png",
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

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  const arr = new Uint8Array(await res.arrayBuffer());
  return Buffer.from(arr);
}

async function checkR2ObjectExists(
  client: S3Client,
  bucket: string,
  key: string,
): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
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
    let bufferSource = "";

    if (asset.binaryPath) {
      const binPath = resolve(asset.binaryPath);
      if (await fileExists(binPath)) {
        buffer = await readFile(binPath);
        bufferSource = `local file (${buffer.length} bytes)`;
      }
    }

    if (!buffer) {
      const remoteCandidates = [
        `https://aa4b9202-e8a7-47a0-9cf6-7abe122c26ad.lovableproject.com${metadata.url.includes("l5e") ? metadata.url : "/__l5e/assets-v1/" + metadata.asset_id + "/" + metadata.original_filename}`,
        `https://aa4b9202-e8a7-47a0-9cf6-7abe122c26ad.lovable.app${metadata.url.includes("l5e") ? metadata.url : "/__l5e/assets-v1/" + metadata.asset_id + "/" + metadata.original_filename}`,
      ];

      let lastErr: unknown = null;
      for (const url of remoteCandidates) {
        try {
          console.log(`  Trying to download: ${url}`);
          buffer = await downloadFile(url);
          bufferSource = `downloaded (${buffer.length} bytes)`;
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

    console.log(`  Got buffer: ${bufferSource}`);

    const ext = metadata.content_type?.split("/")[1] || "bin";
    const key = `${asset.folder}/${metadata.asset_id}-${randomUUID().slice(0, 8)}.${ext}`;

    const alreadyExists = await checkR2ObjectExists(client, bucket, key);
    if (alreadyExists) {
      console.log(`  ✓ Already in R2: ${key}`);
    } else {
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
    }

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
