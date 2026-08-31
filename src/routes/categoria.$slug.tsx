import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Products } from "@/components/site/Products";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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

  useEffect(() => {
    window.scrollTo(0, 0);
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
          <Products products={categoryProducts as any} />
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
