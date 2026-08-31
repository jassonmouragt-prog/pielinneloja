import { createFileRoute } from "@tanstack/react-router";
import { InstitutionalLayout } from "@/components/site/InstitutionalLayout";

export const Route = createFileRoute("/sobre-nos")({
  component: () => (
    <InstitutionalLayout title="Sobre nós">
      <p>
        Bem-vinda à <strong>Pielinne Semijoias</strong>! Somos apaixonados por criar peças que
        realçam a beleza e a elegância de cada momento.
      </p>
      <p>
        Nossa missão é democratizar o acesso a semijoias de alta qualidade. Acreditamos que se
        sentir especial não deve ser um luxo distante, por isso selecionamos cuidadosamente cada
        peça do nosso catálogo, garantindo brilho, durabilidade e sofisticação.
      </p>
      <p>
        Dos anéis aos conjuntos completos, cada item é pensado para acompanhar você — do dia a dia
        aos momentos inesquecíveis.
      </p>
    </InstitutionalLayout>
  ),
});
