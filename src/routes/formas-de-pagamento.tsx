import { createFileRoute } from '@tanstack/react-router'
import { InstitutionalLayout } from '@/components/site/InstitutionalLayout'

export const Route = createFileRoute('/formas-de-pagamento')({
  component: () => (
    <InstitutionalLayout title="Formas de Pagamento">
      <p>
        Para sua comodidade, oferecemos diversas opções de pagamento que são finalizadas diretamente via WhatsApp:
      </p>
      <ul className="space-y-4 list-disc pl-4 mt-6">
        <li>
          <strong className="text-foreground">PIX:</strong> A forma mais rápida e prática, com aprovação imediata.
        </li>
        <li>
          <strong className="text-foreground">Cartão de Crédito:</strong> Parcelamos suas compras (consulte condições no atendimento).
        </li>
        <li>
          <strong className="text-foreground">Cartão de Débito:</strong> Para pagamentos à vista.
        </li>
      </ul>
    </InstitutionalLayout>
  ),
})
