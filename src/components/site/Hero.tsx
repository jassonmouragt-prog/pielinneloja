import { Link } from "@tanstack/react-router";
import heroAsset from "@/assets/pielinne-hero.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function Hero() {
  const heroUrl = resolveAssetUrl(heroAsset);
  return (
    <Link
      to="/colecoes"
      className="relative block w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden"
      aria-label="Ver coleções mais vendidas"
    >
      <img
        src={heroUrl}
        alt="Pielinne Semijoias"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
    </Link>
  );
}
