import { Heart, Menu, Search, ShoppingBag, Truck, User } from "lucide-react";

import logo from "@/assets/logo.png";
import { navLinks } from "./data";

export function SiteHeader() {
  return (
    <header>
      {/* announcement bar */}
      <div className="bg-cream text-[11px] text-foreground/80 sm:text-xs">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 overflow-x-auto px-4 py-2.5 whitespace-nowrap sm:px-6">
          <span className="flex items-center gap-1.5">
            <Truck className="size-3.5 shrink-0 text-pink" />
            Enviamos para todo o Brasil
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <ShoppingBag className="size-3.5 shrink-0 text-pink" />
            Frete grátis acima de R$199
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="size-3.5 shrink-0 text-pink" />
            5% OFF no PIX
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
              href="#login"
              className="flex items-center gap-2 text-xs leading-tight text-foreground/80 transition-colors duration-300 hover:text-pink"
            >
              <User className="size-5 shrink-0 stroke-[1.5]" />
              <span className="hidden sm:block">
                Entrar
                <br />
                <span className="text-muted-foreground">ou cadastrar</span>
              </span>
            </a>
            <a
              href="#favoritos"
              aria-label="Favoritos"
              className="text-pink transition-transform duration-300 hover:scale-110"
            >
              <Heart className="size-5 stroke-[1.5]" />
            </a>
            <a
              href="#carrinho"
              aria-label="Carrinho"
              className="relative text-foreground/80 transition-transform duration-300 hover:scale-110"
            >
              <ShoppingBag className="size-5 stroke-[1.5]" />
              <span className="absolute -top-2 -right-2 grid size-4 place-items-center rounded-full bg-pink text-[10px] font-bold text-primary-foreground">
                0
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* pink nav */}
      <nav className="gradient-nav text-primary-foreground">
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 overflow-x-auto px-4 py-3.5 text-[13px] font-medium whitespace-nowrap sm:px-6 lg:gap-8">
          <span className="flex shrink-0 items-center gap-2">
            <Menu className="size-4" />
            Todas as categorias
          </span>
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
      </nav>
    </header>
  );
}