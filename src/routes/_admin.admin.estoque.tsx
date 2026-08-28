import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useServerFn } from "@tanstack/react-start";
import { listProductsForStock, listStockMovements } from "@/lib/queries.queries";
import { updateProductStock } from "@/lib/admin/admin.functions";

const stockMovementSchema = z.object({
  product_id: z.string().min(1, "Selecione um produto"),
  quantity: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "Quantidade não pode ser zero"),
  type: z.enum(["entry", "exit", "adjustment"]),
  notes: z.string().optional(),
});

type StockMovementValues = z.infer<typeof stockMovementSchema>;

export const Route = createFileRoute("/_admin/admin/estoque")({
  component: AdminStockPage,
});

function AdminStockPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listProductsFn = useServerFn(listProductsForStock);
  const listMovementsFn = useServerFn(listStockMovements);
  const updateStockFn = useServerFn(updateProductStock);

  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ["admin-products-stock"],
    queryFn: () => listProductsFn(),
  });

  const { data: movements } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: () => listMovementsFn(),
    enabled: isHistoryOpen,
  });

  const form = useForm<StockMovementValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      product_id: "",
      quantity: 1,
      type: "entry",
      notes: "",
    },
  });

  const onSubmit = async (values: StockMovementValues) => {
    setIsSubmitting(true);
    try {
      const signedQuantity = values.type === "exit" ? -Math.abs(values.quantity) : values.quantity;
      await updateStockFn({
        data: {
          productId: values.product_id,
          quantity: signedQuantity,
          type: values.type,
          notes: values.notes,
        },
      });

      toast.success("Estoque atualizado com sucesso!");
      setIsDialogOpen(false);
      form.reset();
      refetchProducts();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">Controle de entradas, saídas e movimentações.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            Histórico
          </Button>
          <Button className="bg-pink hover:bg-pink/90" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Movimentação
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Qtd Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {product.categories?.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.categories?.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{product.stock_quantity}</span>
                      {(product.stock_quantity ?? 0) <= 5 && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(product.stock_quantity ?? 0) <= 0 ? (
                      <Badge variant="destructive">Esgotado</Badge>
                    ) : (product.stock_quantity ?? 0) <= 5 ? (
                      <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        Baixo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        Normal
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        onClick={() => {
                          form.setValue("product_id", product.id);
                          form.setValue("type", "entry");
                          setIsDialogOpen(true);
                        }}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Entrada</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          form.setValue("product_id", product.id);
                          form.setValue("type", "exit");
                          setIsDialogOpen(true);
                        }}
                      >
                        <ArrowDownCircle className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Saída</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
            <DialogDescription>Adicione ou remova itens do estoque manualmente.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name || ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry">Entrada (+)</SelectItem>
                          <SelectItem value="exit">Saída (-)</SelectItem>
                          <SelectItem value="adjustment">Ajuste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Motivo da movimentação..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-pink hover:bg-pink/90" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Obs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements?.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString("pt-BR") : ""}
                    </TableCell>
                    <TableCell className="font-medium">{m.products?.name || ""}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          m.type === "entry"
                            ? "default"
                            : m.type === "exit"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {m.type === "entry" ? "Entrada" : m.type === "exit" ? "Saída" : "Ajuste"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        m.quantity > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"
                      }
                    >
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
