import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Loader2, Receipt, Users, Package, Droplet, Zap, Wifi, Home, Megaphone, FileText, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { listExpenses, createExpense, deleteExpense, getExpensesSummary } from '@/lib/expenses.queries'

const expenseSchema = z.object({
  type: z.enum(["funcionaria", "fornecedores", "agua", "luz", "internet", "aluguel", "marketing", "impostos", "outros"]),
  description: z.string().min(2, "Descrição obrigatória").max(255),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  expenseDate: z.string().optional(),
  notes: z.string().max(500).optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const EXPENSE_TYPES = [
  { value: "funcionaria", label: "Funcionária", icon: Users, color: "text-pink-600" },
  { value: "fornecedores", label: "Fornecedores / Mercadoria", icon: Package, color: "text-purple-600" },
  { value: "agua", label: "Água", icon: Droplet, color: "text-sky-600" },
  { value: "luz", label: "Luz", icon: Zap, color: "text-yellow-600" },
  { value: "internet", label: "Internet", icon: Wifi, color: "text-indigo-600" },
  { value: "aluguel", label: "Aluguel", icon: Home, color: "text-emerald-600" },
  { value: "marketing", label: "Marketing", icon: Megaphone, color: "text-orange-600" },
  { value: "impostos", label: "Impostos", icon: FileText, color: "text-red-600" },
  { value: "outros", label: "Outros", icon: MoreHorizontal, color: "text-muted-foreground" },
] as const;

export const Route = createFileRoute('/_admin/admin/despesas')({
  component: AdminExpensesPage,
})

function AdminExpensesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listExpensesFn = useServerFn(listExpenses);
  const createExpenseFn = useServerFn(createExpense);
  const deleteExpenseFn = useServerFn(deleteExpense);
  const getSummaryFn = useServerFn(getExpensesSummary);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['admin-expenses', filterType, filterFrom, filterTo],
    queryFn: () =>
      listExpensesFn({
        data: {
          type: filterType === "all" ? undefined : (filterType as any),
          from: filterFrom || undefined,
          to: filterTo || undefined,
        },
      }),
  });

  const { data: summary } = useQuery({
    queryKey: ['admin-expenses-summary', filterFrom, filterTo],
    queryFn: () =>
      getSummaryFn({
        data: {
          from: filterFrom || undefined,
          to: filterTo || undefined,
        },
      }),
  });

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      type: "fornecedores",
      description: "",
      amount: 0,
      expenseDate: new Date().toISOString().slice(0, 10),
      notes: "",
    },
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      await createExpenseFn({
        data: {
          type: values.type,
          description: values.description,
          amount: values.amount,
          expenseDate: values.expenseDate,
          notes: values.notes,
        },
      });
      toast.success("Despesa registrada com sucesso!");
      setIsDialogOpen(false);
      form.reset({
        type: "fornecedores",
        description: "",
        amount: 0,
        expenseDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses-summary'] });
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    try {
      await deleteExpenseFn({ data: { id } });
      toast.success("Despesa excluída!");
      queryClient.invalidateQueries({ queryKey: ['admin-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-expenses-summary'] });
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const totalPeriod = summary?.reduce((acc, s) => acc + s.total, 0) ?? 0;
  const totalCount = summary?.reduce((acc, s) => acc + s.count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">Registre todas as saídas da loja. Impactam o lucro líquido.</p>
        </div>
        <Button className="bg-pink hover:bg-pink/90" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total no período</p>
            <p className="text-2xl font-bold text-red-600">R$ {totalPeriod.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{totalCount} {totalCount === 1 ? "despesa" : "despesas"}</p>
          </CardContent>
        </Card>
        {EXPENSE_TYPES.slice(0, 3).map((t) => {
          const found = summary?.find((s) => s.type === t.value);
          const Icon = t.icon;
          return (
            <Card key={t.value}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-1.5">
                  <Icon className={`size-3.5 ${t.color}`} />
                  <p className="text-xs text-muted-foreground">{t.label}</p>
                </div>
                <p className="text-lg font-bold mt-1">R$ {(found?.total ?? 0).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{found?.count ?? 0} {found?.count === 1 ? "lançamento" : "lançamentos"}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">De</Label>
              <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Até</Label>
              <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {EXPENSE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : expenses && expenses.length > 0 ? (
                expenses.map((e: any) => {
          const meta = EXPENSE_TYPES.find((t) => t.value === e.type);
          if (!meta) return null;
          const Icon = meta.icon;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs">
                        {e.expenseDate ? new Date(e.expenseDate).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 ${meta.color} font-medium text-sm`}>
                          <Icon className="size-3.5" />
                          {meta.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{e.description}</p>
                        {e.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{e.notes}</p>}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        R$ {Number(e.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma despesa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nova Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma saída que será descontada do lucro.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_TYPES.map((t) => {
                          const Icon = t.icon;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              <span className="flex items-center gap-2">
                                <Icon className={`size-3.5 ${t.color}`} />
                                {t.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Conta de luz - Outubro" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detalhes extras..." rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="bg-pink hover:bg-pink/90" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
