import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Reveal } from "./Reveal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProductModal } from "./ProductModal";
import { useServerFn } from "@tanstack/react-start";
import { listPublicProducts } from "@/lib/queries.queries";
import { publicImageUrl } from "@/lib/storage/public-url";
import { Link } from "@tanstack/react-router";

function resolveProductImage(product: any): string | null {
  const images = product.product_images ?? product.productImages ?? [];
  const main = images.find((img: any) => img.is_main || img.isMain);
  const url = (main ?? images[0])?.url;
  if (!url) return null;
  return publicImageUrl(url);
}

export function Products({
  products: initialProducts,
  hideHeader = false,
}: {
  products?: any[];
  hideHeader?: boolean;
}) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const listPublicProductsFn = useServerFn(listPublicProducts);

  const { data: products, isLoading } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      if (initialProducts) return initialProducts;
      return listPublicProductsFn({ data: { limit: 6 } });
    },
    enabled: !initialProducts,
  });

  const displayProducts = (initialProducts || products) as any[];

  return (
    <section id="produtos" className="bg-[oklch(0.985_0.008_84)]">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-[60px] lg:py-28">
        {!hideHeader && (
          <Reveal className="mb-14 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-deep">
                <span className="inline-block h-px w-10 bg-gold-deep" />
                Destaques
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
                Nossas peças mais amadas
              </h2>
            </div>
            <Link
              to="/categoria/colares"
              className="hidden shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep transition-colors duration-300 hover:text-ink sm:flex"
            >
              Ver todas <ArrowRight className="size-3.5" />
            </Link>
          </Reveal>
        )}

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3">
          {isLoading && (
            <div className="col-span-full flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          )}
          {displayProducts?.map?.((product: any, index: number) => {
            const imageUrl = resolveProductImage(product);
            return (
              <Reveal key={product.id} delay={index * 60}>
                <article
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-beige-light">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        width={600}
                        height={600}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                        Em breve
                      </div>
                    )}
                    <div className="absolute inset-0 grid place-items-center bg-ink/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 border border-gold bg-gold px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink">
                        <ShoppingBag className="size-3.5" />
                        Ver peça
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-5 text-[13px] font-medium uppercase tracking-[0.12em] text-ink">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 text-sm font-normal text-ink/60">
                    R$ {Number(product.price).toFixed(2)}
                  </p>
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
