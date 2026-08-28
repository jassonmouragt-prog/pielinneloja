import { ArrowRight, Heart, ShoppingBag, Star, Loader2 } from "lucide-react";
import { Reveal } from "./Reveal";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductModal } from "./ProductModal";
import { useServerFn } from "@tanstack/react-start";
import { listPublicProducts } from "@/lib/queries.queries";
import { publicImageUrl } from "@/lib/storage/public-url";


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

function resolveProductImage(product: any): string | null {
  const images = product.product_images ?? product.productImages ?? [];
  const main = images.find((img: any) => img.is_main || img.isMain);
  const url = (main ?? images[0])?.url;
  if (!url) return null;
  return publicImageUrl(url);
}

export function Products({ products: initialProducts }: { products?: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const listPublicProductsFn = useServerFn(listPublicProducts);

  const { data: products, isLoading } = useQuery({
    queryKey: ['public-products'],
    queryFn: async () => {
      if (initialProducts) return initialProducts;
      return listPublicProductsFn({ data: { limit: 10 } });
    },
    enabled: !initialProducts
  });

  const displayProducts = (initialProducts || products) as any[];

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
          {isLoading && (
            <div className="col-span-full flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-pink" />
            </div>
          )}
          {displayProducts?.map?.((product: any, index: number) => {
            const imageUrl = resolveProductImage(product);
            return (
              <Reveal key={product.id} delay={index * 60}>
                <article
                  onClick={() => setSelectedProduct(product)}
                  className="group relative h-full overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                >
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Favoritar ${product.name}`}
                      className="absolute top-0 right-0 z-10 grid size-7 place-items-center rounded-full border border-border bg-white/80 text-pink transition-colors duration-300 hover:bg-blush"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="size-3.5" />
                    </button>
                    <div className="relative overflow-hidden bg-cream/30 p-2">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${product.name} ${product.subtitle || ''}`}
                          loading="lazy"
                          width={600}
                          height={600}
                          className="mx-auto h-32 w-auto object-contain transition-transform duration-500 group-hover:scale-105 sm:h-36"
                        />
                      ) : (
                        <div className="grid h-32 sm:h-36 place-items-center text-muted-foreground text-xs">
                          Sem imagem
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="text-[12px] sm:text-[13px] leading-snug font-medium text-foreground line-clamp-2 min-h-[3em]">
                      {product.name}
                      <br />
                      <span className="text-muted-foreground font-normal">{product.subtitle || ''}</span>
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Stars rating={4.5} />
                      <span className="text-[11px] text-muted-foreground">(120)</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        R$ {Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        no Pix
                      </span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
