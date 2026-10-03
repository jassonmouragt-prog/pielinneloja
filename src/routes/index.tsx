import { createFileRoute } from "@tanstack/react-router";

import { Categories } from "@/components/site/Categories";
import { Hero } from "@/components/site/Hero";
import { InstagramSection } from "@/components/site/InstagramSection";
import { KitsBanner } from "@/components/site/KitsBanner";
import { Products } from "@/components/site/Products";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Testimonials } from "@/components/site/Testimonials";
import { ProductModal } from "@/components/site/ProductModal";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicProducts } from "@/lib/queries.queries";
import { z } from "zod";

const title = "Pielinne Semijoias | Loja Oficial";
const description =
  "Semijoias elegantes: anéis, colares, brincos, pulseiras e conjuntos. Frete para todo o Brasil.";

export const Route = createFileRoute("/")({
  validateSearch: (search): { produto?: string } => {
    const produto = z.string().uuid().optional().catch(undefined).parse(search["produto"]);
    return produto ? { produto } : {};
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { produto } = Route.useSearch();
  const navigate = Route.useNavigate();
  const listProducts = useServerFn(listPublicProducts);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["linked-product", produto],
    queryFn: () => listProducts({ data: { productId: produto! } }),
    enabled: !!produto,
  });
  const closeProduct = () => void navigate({ search: {}, replace: true });
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <Categories />
        <Products />
        <KitsBanner />
        <Testimonials />
        <InstagramSection />
      </main>
      <SiteFooter />
      {produto && !data?.[0] && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
        >
          <p className="text-sm text-ink">
            {isPending
              ? "Carregando peça..."
              : isError
                ? "Não foi possível carregar a peça."
                : "Esta peça não está disponível."}
          </p>
          {isError && (
            <button
              type="button"
              onClick={() => void refetch()}
              className="min-h-10 text-sm text-silver-deep underline"
            >
              Tentar novamente
            </button>
          )}
          {!isPending && (
            <button
              type="button"
              onClick={closeProduct}
              className="ml-3 min-h-10 text-sm text-silver-deep underline"
            >
              Fechar
            </button>
          )}
        </div>
      )}
      <ProductModal
        product={data?.[0] ?? null}
        isOpen={!!produto && !!data?.[0]}
        onClose={closeProduct}
      />
    </div>
  );
}
