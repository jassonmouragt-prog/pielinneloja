import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-beige">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10 lg:px-[60px] lg:py-20">
        {/* Col 1 — logo + social */}
        <div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold uppercase tracking-[0.35em] text-white">
              ✦ Pielinne
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.6em] text-gold">
              Semijoias
            </span>
          </div>
          <p className="mt-6 max-w-[240px] font-serif text-sm italic leading-relaxed text-beige/60">
            Semijoias elegantes para todos os momentos da sua vida.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.instagram.com/pielinne_semijoias/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid size-9 place-items-center rounded-full border border-gold/40 text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://www.facebook.com/pielinne_semijoias/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid size-9 place-items-center rounded-full border border-gold/40 text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://wa.me/5541985073920"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-9 place-items-center rounded-full border border-gold/40 text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              <Phone className="size-4" />
            </a>
          </div>
        </div>

        {/* Col 2 — Coleções */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Coleções</h3>
          <ul className="mt-6 space-y-3">
            {["Anéis", "Colares", "Brincos", "Pulseiras", "Conjuntos"].map((link) => (
              <li key={link}>
                <Link
                  to="/categoria/$slug"
                  params={{
                    slug: link
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/\s+/g, "-"),
                  }}
                  className="text-xs text-beige/70 transition-colors duration-300 hover:text-gold"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Pielinne */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Pielinne</h3>
          <ul className="mt-6 space-y-3">
            {[
              { label: "Sobre nós", to: "/sobre-nos" },
              { label: "Como comprar", to: "/como-comprar" },
              { label: "Trocas e devoluções", to: "/trocas-e-devolucoes" },
              { label: "Política de privacidade", to: "/politica-de-privacidade" },
              { label: "Perguntas frequentes", to: "/perguntas-frequentes" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to as any}
                  className="text-xs text-beige/70 transition-colors duration-300 hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contato */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Contato</h3>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-3 text-xs text-beige/70">
              <Phone className="size-3.5 shrink-0 text-gold" />
              <a
                href="https://wa.me/5541985073920"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-300 hover:text-gold"
              >
                (41) 98507-3920
              </a>
            </li>
            <li className="flex items-center gap-3 text-xs text-beige/70">
              <Mail className="size-3.5 shrink-0 text-gold" />
              <a
                href="mailto:contato@pielinne.com"
                className="transition-colors duration-300 hover:text-gold"
              >
                contato@pielinne.com
              </a>
            </li>
            <li className="flex items-start gap-3 text-xs text-beige/70">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-gold" />
              <span>
                Foz do Iguaçu &amp; Curitiba, PR
                <br />
                Brasil
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-beige/10 py-5 text-center text-[11px] uppercase tracking-[0.2em] text-beige/40">
        © 2026 Pielinne Semijoias. Todos os direitos reservados.
      </div>
    </footer>
  );
}
