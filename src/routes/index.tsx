import { createFileRoute } from "@tanstack/react-router";

import { Categories } from "@/components/site/Categories";
import { Hero } from "@/components/site/Hero";
import { InstagramSection } from "@/components/site/InstagramSection";
import { KitsBanner } from "@/components/site/KitsBanner";
import { Products } from "@/components/site/Products";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Testimonials } from "@/components/site/Testimonials";

const title = "Pielinne Semijoias | Loja Oficial";
const description =
  "Semijoias elegantes: anéis, colares, brincos, pulseiras e conjuntos. Frete para todo o Brasil.";

export const Route = createFileRoute("/")({
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
    </div>
  );
}
