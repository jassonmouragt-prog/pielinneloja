import heroAsset from "@/assets/hero-banner.png.asset.json";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div className="w-full">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9] lg:aspect-[3/1]">
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