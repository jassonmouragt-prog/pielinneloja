import { Heart, Instagram, Music2, Send } from "lucide-react";

import logo from "@/assets/logo.png";
import { footerColumns } from "./data";

export function SiteFooter() {
  return (
    <footer className="bg-cream">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] lg:gap-8">
        <div>
          <img
            src={logo}
            alt="Sua Lojinha Maakeup"
            loading="lazy"
            width={200}
            height={147}
            className="h-16 w-auto"
          />
          <p className="mt-4 flex max-w-[210px] flex-wrap items-center gap-1 text-xs leading-relaxed text-muted-foreground">
            Sua loja de maquiagem e beleza favorita!
            <Heart className="size-3 shrink-0 fill-pink text-pink" />
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Send, Music2, Instagram].map((Icon, index) => (
              <a
                key={index}
                href="https://www.instagram.com/sualojinhamakeup/"
                target="_blank"
                rel="noreferrer"
                aria-label="Redes sociais"
                className="grid size-8 place-items-center rounded-lg gradient-pink text-primary-foreground transition-transform duration-300 hover:scale-110"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-xs text-muted-foreground transition-colors duration-300 hover:text-pink"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-sm font-semibold text-foreground">Newsletter</h3>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Receba novidades e promoções exclusivas!
          </p>
          <form
            className="mt-4 flex h-10 items-stretch overflow-hidden rounded-md border border-border bg-background"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="newsletter" className="sr-only">
              Seu melhor e-mail
            </label>
            <input
              id="newsletter"
              type="email"
              placeholder="Seu melhor e-mail"
              className="min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Assinar newsletter"
              className="grid w-10 shrink-0 place-items-center gradient-pink text-primary-foreground transition-opacity duration-300 hover:opacity-90"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      </div>

      <div className="gradient-nav py-3 text-center text-[11px] text-primary-foreground">
        © 2026 Sua Lojinha Maakeup. Todos os direitos reservados.
      </div>
    </footer>
  );
}