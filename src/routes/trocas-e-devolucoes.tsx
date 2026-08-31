import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";

export const Route = createFileRoute("/trocas-e-devolucoes")({
  component: () => (
    <InstitutionalLayout title="Trocas e Devoluções">
      <p>Queremos que você ame suas compras! Caso precise trocar algo, siga nossas orientações:</p>
      <h2 className="text-xl font-semibold text-foreground mt-8">Prazos</h2>
      <p>
        Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução de um
        produto, desde que ele esteja em sua embalagem original e sem sinais de uso.
      </p>
      <h2 className="text-xl font-semibold text-foreground mt-8">Como solicitar</h2>
      <p>
        Entre em contato conosco pelo WhatsApp (5541985073920) com o número do seu pedido e o motivo
        da troca. Nossa equipe orientará sobre os próximos passos.
      </p>
    </InstitutionalLayout>
  ),
});
