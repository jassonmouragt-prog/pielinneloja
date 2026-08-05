import { ArrowRight, Heart, ShoppingBag, Star } from "lucide-react";

import { products } from "./data";
import { Reveal } from "./Reveal";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3 ${
            star <= Math.round(rating)
              ? "fill-pink-light text-pink-light"
              : "fill-blush text-blush"
          }`}
        />
      ))}
    </span>
  );
}

export function Products() {
  return (
    <section id="mais-vendidos" className="bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Mais vendidos</h2>
          <a
            href="#produtos"
            className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground transition-colors duration-300 hover:text-pink"
          >
            Ver todos <ArrowRight className="size-3.5" />
          </a>
        </Reveal>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {products.map((product, index) => (
            <Reveal key={product.name} delay={index * 60}>
              <article className="group h-full overflow-hidden rounded-xl border border-border bg-card p-3 transition-shadow duration-300 hover:shadow-card">
                <div className="relative">
                  <button
                    type="button"
                    aria-label={`Favoritar ${product.name}`}
                    className="absolute top-0 right-0 grid size-7 place-items-center rounded-full border border-border text-pink transition-colors duration-300 hover:bg-blush"
                  >
                    <Heart className="size-3.5" />
                  </button>
                  <img
                    src={product.image}
                    alt={`${product.name} ${product.subtitle}`}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="mx-auto h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-36"
                  />
                </div>
                <h3 className="mt-4 text-[13px] leading-snug font-medium text-foreground">
                  {product.name}
                  <br />
                  {product.subtitle}
                </h3>
                <div className="mt-2 flex items-center gap-1.5">
                  <Stars rating={product.rating} />
                  <span className="text-[11px] text-muted-foreground">({product.reviews})</span>
                </div>
                <p className="mt-2 text-sm font-bold text-foreground">{product.price}</p>
                <button
                  type="button"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-md gradient-pink px-3 py-2 text-[11px] font-semibold text-primary-foreground transition-opacity duration-300 hover:opacity-90"
                >
                  <ShoppingBag className="size-3.5" />
                  Adicionar ao carrinho
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}