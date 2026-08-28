import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Config() {
  const accountId = process.env["R2_ACCOUNT_ID"];
  const accessKeyId = process.env["R2_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["R2_SECRET_ACCESS_KEY"];
  const bucket = process.env["R2_BUCKET_NAME"];
  const publicBaseUrl = process.env["R2_PUBLIC_BASE_URL"];

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing Cloudflare R2 configuration. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in env.",
    );
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

let _client: S3Client | undefined;

function getClient(): S3Client {
  if (_client) return _client;
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob,
  contentType: string,
  opts: { cacheControl?: string } = {},
): Promise<UploadResult> {
  const { bucket, publicBaseUrl } = getR2Config();
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: opts.cacheControl ?? "public, max-age=31536000, immutable",
    }),
  );
  const url = publicBaseUrl
    ? `${publicBaseUrl.replace(/\/$/, "")}/${key}`
    : await getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key }), {
        expiresIn: 60 * 60 * 24 * 365 * 10,
      });
  return { key, url };
}

export async function deleteFile(key: string): Promise<void> {
  const { bucket } = getR2Config();
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function buildPublicUrl(key: string): string {
  const { publicBaseUrl } = getR2Config();
  if (publicBaseUrl) return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
  return key;
}
