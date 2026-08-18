import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react'

export const Route = createFileRoute('/_admin/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [salesRes, productsRes] = await Promise.all([
        supabase
          .from('sales')
          .select('total_amount, status')
          .gte('created_at', firstDayOfMonth),
        supabase
          .from('products')
          .select('id, stock_quantity')
      ]);

      const confirmedSales = salesRes.data?.filter(s => s.status === 'confirmed') || [];
      const revenue = confirmedSales.reduce((acc, s) => acc + Number(s.total_amount), 0);
      const lowStockCount = productsRes.data?.filter(p => (p.stock_quantity ?? 0) <= 5).length || 0;

      return {
        revenue,
        confirmedCount: confirmedSales.length,
        lowStockCount,
        totalProducts: productsRes.data?.length || 0
      };
    }
  });

  const cards = [
    { title: 'Faturamento (Mês)', value: `R$ ${stats?.revenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600' },
    { title: 'Vendas Confirmadas', value: stats?.confirmedCount || 0, icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'Estoque Baixo', value: stats?.lowStockCount || 0, icon: AlertTriangle, color: 'text-yellow-600' },
    { title: 'Total de Produtos', value: stats?.totalProducts || 0, icon: Package, color: 'text-pink' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua loja neste mês.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and rankings would go here */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Últimas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">Gráficos e rankings serão implementados em breve.</p>
        </CardContent>
      </Card>
    </div>
  )
}
