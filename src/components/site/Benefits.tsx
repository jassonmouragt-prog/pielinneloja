import { CreditCard, Gem, ShieldCheck, Truck } from "lucide-react";

import { Reveal } from "./Reveal";

const benefits = [
  { icon: Truck, title: "Frete Rápido", text: "Para todo o Brasil" },
  { icon: CreditCard, title: "Parcele em até 6x", text: "Sem juros no cartão" },
  { icon: ShieldCheck, title: "Compra Segura", text: "Seus dados protegidos" },
  { icon: Gem, title: "5% de Desconto", text: "Pagando no PIX" },
];

export function Benefits() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-8 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:py-9">
        {benefits.map((benefit, index) => (
          <Reveal
            key={benefit.title}
            delay={index * 70}
            className="flex items-center gap-3"
          >
            <benefit.icon className="size-6 shrink-0 stroke-[1.5] text-pink" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
              <p className="text-xs text-muted-foreground">{benefit.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}