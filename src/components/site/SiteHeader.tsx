import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-beige">
      <div className="mx-auto grid h-[80px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-6 px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-[60px]">
        {/* Logo — left */}
        <Link to="/" className="group flex flex-col items-start leading-none">
          <span className="inline-flex items-center gap-1.5 text-xl font-bold uppercase tracking-[0.35em] text-white">
            <span className="text-gold">✦</span>
            Pielinne
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.6em] text-gold">
            Semijoias
          </span>
        </Link>

        {/* Menu — center (desktop) */}
        <nav className="hidden items-center justify-center gap-10 lg:flex">
          <Link
            to="/categoria/colares"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-beige/90 transition-colors duration-300 hover:text-gold"
          >
            Coleções
          </Link>
          <Link
            to="/sobre-nos"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-beige/90 transition-colors duration-300 hover:text-gold"
          >
            Sobre
          </Link>
          <Link
            to="/fale-conosco"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-beige/90 transition-colors duration-300 hover:text-gold"
          >
            Contato
          </Link>
        </nav>

        {/* Actions — right */}
        <div className="flex items-center justify-end gap-5">
          <button
            aria-label="Buscar"
            className="hidden text-beige/80 transition-colors duration-300 hover:text-gold md:block"
          >
            <Search className="size-[18px] stroke-[1.5]" />
          </button>
          <a
            href="https://www.instagram.com/pielinne_semijoias/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hidden text-beige/80 transition-colors duration-300 hover:text-gold md:block"
          >
            <InstagramIcon />
          </a>
          <CartDrawer />

          <button
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(true)}
            className="text-beige/80 transition-colors duration-300 hover:text-gold lg:hidden"
          >
            <Menu className="size-5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-500 lg:hidden ${
          isMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[300px] bg-ink text-beige shadow-2xl transition-transform duration-500 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-white">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu"
              className="text-beige/70 hover:text-gold"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col py-4">
            <Link
              to="/categoria/colares"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] hover:text-gold"
            >
              Coleções
            </Link>
            <Link
              to="/sobre-nos"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] hover:text-gold"
            >
              Sobre
            </Link>
            <Link
              to="/fale-conosco"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] hover:text-gold"
            >
              Contato
            </Link>
            <Link
              to="/categoria/aneis"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold hover:text-gold-light"
            >
              Anéis
            </Link>
            <Link
              to="/categoria/pulseiras"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold hover:text-gold-light"
            >
              Pulseiras
            </Link>
            <Link
              to="/categoria/brincos"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold hover:text-gold-light"
            >
              Brincos
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
