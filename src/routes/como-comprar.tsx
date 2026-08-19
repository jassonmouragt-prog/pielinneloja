import { createFileRoute } from '@tanstack/react-router'
import { InstitutionalLayout } from '@/components/site/InstitutionalLayout'

export const Route = createFileRoute('/como-comprar')({
  component: () => (
    <InstitutionalLayout title="Como Comprar">
      <ol className="space-y-6 list-decimal pl-4">
        <li>
          <strong className="text-foreground">Navegue:</strong> Explore nossas categorias e escolha seus produtos favoritos de R$10, R$15 ou R$20.
        </li>
        <li>
          <strong className="text-foreground">Carrinho:</strong> Adicione os itens desejados ao carrinho de compras.
        </li>
        <li>
          <strong className="text-foreground">WhatsApp:</strong> Clique em "Finalizar no WhatsApp". Você será enviado para o nosso atendimento com a lista de itens.
        </li>
        <li>
          <strong className="text-foreground">Conclusão:</strong> No WhatsApp, combinamos o frete e a forma de pagamento para enviar seu pedido!
        </li>
      </ol>
    </InstitutionalLayout>
  ),
})
