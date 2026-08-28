export interface AssetMetadata {
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

export function resolveAssetUrl(asset: AssetMetadata | undefined | null): string {
  if (!asset) return "";
  if (asset.r2_key) {
    const base = import.meta.env["VITE_R2_PUBLIC_BASE_URL"] as string | undefined;
    if (base) {
      return `${base.replace(/\/$/, "")}/${asset.r2_key}`;
    }
    return asset.r2_key;
  }
  return asset.url;
}
