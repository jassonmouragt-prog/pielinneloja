import heroAsset from "@/assets/hero-banner-new.png.asset.json";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="w-full">
        {/* Desktop and Tablet */}
        <div className="hidden md:block w-full">
          <img
            src={heroAsset.url}
            alt="Banner Promocional: Sua beleza, seu brilho, sua escolha!"
            className="w-full h-auto block"
            loading="eager"
          />
        </div>
        {/* Mobile */}
        <div className="md:hidden relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={heroAsset.url}
            alt="Banner Promocional: Sua beleza, seu brilho, sua escolha!"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
