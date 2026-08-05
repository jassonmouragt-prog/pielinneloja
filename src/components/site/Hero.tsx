import heroAsset from "@/assets/hero-banner.png.asset.json";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:py-8">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9] lg:aspect-[3/1]">
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