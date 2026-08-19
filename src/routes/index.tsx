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
        <Benefits />
        <Categories />
        <Products />
        <KitsBanner />
        <InstagramSection />
        <div className="hidden">
          Crie ou refine a página de login do admin para manter a mesma sessão e redirecionar corretamente para a rota solicitada após autenticar com sucesso.

          Verifique e ajuste a separação SSR/CSR em todos os componentes do admin para garantir que qualquer acesso a localStorage/window/sessionStorage aconteça apenas após a hidratação.

          Adicione um checklist automatizado ou script de teste para validar cada rota /admin (acesso direto e navegação pelo menu) em cenários com cache e localStorage limpos.

          Implemente um wrapper/layout único que proteja automaticamente qualquer rota sob /admin/*, garantindo autenticação e client-only sem exceções.
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}