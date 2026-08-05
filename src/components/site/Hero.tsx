import heroAsset from "@/assets/hero-banner.png.asset.json";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-12">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={heroAsset.url}
            alt="Sua beleza, seu brilho, sua escolha! Os melhores produtos de beleza com preços que você ama."
            width={1200}
            height={630}
            className="w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}