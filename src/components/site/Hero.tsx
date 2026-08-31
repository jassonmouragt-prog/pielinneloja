import { Link } from "@tanstack/react-router";
import heroAsset from "@/assets/pielinne-hero.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";
import { Star } from "lucide-react";

export function Hero() {
  const heroUrl = resolveAssetUrl(heroAsset);
  return (
    <section className="relative w-full overflow-hidden bg-beige">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[45%_55%]">
        {/* Text block */}
        <div className="relative flex items-center px-6 py-20 lg:px-[60px] lg:py-0 lg:min-h-[520px]">
          {/* decorative dotted circle bottom-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 bottom-8 hidden size-40 rounded-full border border-gold/50 lg:block"
            style={{
              background:
                "radial-gradient(circle, oklch(0.71 0.11 82 / 0.18) 1px, transparent 1.5px)",
              backgroundSize: "12px 12px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-8 top-10 hidden text-gold lg:block"
          >
            <Star className="size-5 fill-gold text-gold" strokeWidth={1} />
          </div>

          <div className="relative">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-deep">
              <span className="inline-block h-px w-10 bg-gold-deep" />
              Semijoias Elegantes
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl lg:text-[56px]">
              A elegância que
              <br />
              você merece para
              <br />
              <span className="italic">todos os momentos</span>
            </h1>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/categoria/colares"
                className="inline-flex items-center justify-center bg-gold px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-gold-deep"
              >
                Ver Coleções
              </Link>
            </div>
            <p className="mt-10 text-lg font-normal normal-case italic leading-relaxed text-ink/60 font-serif">
              Peças exclusivas, matéria-prima de alta qualidade
              <br className="hidden lg:block" />e o cuidado que a sua beleza merece.
            </p>
          </div>
        </div>

        {/* Image block — bleeds to right edge */}
        <div className="relative min-h-[320px] lg:min-h-[520px]">
          <img
            src={heroUrl}
            alt="Pielinne Semijoias — modelo usando semijoias"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
