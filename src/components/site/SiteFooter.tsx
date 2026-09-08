import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10 lg:px-[60px] lg:py-20">
        {/* Col 1 — logo + social */}
        <div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold uppercase tracking-[0.35em] text-ink">
              ✦ Pielinne
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.6em] text-silver-deep">
              Semijoias
            </span>
          </div>
          <p className="mt-6 max-w-[240px] font-serif text-sm italic leading-relaxed text-ink/50">
            Semijoias elegantes para todos os momentos da sua vida.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.instagram.com/pielinne_semijoias/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid size-10 place-items-center rounded-full bg-gray-100 text-ink/60 transition-all duration-300 hover:bg-silver-deep hover:text-white"
            >
              <Instagram className="size-4.5" />
            </a>
            <a
              href="https://www.facebook.com/pielinne_semijoias/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid size-10 place-items-center rounded-full bg-gray-100 text-ink/60 transition-all duration-300 hover:bg-silver-deep hover:text-white"
            >
              <Facebook className="size-4.5" />
            </a>
            <a
              href="https://wa.me/5541985073920"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-10 place-items-center rounded-full bg-gray-100 text-ink/60 transition-all duration-300 hover:bg-silver-deep hover:text-white"
            >
              <Phone className="size-4.5" />
            </a>
          </div>
        </div>

        {/* Col 2 — Coleções */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-silver-deep">Coleções</h3>
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
                  className="text-xs text-ink/60 transition-colors duration-300 hover:text-silver-deep"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Pielinne */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-silver-deep">Pielinne</h3>
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
                  className="text-xs text-ink/60 transition-colors duration-300 hover:text-silver-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — Contato */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-silver-deep">Contato</h3>
          <ul className="mt-6 space-y-4">
            <li className="flex items-center gap-3 text-xs text-ink/60">
              <Phone className="size-3.5 shrink-0 text-silver-deep" />
              <a
                href="https://wa.me/5541985073920"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-300 hover:text-silver-deep"
              >
                (41) 98507-3920
              </a>
            </li>
            <li className="flex items-center gap-3 text-xs text-ink/60">
              <Mail className="size-3.5 shrink-0 text-silver-deep" />
              <a
                href="mailto:contato@pielinne.com"
                className="transition-colors duration-300 hover:text-silver-deep"
              >
                contato@pielinne.com
              </a>
            </li>
            <li className="flex items-start gap-3 text-xs text-ink/60">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-silver-deep" />
              <span>
                Foz do Iguaçu & Curitiba, PR
                <br />
                Brasil
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-5 text-center text-[11px] uppercase tracking-[0.2em] text-ink/40">
        © 2026 Pielinne Semijoias. Todos os direitos reservados.
      </div>
    </footer>
  );
}