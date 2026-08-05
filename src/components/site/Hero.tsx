import { Heart } from "lucide-react";

import heroBasket from "@/assets/hero-basket.png";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden gradient-hero">
      {/* organic shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 110% at 88% 20%, var(--pink-light) 0%, var(--pink-light) 42%, transparent 62%), radial-gradient(60% 90% at 62% 100%, var(--pink) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:py-6">
        <div className="max-w-md">
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-bold text-primary-foreground sm:text-6xl lg:text-[4.15rem]">
            Sua beleza,
            <br />
            <span className="text-pink-deep">seu brilho,</span>
            <br />
            sua escolha!
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            Os melhores produtos de beleza
            <br className="hidden sm:block" /> com preços que você ama.
          </p>
          <a
            href="#mais-vendidos"
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-primary-foreground/70 px-7 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/15"
          >
            Comprar agora
            <Heart className="size-4" />
          </a>
        </div>

        <div className="relative">
          <img
            src={heroBasket}
            alt="Cesta rosa cheia de produtos de maquiagem"
            width={1200}
            height={1024}
            className="mx-auto w-full max-w-[560px] drop-shadow-2xl"
          />
          <div className="absolute right-2 bottom-2 grid size-16 place-items-center rounded-[1.75rem] rounded-br-md bg-pink text-primary-foreground shadow-card sm:size-20">
            <Heart className="size-7 fill-primary-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
}