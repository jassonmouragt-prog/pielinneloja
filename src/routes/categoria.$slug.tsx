import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Products } from "@/components/site/Products";
import { useQuery } from "@tanstack/react-query";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listCategories, listPublicProducts } from "@/lib/queries.queries";

export const Route = createFileRoute("/categoria/$slug")({
  params: {
    parse: (params) => ({
      slug: z.string().parse(params.slug),
    }),
  },
  head: ({ params }) => {
    const slug = params.slug;
    const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
    const title = `${name} | Pielinne Semijoias`;
    const description = `Confira nossa seleção de ${name} na Pielinne Semijoias. Peças elegantes e de alta qualidade.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const listCategoriesFn = useServerFn(listCategories);
  const listProductsFn = useServerFn(listPublicProducts);
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const { data: categoryData } = useQuery({
    queryKey: ["category-info", slug],
    queryFn: async () => {
      const cats = await listCategoriesFn();
      return cats?.find(
        (c: any) =>
          c.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-") === slug,
      );
    },
  });

  const categoryName =
    categoryData?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  const { data: categoryProducts, isLoading } = useQuery({
    queryKey: ["category-products", slug],
    queryFn: async () => {
      const cats = await listCategoriesFn();
      const catData = cats?.find(
        (c: any) =>
          c.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-") === slug,
      );
      if (!catData) return [];
      return listProductsFn({ data: { categoryId: catData.id } });
    },
  });

  const filteredProducts = useMemo(() => {
    const all = (categoryProducts as any[]) || [];
    if (maxPrice === "" || maxPrice <= 0) return all;
    return all.filter((p) => Number(p.price) <= maxPrice);
  }, [categoryProducts, maxPrice]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    setMaxPrice("");
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">{categoryName}</h1>
          <div className="h-1 w-20 bg-pink mx-auto rounded-full" />
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-pink" />
          </div>
        ) : (categoryProducts as any[])?.length > 0 ? (
          <>
            <div className="mb-8 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-5 py-3 shadow-sm">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filtrar por preço:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Até</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      R$
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      placeholder="Todas"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMaxPrice(val === "" ? "" : Number(val));
                      }}
                      className="h-9 w-28 rounded-lg border border-input bg-background pl-10 pr-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>
                </div>
                {maxPrice !== "" && maxPrice > 0 && (
                  <button
                    onClick={() => setMaxPrice("")}
                    className="ml-1 text-xs font-medium text-gold-deep hover:text-ink transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <Products products={filteredProducts} hideHeader={true} />
            ) : (
              <div className="text-center py-20 bg-cream/30 rounded-2xl border border-dashed border-pink/20">
                <p className="text-muted-foreground text-lg">
                  Nenhum produto encontrado até R$ {maxPrice.toFixed(2)} nesta categoria.
                </p>
                <button
                  onClick={() => setMaxPrice("")}
                  className="mt-4 text-sm font-medium text-gold-deep hover:text-ink transition-colors"
                >
                  Limpar filtro
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-cream/30 rounded-2xl border border-dashed border-pink/20">
            <p className="text-muted-foreground text-lg">
              Nenhum produto encontrado nesta categoria no momento.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
