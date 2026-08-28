import { ChevronDown } from "lucide-react";
import heroAsset from "@/assets/hero-banner-new.png.asset.json";
import { resolveAssetUrl } from "@/lib/assets";

export function Hero() {
  const heroUrl = resolveAssetUrl(heroAsset);
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="w-full">
        <div className="hidden md:block w-full">
          <img
            src={heroUrl}
            alt="Banner Promocional: Sua beleza, seu brilho, sua escolha!"
            className="w-full h-auto block"
            loading="eager"
          />
        </div>
        <div className="md:hidden relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={heroUrl}
            alt="Banner Promocional: Sua beleza, seu brilho, sua escolha!"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>
      </div>

      <a
        href="#categorias"
        aria-label="Rolar para baixo"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 grid place-items-center w-10 h-10 rounded-full bg-white/90 text-pink shadow-md backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
      >
        <ChevronDown className="size-5 animate-bounce-soft" />
      </a>
    </section>
  );
}
