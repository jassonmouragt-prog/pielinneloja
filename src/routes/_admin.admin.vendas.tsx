import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { updateSaleStatus } from "@/lib/sales.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, ShoppingCart, Calendar, Tag, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { listSales, listAdminProductsMinimal } from "@/lib/queries.queries";

export const Route = createFileRoute("/_admin/admin/vendas")({
  component: SalesPage,
});

type SaleItem = {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
};

function SalesPage() {
  const queryClient = useQueryClient();
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const updateStatusFn = useServerFn(updateSaleStatus);
  const listSalesFn = useServerFn(listSales);
  const listProductsFn = useServerFn(listAdminProductsMinimal);
  const [customerName, setCustomerName] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ["admin-sales"],
    queryFn: () => listSalesFn(),
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-minimal"],
    queryFn: () => listProductsFn(),
  });

  const createSaleMutation = useMutation({
    mutationFn: async () => {
      if (!customerName.trim()) throw new Error("O nome do cliente é obrigatório");
      if (saleItems.length === 0) throw new Error("Adicione pelo menos um produto");

      const { registerPendingSale } = await import("@/lib/sales.functions");
      const registerFn = useServerFn(registerPendingSale);
      const totalAmount = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      return registerFn({
        data: {
          customerName,
          totalAmount,
          whatsappMessage: "",
          items: saleItems.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      });
    },
    onSuccess: () => {
      toast.success("Venda registrada com sucesso!");
      setIsNewSaleOpen(false);
      setCustomerName("");
      setSaleItems([]);
      queryClient.invalidateQueries({ queryKey: ["admin-sales"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao registrar venda: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      saleId,
      status,
    }: {
      saleId: string;
      status: "confirmed" | "cancelled";
    }) => {
      return updateStatusFn({ data: { saleId, status } });
    },
    onSuccess: () => {
      toast.success("Status da venda atualizado!");
      queryClient.invalidateQueries({ queryKey: ["admin-sales"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const addProductToSale = (productId: string) => {
    const product = products?.find((p: any) => p.id === productId);
    if (!product) return;

    const existingItem = saleItems.find((item) => item.product_id === productId);
    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          product_id: product.id,
          name: product.name,
          quantity: 1,
          price: Number(product.price),
        },
      ]);
    }
  };

  const removeProductFromSale = (productId: string) => {
    setSaleItems(saleItems.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setSaleItems(
      saleItems.map((item) => (item.product_id === productId ? { ...item, quantity } : item)),
    );
  };

  const exportToCSV = () => {
    if (typeof window === "undefined") return;
    if (!sales || sales.length === 0) {
      toast.error("Não há vendas para exportar");
      return;
    }

    const headers = ["ID", "Cliente", "Data", "Itens", "Total", "Status"];
    const rows = filteredSales?.map((sale: any) => [
      sale.id,
      sale.customerName || "Cliente WhatsApp",
      sale.createdAt ? format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm") : "",
      sale.sale_items?.map((item: any) => `${item.quantity}x ${item.products?.name}`).join("; "),
      Number(sale.totalAmount).toFixed(2),
      sale.status === "confirmed"
        ? "Concluída"
        : sale.status === "cancelled"
          ? "Cancelada"
          : "Pendente",
    ]);

    const csvContent = [
      headers.join(","),
      ...(rows?.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ) || []),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.setAttribute("href", url);
    link.setAttribute("download", `vendas_${format(new Date(), "dd-MM-yyyy")}.csv`);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório exportado com sucesso!");
  };

  const filteredSales = sales?.filter(
    (sale: any) =>
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">
            Registre e gerencie as vendas realizadas via WhatsApp.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>

          <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pink hover:bg-pink/90">
                <Plus className="mr-2 h-4 w-4" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Nome do Cliente</Label>
                  <Input
                    id="customer"
                    placeholder="Ex: Maria Oliveira"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Produtos</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={addProductToSale}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um produto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product: any) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - R$ {Number(product.price).toFixed(2)} (
                            {product.stockQuantity} em estoque)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {saleItems.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead className="w-[100px]">Qtd</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead className="text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((item) => (
                          <TableRow key={item.product_id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateQuantity(item.product_id, parseInt(e.target.value))
                                }
                                className="h-8 w-16"
                              />
                            </TableCell>
                            <TableCell>R$ {(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeProductFromSale(item.product_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="flex justify-end text-lg font-bold pt-2">
                  Total: R${" "}
                  {saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewSaleOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-pink hover:bg-pink/90"
                  onClick={() => createSaleMutation.mutate()}
                  disabled={createSaleMutation.isPending || saleItems.length === 0}
                >
                  {createSaleMutation.isPending ? "Registrando..." : "Confirmar Venda"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">ID / Cliente</TableHead>
              <TableHead className="min-w-[150px]">Data</TableHead>
              <TableHead className="min-w-[200px]">Itens</TableHead>
              <TableHead className="min-w-[100px]">Total</TableHead>
              <TableHead className="min-w-[150px]">Status</TableHead>
              <TableHead className="text-right min-w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSales ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Carregando vendas...
                </TableCell>
              </TableRow>
            ) : filteredSales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales?.map((sale: any) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.customerName || "Cliente WhatsApp"}</div>
                    <div className="text-xs text-muted-foreground">ID: {sale.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {sale.createdAt
                        ? format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {sale.sale_items
                        ?.map((item: any) => `${item.quantity}x ${item.products?.name}`)
                        .join(", ")}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {Number(sale.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {sale.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                          onClick={() =>
                            updateStatusMutation.mutate({ saleId: sale.id, status: "confirmed" })
                          }
                        >
                          Pendente (Confirmar?)
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-500"
                          onClick={() =>
                            updateStatusMutation.mutate({ saleId: sale.id, status: "cancelled" })
                          }
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant={sale.status === "confirmed" ? "default" : "secondary"}
                        className={
                          sale.status === "confirmed"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {sale.status === "confirmed"
                          ? "Concluída"
                          : sale.status === "cancelled"
                            ? "Cancelada"
                            : sale.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Venda</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4 border-b pb-4">
                            <div>
                              <Label className="text-xs text-muted-foreground uppercase">
                                Cliente
                              </Label>
                              <p className="font-medium">{sale.customerName || "Não informado"}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground uppercase">
                                Data
                              </Label>
                              <p className="font-medium">
                                {sale.createdAt
                                  ? format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm", {
                                      locale: ptBR,
                                    })
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground uppercase">
                                Status
                              </Label>
                              <p className="font-medium capitalize">
                                {sale.status === "confirmed"
                                  ? "Concluída"
                                  : sale.status === "cancelled"
                                    ? "Cancelada"
                                    : "Pendente"}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground uppercase">
                                Total
                              </Label>
                              <p className="font-medium text-pink">
                                R$ {Number(sale.totalAmount).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground uppercase mb-2 block">
                              Itens do Pedido
                            </Label>
                            <div className="space-y-2">
                              {sale.sale_items?.map((item: any) => (
                                <div key={item.id} className="border-b last:border-0 py-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">
                                      {item.quantity}x {item.products?.name}
                                    </span>
                                    <span>
                                      R${" "}
                                      {(
                                        Number(item.priceAtSale ?? item.price_at_sale) *
                                        item.quantity
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                  {item.variations && Object.keys(item.variations).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {Object.entries(item.variations).map(([key, value]) => (
                                        <span
                                          key={key}
                                          className="inline-flex items-center gap-1 bg-pink/5 text-[10px] text-pink px-2 py-0.5 rounded-full border border-pink/10 font-medium"
                                        >
                                          <Tag className="size-2" />
                                          {key}: {value as string}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {sale.whatsappMessage && (
                            <div>
                              <Label className="text-xs text-muted-foreground uppercase mb-2 block">
                                Mensagem do WhatsApp
                              </Label>
                              <div className="bg-muted p-3 rounded text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {sale.whatsappMessage}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
