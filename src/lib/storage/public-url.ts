export function publicImageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  const base = import.meta.env["VITE_R2_PUBLIC_BASE_URL"] as string | undefined;
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key}`;
}
