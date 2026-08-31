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
          <AccordionTrigger>Como escolho minha semijoia?</AccordionTrigger>
          <AccordionContent>
            Navegue pelas categorias (anéis, colares, brincos, pulseiras e conjuntos) e escolha a
            peça que combina com o seu estilo. Cada produto tem descrição detalhada e fotos de
            qualidade para facilitar a sua escolha.
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
