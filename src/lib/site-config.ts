export const socialLinks = {
  instagram: "https://www.instagram.com/pielinne_semijoias/",
  facebook: "https://www.facebook.com/p/Pielinne-61579394410896/",
  whatsapp: "https://wa.me/5541985073920",
} as const;

export function productSearch(productId: string) {
  return { produto: productId };
}

export function getProductUrl(productId: string): string {
  const configured = import.meta.env?.["VITE_SITE_URL"] as string | undefined;
  const base =
    configured ||
    (typeof window !== "undefined" ? window.location.origin : "https://pielinneloja.vercel.app");
  const url = new URL("/", base);
  url.search = new URLSearchParams(productSearch(productId)).toString();
  return url.toString();
}
