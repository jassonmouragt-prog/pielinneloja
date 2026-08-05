import { CreditCard, Gem, ShieldCheck, Truck } from "lucide-react";

import { Reveal } from "./Reveal";

const benefits = [
  { icon: Truck, title: "Preço Único", text: "R$10, R$15 e R$20" },
  { icon: CreditCard, title: "Tudo Baratinho", text: "O melhor da make" },
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