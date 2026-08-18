import { createFileRoute } from "@tanstack/react-router";

import { Benefits } from "@/components/site/Benefits";
import { Categories } from "@/components/site/Categories";
import { Hero } from "@/components/site/Hero";
import { InstagramSection } from "@/components/site/InstagramSection";
import { KitsBanner } from "@/components/site/KitsBanner";
import { Products } from "@/components/site/Products";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const title = "Sua Lojinha Maakeup | Maquiagem e Beleza com Preço que Você Ama";
const description =
  "Loja de maquiagem, skincare, cabelos e kits de beleza. Frete para todo o Brasil e parcele em até 6x.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <Benefits />
        <Categories />
        <Products />
        <KitsBanner />
        <InstagramSection />
      </main>
      <SiteFooter />
    </div>
  );
}
