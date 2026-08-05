import { Heart } from "lucide-react";

import bannerKit from "@/assets/banner-kit.png";
import bannerModel from "@/assets/banner-model.png";
import { Reveal } from "./Reveal";

export function KitsBanner() {
  return (
    <Reveal as="section" className="bg-background" >
      <div id="kits" className="relative isolate overflow-hidden gradient-banner">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 130% at 45% 30%, var(--pink) 0%, var(--pink) 48%, transparent 66%)",
          }}
        />
        <div className="relative mx-auto grid max-w-[1200px] items-end gap-6 px-4 pt-10 sm:px-6 lg:grid-cols-[0.85fr_1.2fr_1fr] lg:gap-4 lg:pt-6">
          <img
            src={bannerModel}
            alt="Consultora de beleza segurando produtos"
            loading="lazy"
            width={800}
            height={1024}
            className="mx-auto w-full max-w-[240px] self-end lg:max-w-none"
          />

          <div className="pb-10 text-center lg:pb-12 lg:text-left">
            <p className="text-lg text-primary-foreground sm:text-xl">Confira nossos</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-4xl">
              KITS EXCLUSIVOS
            </h2>
            <p className="text-lg text-primary-foreground sm:text-xl">
              com preços especiais!
            </p>
            <a
              href="#kits"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-6 py-2.5 text-sm font-medium text-pink transition-transform duration-300 hover:scale-105"
            >
              Quero meu kit! <Heart className="size-4 fill-pink" />
            </a>
          </div>

          <div className="relative flex items-end justify-center pb-6">
            <img
              src={bannerKit}
              alt="Necessaire rosa com kit de produtos"
              loading="lazy"
              width={912}
              height={768}
              className="w-full max-w-[300px] lg:max-w-none"
            />
            <div className="absolute top-0 right-0 grid size-20 place-items-center rounded-full bg-background text-center leading-none text-pink sm:size-24">
              <span>
                <span className="block text-[10px]">até</span>
                <span className="block text-xl font-extrabold sm:text-2xl">30%</span>
                <span className="block text-[10px]">OFF</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}