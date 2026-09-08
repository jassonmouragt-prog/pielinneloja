import bannerAsset from "@/assets/pielinne-banner.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function KitsBanner() {
  const bannerUrl = resolveAssetUrl(bannerAsset);
  return (
    <section className="relative w-full h-[220px] sm:h-[400px] lg:h-[500px] overflow-hidden glass">
      <img
        src={bannerUrl}
        alt="Pielinne Semijoias — coleção"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
    </section>
  );
}