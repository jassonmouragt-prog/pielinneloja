import { Heart, Menu, Search, ShoppingBag, Truck, User, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { CartDrawer } from "./CartDrawer";

import logo from "@/assets/logo.png";
import { navLinks } from "./data";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 150);
  };

  return (
    <header>
      {/* announcement bar */}
      <div className="bg-cream text-[11px] text-foreground/80 sm:text-xs">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 overflow-x-auto px-4 py-2.5 whitespace-nowrap sm:px-6">
          <span className="flex items-center gap-1.5 font-bold">
            <Truck className="size-3.5 shrink-0 text-pink" />
            PREÇO ÚNICO: R$10, R$15 e R$20
          </span>
        </div>
      </div>

      {/* main bar */}
      <div className="bg-background">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[200px_1fr_auto] lg:gap-8 lg:py-5">
          <a href="/" className="shrink-0">
            <img
              src={logo}
              alt="Sua Lojinha Maakeup"
              width={200}
              height={147}
              className="h-12 w-auto lg:h-[68px]"
            />
          </a>

          <div className="order-3 col-span-2 lg:order-none lg:col-span-1">
            <form
              className="flex h-11 items-stretch overflow-hidden rounded-full border border-border bg-background"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="site-search" className="sr-only">
                Buscar produtos
              </label>
              <input
                id="site-search"
                type="search"
                placeholder="O que você está procurando?"
                className="min-w-0 flex-1 bg-transparent px-5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="grid w-12 shrink-0 place-items-center gradient-pink text-primary-foreground transition-opacity duration-300 hover:opacity-90"
              >
                <Search className="size-4" />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-end gap-4 sm:gap-6">
            <a
              href="#favoritos"
              aria-label="Favoritos"
              className="text-pink transition-transform duration-300 hover:scale-110"
            >
              <Heart className="size-5 stroke-[1.5]" />
            </a>
            <CartDrawer />
          </div>
        </div>
      </div>

      {/* pink nav */}
      <nav className="gradient-nav text-primary-foreground relative overflow-visible">
        <div className="mx-auto flex max-w-[1200px] items-center px-4 py-3.5 text-[13px] font-medium sm:px-6">
          <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0 relative z-20"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="size-4" />
            Todas as categorias
            
            {/* Desktop Cascade Menu */}
            <div className={`hidden lg:flex absolute top-full left-0 pt-4 transition-all duration-300 origin-top-left ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              <div className="bg-white text-foreground shadow-xl rounded-lg overflow-hidden border border-border min-w-[220px]">
                {navLinks.map((link, index) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-pink/5 hover:text-pink transition-all duration-300"
                    style={{ 
                      animation: isMenuOpen ? `slideInRight 0.3s forwards ${index * 50}ms` : 'none',
                      opacity: 0 // Start hidden for animation
                    }}
                  >
                    {link}
                    <ChevronRight className="size-3.5 opacity-50" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-6 overflow-x-auto ml-6 whitespace-nowrap lg:gap-8 no-scrollbar">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="shrink-0 transition-opacity duration-300 hover:opacity-75"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Slide-in Menu */}
        <div className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
          <div 
            className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={`absolute top-0 right-0 h-full w-[280px] bg-white text-foreground shadow-2xl transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <span className="font-bold text-lg text-pink">Categorias</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-muted-foreground">Fechar</button>
            </div>
            <div className="py-2">
              {navLinks.map((link, index) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-pink/5 border-b border-border/50 last:border-0"
                  style={{ 
                    transitionDelay: `${index * 50}ms`,
                    transform: isMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                    opacity: isMenuOpen ? 1 : 0,
                    transition: 'all 0.3s ease-out'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-medium">{link}</span>
                  <ChevronRight className="size-4 text-pink" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

    </header>
  );
}