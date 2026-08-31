import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";

export const Route = createFileRoute("/politica-de-privacidade")({
  component: () => (
    <InstitutionalLayout title="Política de Privacidade">
      <p>
        Na Pielinne Semijoias, a sua privacidade é uma prioridade. Esta política descreve como
        coletamos e protegemos suas informações.
      </p>
      <h2 className="text-xl font-semibold text-foreground mt-8">Coleta de Dados</h2>
      <p>
        Coletamos apenas as informações necessárias para processar seus pedidos via WhatsApp e
        melhorar sua experiência no site, como nome e contatos fornecidos voluntariamente.
      </p>
      <h2 className="text-xl font-semibold text-foreground mt-8">Segurança</h2>
      <p>
        Utilizamos tecnologias de ponta para garantir que seus dados estejam seguros e nunca
        compartilhamos suas informações com terceiros sem o seu consentimento.
      </p>
    </InstitutionalLayout>
  ),
});
