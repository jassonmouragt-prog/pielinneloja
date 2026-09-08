import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  city: string;
  text: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ana Paula",
    city: "Foz do Iguaçu, PR",
    text: "As peças são lindas e de ótima qualidade. Chegou tudo perfeito e antes do prazo. Já comprei de novo!",
  },
  {
    name: "Camila Rocha",
    city: "Curitiba, PR",
    text: "Comprei um conjunto de anéis e a entrega foi super rápida. Atendimento excelente pelo WhatsApp.",
  },
  {
    name: "Fernanda Lima",
    city: "Cascavel, PR",
    text: "Semijoias maravilhosas, parecem ouro de verdade. Todo mundo pergunta onde comprei. Recomendo!",
  },
];

export function Testimonials() {
  return (
    <section className="bg-gradient-hero">
      <div className="mx-auto max-w-[1400px] px-6 py-20 lg:px-[60px] lg:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-silver-deep">
            <span className="inline-block h-px w-10 bg-silver-deep" />
            Depoimentos
            <span className="inline-block h-px w-10 bg-silver-deep" />
          </p>
          <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Quem usa, recomenda
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-gray-200">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="flex flex-col items-center px-4 text-center md:px-8">
              <div className="mb-6 flex items-center justify-center gap-1">
                <Star className="size-5 fill-silver-deep text-silver-deep" strokeWidth={1} />
                <Star className="size-5 fill-silver-deep text-silver-deep" strokeWidth={1} />
                <Star className="size-5 fill-silver-deep text-silver-deep" strokeWidth={1} />
                <Star className="size-5 fill-silver-deep text-silver-deep" strokeWidth={1} />
                <Star className="size-5 fill-silver-deep text-silver-deep" strokeWidth={1} />
              </div>
              <p className="font-serif text-lg italic leading-relaxed text-ink/85">"{t.text}"</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-silver-deep">
                — {t.name}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-ink/40">{t.city}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}