import heroAsset from "@/assets/pielinne-hero.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function Hero() {
  const heroUrl = resolveAssetUrl(heroAsset);
  return (
    <section className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
      <img
        src={heroUrl}
        alt="Pielinne Semijoias"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
    </section>
  );
}
