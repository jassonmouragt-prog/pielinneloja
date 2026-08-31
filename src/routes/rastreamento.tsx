import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";
import { Search } from "lucide-react";

export const Route = createFileRoute("/rastreamento")({
  component: () => (
    <InstitutionalLayout title="Rastreamento">
      <p className="mb-8">
        Assim que seu pedido for postado, você receberá o código de rastreio diretamente pelo
        WhatsApp.
      </p>
      <div className="p-8 bg-cream/30 border border-dashed border-pink/30 rounded-2xl flex flex-col items-center text-center">
        <Search className="size-12 text-pink/40 mb-4" />
        <h3 className="font-semibold text-foreground mb-2">Ainda não recebeu seu código?</h3>
        <p className="text-sm max-w-[300px]">
          Lembre-se que o prazo para postagem é de até 48h após a confirmação do pagamento.
        </p>
        <a
          href="https://wa.me/5541985073920"
          target="_blank"
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-gold text-ink rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105"
        >
          Consultar status no WhatsApp
        </a>
      </div>
    </InstitutionalLayout>
  ),
});
