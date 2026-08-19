import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { updateSaleStatus } from '@/lib/sales.functions'
import { useServerFn } from '@tanstack/react-start'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Plus, Search, Trash2, ShoppingCart, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_admin/admin/vendas')({
  component: SalesPage,
})

type SaleItem = {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

function SalesPage() {
  const queryClient = useQueryClient();
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const updateStatusFn = useServerFn(updateSaleStatus);
  const [customerName, setCustomerName] = useState('');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch sales
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['admin-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            *,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch products for the selection
  const { data: products } = useQuery({
    queryKey: ['admin-products-minimal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: async () => {
      if (saleItems.length === 0) throw new Error('Adicione pelo menos um produto');

      const totalAmount = saleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      // 1. Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_name: customerName,
          total_amount: totalAmount,
          status: 'confirmed'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Create sale items
      const itemsToInsert = saleItems.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Create stock movements (exits)
      const movementsToInsert = saleItems.map(item => ({
        product_id: item.product_id,
        sale_id: sale.id,
        quantity: -item.quantity,
        type: 'sale',
        notes: `Venda para ${customerName || 'Cliente WhatsApp'}`
      }));

      const { error: movementsError } = await supabase
        .from('stock_movements')
        .insert(movementsToInsert);

      if (movementsError) throw movementsError;

      // 4. Update product stock quantities
      for (const item of saleItems) {
        const product = products?.find(p => p.id === item.product_id);
        if (product) {
          const newStock = (product.stock_quantity || 0) - item.quantity;
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', item.product_id);
          
          if (updateError) console.error('Error updating stock for product:', item.product_id, updateError);
        }
      }

      return sale;
    },
    onSuccess: () => {
      toast.success('Venda registrada com sucesso!');
      setIsNewSaleOpen(false);
      setCustomerName('');
      setSaleItems([]);
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao registrar venda: ' + error.message);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ saleId, status }: { saleId: string, status: 'confirmed' | 'cancelled' }) => {
      return updateStatusFn({ data: { saleId, status } });
    },
    onSuccess: () => {
      toast.success('Status da venda atualizado!');
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  const addProductToSale = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    const existingItem = saleItems.find(item => item.product_id === productId);
    if (existingItem) {
      setSaleItems(saleItems.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSaleItems([...saleItems, {
        product_id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const removeProductFromSale = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setSaleItems(saleItems.map(item => 
      item.product_id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const filteredSales = sales?.filter(sale => 
    (sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     sale.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
          <p className="text-muted-foreground">Registre e gerencie as vendas realizadas via WhatsApp.</p>
        </div>
        
        <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink hover:bg-pink/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Nome do Cliente (opcional)</Label>
                <Input 
                  id="customer" 
                  placeholder="Ex: Maria Oliveira" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
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
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R$ {product.price.toFixed(2)} ({product.stock_quantity} em estoque)
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
                              onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
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
                Total: R$ {saleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewSaleOpen(false)}>Cancelar</Button>
              <Button 
                className="bg-pink hover:bg-pink/90" 
                onClick={() => createSaleMutation.mutate()}
                disabled={createSaleMutation.isPending || saleItems.length === 0}
              >
                {createSaleMutation.isPending ? 'Registrando...' : 'Confirmar Venda'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSales ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Carregando vendas...</TableCell>
              </TableRow>
            ) : filteredSales?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Nenhuma venda encontrada.</TableCell>
              </TableRow>
            ) : (
              filteredSales?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.customer_name || 'Cliente WhatsApp'}</div>
                    <div className="text-xs text-muted-foreground">ID: {sale.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {sale.created_at ? format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {sale.sale_items?.map((item: any) => `${item.quantity}x ${item.products?.name}`).join(', ')}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">R$ {sale.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {sale.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer"
                          onClick={() => updateStatusMutation.mutate({ saleId: sale.id, status: 'confirmed' })}
                        >
                          Pendente (Confirmar?)
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs text-red-500"
                          onClick={() => updateStatusMutation.mutate({ saleId: sale.id, status: 'cancelled' })}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Badge 
                        variant={sale.status === 'confirmed' ? 'default' : 'secondary'} 
                        className={sale.status === 'confirmed' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-100 text-gray-800'}
                      >
                        {sale.status === 'confirmed' ? 'Concluída' : sale.status === 'cancelled' ? 'Cancelada' : sale.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
