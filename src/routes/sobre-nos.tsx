import { createFileRoute } from '@tanstack/react-router'
import { InstitutionalLayout } from '@/components/site/InstitutionalLayout'

export const Route = createFileRoute('/sobre-nos')({
  component: () => (
    <InstitutionalLayout title="Sobre nós">
      <p>
        Bem-vinda à <strong>Sua Lojinha Maakeup</strong>! Somos apaixonados por realçar a beleza que já existe em você.
      </p>
      <p>
        Nossa missão é democratizar o acesso a maquiagens e produtos de skincare de alta qualidade. Acreditamos que se sentir bonita não deve custar uma fortuna, por isso trabalhamos com o conceito inovador de <strong>Preço Único: R$10, R$15 e R$20</strong>.
      </p>
      <p>
        Selecionamos cuidadosamente cada item do nosso catálogo, garantindo que você receba sempre o melhor das marcas que ama. Da base perfeita ao kit completo, estamos aqui para acompanhar sua jornada de autocuidado.
      </p>
    </InstitutionalLayout>
  ),
})
