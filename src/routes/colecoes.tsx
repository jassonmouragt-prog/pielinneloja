import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Products } from "@/components/site/Products";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trophy } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getAllTopSellingProducts } from "@/lib/ranking.queries";

export const Route = createFileRoute("/colecoes")({
  head: () => {
    const title = "Coleções Mais Vendidas | Pielinne Semijoias";
    const description =
      "Confira nossas coleções mais vendidas da Pielinne Semijoias. Peças que nossas clientes mais amam.";

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
  component: ColecoesPage,
});

function ColecoesPage() {
  const getTopFn = useServerFn(getAllTopSellingProducts);

  const { data: topProducts, isLoading } = useQuery({
    queryKey: ["all-top-selling"],
    queryFn: () => getTopFn(),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="size-8 text-gold" />
            <h1 className="text-4xl font-bold text-foreground">Coleções Mais Vendidas</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            As peças que nossas clientes mais amam. Descubra o que está em alta.
          </p>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full mt-6" />
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (topProducts as any[])?.length > 0 ? (
          <Products products={topProducts as any} hideHeader={true} />
        ) : (
          <div className="text-center py-20 bg-cream/30 rounded-2xl border border-dashed border-gold/20">
            <Trophy className="size-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">
              Ainda não temos vendas registradas para exibir as coleções mais vendidas.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Volte em breve para conferir nossos destaques!
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
