import { Link } from "@tanstack/react-router";
import heroAsset from "@/assets/pielinne-hero.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function Hero() {
  const heroUrl = resolveAssetUrl(heroAsset);
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-4">
        <Link
          to="/colecoes"
          className="relative block overflow-hidden rounded-3xl shadow-glass"
          aria-label="Ver coleções mais vendidas"
        >
          <img
            src={heroUrl}
            alt="Pielinne Semijoias"
            className="h-[350px] sm:h-[450px] lg:h-[550px] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent rounded-3xl" />
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/90 mb-2">
              Nova Coleção
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
              Descubra Nossas Peças
            </h2>
            <p className="mt-3 text-base sm:text-lg text-white/80 max-w-xl mx-auto">
              Semijoias elegantes para todos os momentos
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}