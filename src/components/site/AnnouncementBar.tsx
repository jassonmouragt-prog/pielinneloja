import { Gem, Sparkles, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: Gem, label: "SEMIJOIAS EXCLUSIVAS", sublabel: "peças selecionadas" },
  { icon: Sparkles, label: "QUALIDADE PREMIUM", sublabel: "banhado a ouro" },
  { icon: ShieldCheck, label: "COMPRA SEGURA", sublabel: "seus dados protegidos" },
  { icon: Truck, label: "ENTREGA RÁPIDA", sublabel: "para todo o Brasil" },
];

function Item({ icon: Icon, label, sublabel }: { icon: any; label: string; sublabel: string }) {
  return (
    <span className="flex items-center gap-1.5 px-8 font-semibold shrink-0">
      <Icon className="size-3.5 shrink-0 text-gold" />
      <span>{label}</span>
      <span className="font-normal text-beige/60">{sublabel}</span>
    </span>
  );
}

export function AnnouncementBar() {
  const doubled = [...items, ...items];

  return (
    <div className="relative bg-ink text-[11px] text-beige sm:text-xs overflow-hidden border-b border-beige/10">
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />
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
