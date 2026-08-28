import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/perguntas-frequentes")({
  component: () => (
    <InstitutionalLayout title="Perguntas Frequentes">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Como funcionam os preços únicos?</AccordionTrigger>
          <AccordionContent>
            Todos os produtos da nossa loja são categorizados em três faixas de preço: R$10, R$15 ou
            R$20. Isso facilita suas compras e garante sempre o melhor custo-benefício.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Como finalizo minha compra?</AccordionTrigger>
          <AccordionContent>
            Ao adicionar os produtos ao carrinho e clicar em "Finalizar no WhatsApp", você será
            redirecionado para uma conversa conosco com a sua lista de produtos pronta para fechar o
            pedido.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Quais as formas de pagamento?</AccordionTrigger>
          <AccordionContent>
            Aceitamos PIX, cartões de crédito e débito. Os detalhes são combinados diretamente no
            WhatsApp durante a finalização.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </InstitutionalLayout>
  ),
});
