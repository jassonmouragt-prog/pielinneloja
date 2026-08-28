import { Truck, CreditCard, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, label: "PREÇO FIXO", sublabel: "R$10, R$15 e R$20" },
  { icon: Sparkles, label: "TUDO BARATINHO", sublabel: "O melhor da make" },
  { icon: ShieldCheck, label: "COMPRA SEGURA", sublabel: "Seus dados protegidos" },
  { icon: CreditCard, label: "PAGUE NO PIX", sublabel: "Aprovação imediata" },
  { icon: Truck, label: "ENTREGA RÁPIDA", sublabel: "Para todo o Brasil" },
];

function Item({ icon: Icon, label, sublabel }: { icon: any; label: string; sublabel: string }) {
  return (
    <span className="flex items-center gap-1.5 px-6 font-bold shrink-0">
      <Icon className="size-3.5 shrink-0 text-pink" />
      <span>{label}:</span>
      <span className="font-normal text-foreground/70">{sublabel}</span>
    </span>
  );
}

export function AnnouncementBar() {
  const doubled = [...items, ...items];

  return (
    <div className="bg-cream text-[11px] text-foreground/80 sm:text-xs overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />
      <div
        className="flex whitespace-nowrap py-2.5 marquee-track"
        style={{ animationDuration: "30s" }}
      >
        {doubled.map((item, i) => (
          <Item key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
