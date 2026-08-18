import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Package, AlertTriangle, ChevronRight, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_admin/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const [showLowStock, setShowLowStock] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [salesRes, productsRes] = await Promise.all([
        supabase
          .from('sales')
          .select('*, sale_items(*, products(name))')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('products')
          .select('id, name, stock_quantity')
      ]);

      const monthSalesRes = await supabase
        .from('sales')
        .select('total_amount, status')
        .gte('created_at', firstDayOfMonth);

      const confirmedSales = monthSalesRes.data?.filter(s => s.status === 'confirmed') || [];
      const revenue = confirmedSales.reduce((acc, s) => acc + Number(s.total_amount), 0);
      
      const lowStockProducts = productsRes.data?.filter(p => (p.stock_quantity ?? 0) <= 5) || [];
      const lowStockCount = lowStockProducts.length;

      return {
        revenue,
        confirmedCount: confirmedSales.length,
        lowStockCount,
        lowStockProducts,
        totalProducts: productsRes.data?.length || 0,
        recentSales: salesRes.data || []
      };
    }
  });

  const cards = [
    { title: 'Faturamento (Mês)', value: `R$ ${stats?.revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600', onClick: undefined },
    { title: 'Vendas Confirmadas', value: stats?.confirmedCount || 0, icon: ShoppingCart, color: 'text-blue-600', onClick: undefined },
    { 
      title: 'Estoque Baixo', 
      value: stats?.lowStockCount || 0, 
      icon: AlertTriangle, 
      color: 'text-yellow-600',
      onClick: () => setShowLowStock(!showLowStock),
      highlight: (stats?.lowStockCount || 0) > 0
    },
    { title: 'Total de Produtos', value: stats?.totalProducts || 0, icon: Package, color: 'text-pink', onClick: undefined },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua loja neste mês.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card 
            key={card.title} 
            className={`${card.onClick ? 'cursor-pointer hover:border-pink/50 transition-colors' : ''} ${card.highlight && !showLowStock ? 'ring-2 ring-yellow-500/20' : ''}`}
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{card.value}</div>
                {card.onClick && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    Ver detalhes <ChevronRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showLowStock && stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.lowStockProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantidade: <span className="font-bold text-red-500">{product.stock_quantity}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/produtos" search={{ editId: product.id }}>
                      Gerenciar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
