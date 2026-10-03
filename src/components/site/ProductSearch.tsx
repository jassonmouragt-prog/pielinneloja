import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listPublicProducts } from "@/lib/queries.queries";
import { publicImageUrl } from "@/lib/storage/public-url";
import { productSearch } from "@/lib/site-config";

export function ProductSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const listProducts = useServerFn(listPublicProducts);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTerm(query.trim()), 150);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const {
    data: products = [],
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product-search", term],
    queryFn: () => listProducts({ data: { search: term } }),
    enabled: open && term.length > 0,
    staleTime: 30_000,
  });
  const pending = isFetching || query.trim() !== term;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Pesquisar produtos"
          className="grid size-10 shrink-0 place-items-center text-ink/60 transition-colors duration-300 hover:text-silver-deep focus-visible:outline-2 focus-visible:outline-silver-deep rounded-full"
        >
          <Search className="size-[18px] stroke-[1.5]" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] overflow-hidden rounded-2xl bg-white p-5 sm:p-6">
        <DialogTitle className="pr-6 text-ink">Pesquisar produtos</DialogTitle>
        <DialogDescription>Encontre sua peça pelo nome ou descrição.</DialogDescription>
        <Input
          aria-label="Nome da peça"
          type="search"
          placeholder="Qual peça você procura?"
          maxLength={100}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 text-base focus-visible:ring-silver-deep"
        />
        <div
          className="max-h-[55dvh] overflow-y-auto overflow-x-hidden"
          aria-live="polite"
          aria-busy={pending}
        >
          {!query.trim() ? (
            <p className="py-4 text-sm text-muted-foreground">
              Digite para pesquisar nossas peças.
            </p>
          ) : pending ? (
            <p className="py-4 text-sm text-muted-foreground">Buscando peças...</p>
          ) : isError ? (
            <div className="py-4 text-sm">
              <p>Não foi possível carregar as peças.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 min-h-10 text-silver-deep underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : products.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nenhuma peça encontrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {products.map((product) => {
                const image =
                  product.product_images.find((item) => item.isMain) ?? product.product_images[0];
                return (
                  <li key={product.id}>
                    <Link
                      to="/"
                      search={productSearch(product.id)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg py-3 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-silver-deep"
                    >
                      {image ? (
                        <img
                          src={publicImageUrl(image.url) ?? image.url}
                          alt={product.name}
                          className="size-16 shrink-0 rounded-md bg-gray-100 object-contain"
                        />
                      ) : (
                        <div className="grid size-16 shrink-0 place-items-center rounded-md bg-gray-100 text-[10px] text-muted-foreground">
                          Sem imagem
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-ink">{product.name}</p>
                        <p className="mt-1 text-sm text-silver-deep">
                          {product.price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
