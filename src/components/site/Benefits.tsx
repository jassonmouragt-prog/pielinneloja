import { Gem, ShieldCheck, Truck } from "lucide-react";

import { Reveal } from "./Reveal";

const benefits = [
  { icon: Gem, title: "Semijoias Premium", text: "Banhado a ouro, qualidade superior" },
  { icon: Truck, title: "Entrega Rápida", text: "Para todo o Brasil" },
  { icon: ShieldCheck, title: "Compra Segura", text: "Seus dados protegidos" },
];

export function Benefits() {
  return (
    <section className="bg-background">
      <div className="mx-auto flex max-w-[1400px] flex-wrap justify-center gap-x-16 gap-y-8 px-6 py-8 lg:px-[60px] lg:py-10">
        {benefits.map((benefit, index) => (
          <Reveal key={benefit.title} delay={index * 70} className="flex items-center gap-3">
            <benefit.icon className="size-6 shrink-0 stroke-[1.2] text-gold-deep" />
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
