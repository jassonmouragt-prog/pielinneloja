import { Reveal } from "./Reveal";
import { Star } from "lucide-react";
import bannerAsset from "@/assets/pielinne-banner.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function KitsBanner() {
  const bannerUrl = resolveAssetUrl(bannerAsset);
  return (
    <Reveal as="section" className="bg-ink">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Text side */}
        <div className="relative flex items-center px-6 py-20 lg:px-[60px] lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[10%] top-1/2 hidden size-44 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 lg:flex"
          >
            <div className="size-9 rounded-full border border-gold/50" />
            <div aria-hidden className="absolute grid size-6 place-items-center">
              <Star className="size-5 fill-gold text-gold" strokeWidth={1} />
            </div>
          </div>

          <div className="relative z-10 pl-0 lg:pl-40">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
              <span className="inline-block h-px w-10 bg-gold" />A Pielinne
            </p>
            <h2 className="max-w-md font-serif text-3xl font-semibold leading-[1.15] text-beige-light sm:text-4xl">
              Cada peça é pensada
              <br />
              para realçar o seu
              <br />
              <span className="italic text-gold">verdadeiro brilho</span>
            </h2>
            <div className="mt-10">
              <a
                href="https://wa.me/5541985073920"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-gold px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-gold-deep"
              >
                Comprar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Image side */}
        <div className="relative min-h-[300px] lg:min-h-[480px]">
          <img
            src={bannerUrl}
            alt="Pielinne Semijoias — coleção"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <p className="absolute bottom-8 right-8 text-[10px] font-medium uppercase tracking-[0.3em] text-beige/70">
            Piercing · Brilho · Beleza
          </p>
        </div>
      </div>
    </Reveal>
  );
}
