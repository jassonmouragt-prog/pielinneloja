import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Testimonial {
  name: string;
  city: string;
  rating: number;
  text: string;
  initials: string;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Mariana Silva",
    city: "Natal, RN",
    rating: 5,
    text: "Amei a base! Chegou super rápido e a cor ficou perfeita na minha pele. Já virei cliente fiel! 💕",
    initials: "MS",
    color: "from-pink-400 to-rose-500",
  },
  {
    name: "Juliana Costa",
    city: "Fortaleza, CE",
    rating: 5,
    text: "Preço justo e qualidade incrível. O batom dura o dia todo! Recomendo demais.",
    initials: "JC",
    color: "from-purple-400 to-fuchsia-500",
  },
  {
    name: "Beatriz Souza",
    city: "João Pessoa, PB",
    rating: 5,
    text: "Comprei um kit e veio tudo muito bem embalado. Atendimento nota 10 no WhatsApp!",
    initials: "BS",
    color: "from-amber-400 to-orange-500",
  },
  {
    name: "Camila Ferreira",
    city: "Recife, PE",
    rating: 5,
    text: "Os produtos são originais e o preço fixo me ajuda a comprar sem pesar no bolso. 🥰",
    initials: "CF",
    color: "from-emerald-400 to-teal-500",
  },
  {
    name: "Larissa Mendes",
    city: "Mossoró, RN",
    rating: 5,
    text: "Máscara de cílios maravilhosa! Não borra e deixa os cílios enormes. Comprei 2!",
    initials: "LM",
    color: "from-sky-400 to-blue-500",
  },
  {
    name: "Renata Lima",
    city: "Aracaju, SE",
    rating: 5,
    text: "Site super fácil de usar, encontrei tudo rapidinho. Entrega antes do prazo! ✨",
    initials: "RL",
    color: "from-fuchsia-400 to-pink-500",
  },
];

export function Testimonials() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(TESTIMONIALS.length / perPage);
  const visible = TESTIMONIALS.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              O que nossas clientes dizem 💬
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Mais de 5.000 clientes satisfeitas em todo o Brasil
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
              className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-pink hover:text-primary-foreground hover:border-pink"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => setPage((p) => (p + 1) % totalPages)}
              className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-pink hover:text-primary-foreground hover:border-pink"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {visible.map((t) => (
            <article
              key={t.name}
              className="relative rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-card"
            >
              <Quote className="absolute top-4 right-4 size-7 text-pink/15" />
              <div className="flex items-center gap-3">
                <div
                  className={`grid size-11 place-items-center rounded-full bg-gradient-to-br ${t.color} text-white font-bold text-sm shrink-0`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${
                      i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{t.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 flex sm:hidden items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
            className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-pink hover:text-primary-foreground hover:border-pink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs text-muted-foreground px-2">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => setPage((p) => (p + 1) % totalPages)}
            className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-pink hover:text-primary-foreground hover:border-pink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
