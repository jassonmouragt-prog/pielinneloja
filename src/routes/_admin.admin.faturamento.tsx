import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Receipt, TrendingDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { useServerFn } from "@tanstack/react-start";
import { getBillingData } from "@/lib/queries.queries";
import { listExpenses } from "@/lib/expenses.queries";

export const Route = createFileRoute("/_admin/admin/faturamento")({
  component: BillingPage,
});

function BillingPage() {
  const getBillingFn = useServerFn(getBillingData);
  const listExpensesFn = useServerFn(listExpenses);

  const { data: billingData, isLoading } = useQuery({
    queryKey: ["admin-billing-stats"],
    queryFn: async () => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 5);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const [sales, expenses] = await Promise.all([
        getBillingFn(),
        listExpensesFn({ data: { from: twelveMonthsAgo.toISOString() } }),
      ]);

      const months = eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date(),
      });

      const chartData = months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);

        const monthSales = sales?.filter((sale: any) => {
          const saleDate = new Date(sale.created_at);
          return saleDate >= monthStart && saleDate <= monthEnd;
        }) || [];

        const monthExpenses = expenses?.filter((e: any) => {
          const expDate = new Date(e.expenseDate);
          return expDate >= monthStart && expDate <= monthEnd;
        }) || [];

        const revenue = monthSales.reduce((acc: number, sale: any) => acc + Number(sale.total_amount), 0);
        const expenseTotal = monthExpenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0);

        return {
          name: format(month, "MMM", { locale: ptBR }),
          fullName: format(month, "MMMM yyyy", { locale: ptBR }),
          revenue,
          expenses: expenseTotal,
          profit: revenue - expenseTotal,
          count: monthSales.length,
        };
      });

      const currentMonth = chartData[chartData.length - 1];
      const lastMonth = chartData[chartData.length - 2];

      const lastMonthProfit = lastMonth?.profit || 0;
      const currentMonthProfit = currentMonth?.profit || 0;
      const diff = lastMonthProfit !== 0 ? ((currentMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100 : 0;

      return {
        chartData,
        currentMonth: currentMonth || { revenue: 0, expenses: 0, profit: 0, count: 0, fullName: "", name: "" },
        growth: diff,
        totalRevenue: chartData.reduce((acc, m) => acc + m.revenue, 0),
        totalExpenses: chartData.reduce((acc, m) => acc + m.expenses, 0),
        totalProfit: chartData.reduce((acc, m) => acc + m.profit, 0),
      };
    },
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {billingData?.currentMonth.revenue.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground pt-1">{billingData?.currentMonth.count || 0} vendas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas (Mês)</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {billingData?.currentMonth.expenses.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground pt-1">Total de saídas no mês</p>
          </CardContent>
        </Card>

        <Card className={(billingData?.currentMonth.profit ?? 0) < 0 ? "border-red-200" : "border-emerald-200"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{(billingData?.currentMonth.profit ?? 0) >= 0 ? "Lucro (Mês)" : "Prejuízo (Mês)"}</CardTitle>
            {(billingData?.currentMonth.profit ?? 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(billingData?.currentMonth.profit ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              R$ {Math.abs(billingData?.currentMonth.profit ?? 0).toFixed(2)}
            </div>
            <div className="flex items-center pt-1">
              {billingData && billingData.growth >= 0 ? (
                <span className="text-xs font-medium text-green-600 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +{billingData.growth.toFixed(1)}% vs mês anterior
                </span>
              ) : (
                <span className="text-xs font-medium text-red-600 flex items-center">
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                  {billingData?.growth.toFixed(1)}% vs mês anterior
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {billingData?.currentMonth.count ? (billingData.currentMonth.revenue / billingData.currentMonth.count).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground pt-1">Por venda confirmada</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Financeiro (6 meses)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[350px] w-full">
            <ClientOnly fallback={<div className="h-full w-full bg-gray-100 animate-pulse rounded-md" />}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billingData?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    formatter={(value: any, name: any) => [`R$ ${Number(value).toFixed(2)}`, name]}
                    labelFormatter={(label: any, payload: any) => payload[0]?.payload?.fullName || label}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="revenue" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Lucro" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientOnly>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Resumo Mensal</h3>
          <div className="text-right text-xs text-muted-foreground">
            <span className="text-green-600 font-bold">+R$ {billingData?.totalRevenue.toFixed(2)}</span>
            <span className="mx-1">·</span>
            <span className="text-red-600 font-bold">-R$ {billingData?.totalExpenses.toFixed(2)}</span>
            <span className="mx-1">·</span>
            <span className="text-pink font-bold">= R$ {billingData?.totalProfit.toFixed(2)}</span>
          </div>
        </div>
        <div className="divide-y">
          {billingData?.chartData.slice().reverse().map((month: any) => (
            <div key={month.fullName} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900 capitalize">{month.fullName}</p>
                <p className="text-sm text-muted-foreground">{month.count} vendas confirmadas</p>
              </div>
              <div className="text-right text-sm space-y-0.5">
                <p className="text-green-600 font-bold">+ R$ {month.revenue.toFixed(2)}</p>
                <p className="text-red-600">- R$ {month.expenses.toFixed(2)}</p>
                <p className={`font-bold ${month.profit >= 0 ? "text-pink" : "text-red-600"}`}>
                  = {month.profit >= 0 ? "+" : "-"} R$ {Math.abs(month.profit).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
