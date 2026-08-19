import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClientOnly } from '@/components/ui/ClientOnly'

export const Route = createFileRoute('/_admin/admin/faturamento')({
  component: BillingPage,
})

function BillingPage() {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['admin-billing-stats'],
    queryFn: async () => {
      const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11)).toISOString();
      
      const { data: sales, error } = await supabase
        .from('sales')
        .select('total_amount, created_at, status')
        .eq('status', 'confirmed')
        .gte('created_at', twelveMonthsAgo);

      if (error) throw error;

      const months = eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date()
      });

      const chartData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthSales = sales?.filter(sale => {
          const saleDate = new Date(sale.created_at!);
          return saleDate >= monthStart && saleDate <= monthEnd;
        }) || [];

        return {
          name: format(month, 'MMM', { locale: ptBR }),
          fullName: format(month, 'MMMM yyyy', { locale: ptBR }),
          total: monthSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0),
          count: monthSales.length
        };
      });

      const currentMonth = chartData[chartData.length - 1];
      const lastMonth = chartData[chartData.length - 2];
      
      const lastMonthTotal = lastMonth?.total || 0;
      const currentMonthTotal = currentMonth?.total || 0;
      
      const diff = lastMonthTotal > 0 
        ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
        : currentMonthTotal > 0 ? 100 : 0;

      return {
        chartData,
        currentMonth: currentMonth || { total: 0, count: 0, fullName: '', name: '' },
        growth: diff,
        totalYear: chartData.reduce((acc, m) => acc + m.total, 0)
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground italic">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faturamento</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho financeiro da sua loja.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento (Este Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink">
              R$ {billingData?.currentMonth.total.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center pt-1">
              {billingData && billingData.growth >= 0 ? (
                <span className="text-xs font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +{billingData.growth.toFixed(1)}% em relação ao mês anterior
                </span>
              ) : (
                <span className="text-xs font-medium text-red-600 flex items-center">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  {billingData?.growth.toFixed(1)}% em relação ao mês anterior
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Confirmadas (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData?.currentMonth.count || 0}</div>
            <p className="text-xs text-muted-foreground pt-1">
              Pedidos finalizados com sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Venda</CardTitle>
            <Calendar className="h-4 w-4 text-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {billingData?.currentMonth.count ? (billingData.currentMonth.total / billingData.currentMonth.count).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Ticket médio deste mês
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Histórico de Faturamento (6 meses)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] sm:h-[350px] w-full">
            <ClientOnly fallback={<div className="h-full w-full bg-gray-100 animate-pulse rounded-md" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billingData?.chartData || []}>
                  < CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                    labelFormatter={(label: any, payload: any) => payload[0]?.payload?.fullName || label}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {billingData?.chartData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === (billingData?.chartData.length || 0) - 1 ? '#E84688' : '#F0629280'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Resumo Mensal</h3>
        </div>
        <div className="divide-y">
          {billingData?.chartData.slice().reverse().map((month: any) => (
            <div key={month.fullName} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{month.fullName}</p>
                <p className="text-sm text-muted-foreground">{month.count} vendas confirmadas</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-pink text-lg">R$ {month.total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
