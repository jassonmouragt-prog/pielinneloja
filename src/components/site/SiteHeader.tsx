import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";
import gsap from "gsap";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const logoUrl = "/logo-preta.png";
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      if (scrolled !== isScrolled) {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        const base = isDesktop ? 80 : 64;
        const collapsed = isDesktop ? 56 : 52;
        setIsScrolled(scrolled);
        gsap.to(header, {
          height: scrolled ? collapsed : base,
          duration: 0.6,
          ease: "elastic.out(1, 0.75)",
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isScrolled]);

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
      <div
        ref={headerRef}
        className={`mx-auto grid h-16 lg:h-[80px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-[60px] rounded-2xl transition-[backdrop-filter,background,box-shadow] duration-500 ${
          isScrolled
            ? "bg-white/40 backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/30"
            : "bg-white/60 backdrop-blur-xl shadow-glass border border-white/20"
        }`}
      >
        {/* Logo — left */}
        <Link to="/" className="group flex items-center leading-none">
          <img
            src={logoUrl}
            alt="Pielinne Semijoias"
            className="h-8 w-auto object-contain lg:h-9"
            loading="eager"
          />
        </Link>

        {/* Menu — center (desktop) */}
        <nav className="hidden items-center justify-center gap-10 lg:flex">
          <Link
            to="/colecoes"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/70 transition-colors duration-300 hover:text-silver-deep"
          >
            Coleções
          </Link>
          <Link
            to="/sobre-nos"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/70 transition-colors duration-300 hover:text-silver-deep"
          >
            Sobre
          </Link>
          <Link
            to="/fale-conosco"
            className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/70 transition-colors duration-300 hover:text-silver-deep"
          >
            Contato
          </Link>
        </nav>

        {/* Actions — right */}
        <div className="flex items-center justify-end gap-5">
          <button
            aria-label="Buscar"
            className="hidden text-ink/60 transition-colors duration-300 hover:text-silver-deep md:block"
          >
            <Search className="size-[18px] stroke-[1.5]" />
          </button>
          <a
            href="https://www.instagram.com/pielinne_semijoias/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hidden text-ink/60 transition-colors duration-300 hover:text-silver-deep md:block"
          >
            <InstagramIcon />
          </a>
          <CartDrawer />

          <button
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(true)}
            className="text-ink/60 transition-colors duration-300 hover:text-silver-deep lg:hidden"
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
          className={`absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity duration-500 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[300px] glass-strong shadow-glass transition-transform duration-500 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/20 px-6 py-5">
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-ink">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu"
              className="text-ink/60 hover:text-silver-deep"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col py-4">
            <Link
              to="/colecoes"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-ink/70 hover:text-silver-deep"
            >
              Coleções
            </Link>
            <Link
              to="/sobre-nos"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-ink/70 hover:text-silver-deep"
            >
              Sobre
            </Link>
            <Link
              to="/fale-conosco"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-ink/70 hover:text-silver-deep"
            >
              Contato
            </Link>
            <Link
              to="/categoria/aneis"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-silver-deep hover:text-silver"
            >
              Anéis
            </Link>
            <Link
              to="/categoria/pulseiras"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-silver-deep hover:text-silver"
            >
              Pulseiras
            </Link>
            <Link
              to="/categoria/brincos"
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-white/15 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-silver-deep hover:text-silver"
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