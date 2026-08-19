import { createFileRoute } from '@tanstack/react-router'
import { InstitutionalLayout } from '@/components/site/InstitutionalLayout'

export const Route = createFileRoute('/cancelamentos')({
  component: () => (
    <InstitutionalLayout title="Cancelamentos">
      <p>
        Precisa cancelar seu pedido? Entenda as regras:
      </p>
      <h2 className="text-xl font-semibold text-foreground mt-8">Antes do Envio</h2>
      <p>
        Você pode solicitar o cancelamento total e reembolso imediato a qualquer momento antes da postagem do produto.
      </p>
      <h2 className="text-xl font-semibold text-foreground mt-8">Após o Envio</h2>
      <p>
        Caso o produto já tenha sido enviado, você deve aguardar o recebimento e solicitar a devolução por arrependimento em até 7 dias, conforme o Código de Defesa do Consumidor.
      </p>
    </InstitutionalLayout>
  ),
})
