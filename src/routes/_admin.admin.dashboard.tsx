import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ChevronRight,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { getRecentSales, getProductsForDashboard, getDashboardSummary } from "@/lib/queries.queries";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [showLowStock, setShowLowStock] = useState(false);
  const getRecentSalesFn = useServerFn(getRecentSales);
  const getProductsFn = useServerFn(getProductsForDashboard);
  const getSummaryFn = useServerFn(getDashboardSummary);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [recentSales, products, summary] = await Promise.all([
        getRecentSalesFn(),
        getProductsFn(),
        getSummaryFn(),
      ]);

      const lowStockProducts = products?.filter((p: any) => (p.stockQuantity ?? 0) <= 5) || [];
      const lowStockCount = lowStockProducts.length;

      return {
        revenue: summary?.revenue ?? 0,
        totalExpenses: summary?.totalExpenses ?? 0,
        netProfit: summary?.netProfit ?? 0,
        confirmedCount: summary?.confirmedCount ?? 0,
        pendingCount: summary?.pendingCount ?? 0,
        lowStockCount,
        lowStockProducts,
        totalProducts: products?.length || 0,
        recentSales: recentSales || [],
      };
    },
  });

  const cards = [
    {
      title: "Faturamento (Mês)",
      value: `R$ ${stats?.revenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-green-600",
      onClick: () => {
        if (typeof window !== "undefined") window.location.href = "/admin/faturamento";
      },
    },
    {
      title: "Despesas (Mês)",
      value: `R$ ${stats?.totalExpenses?.toFixed(2) || "0.00"}`,
      icon: Receipt,
      color: "text-red-600",
      onClick: () => {
        if (typeof window !== "undefined") window.location.href = "/admin/despesas";
      },
    },
    {
      title: stats && stats.netProfit >= 0 ? "Lucro Líquido (Mês)" : "Prejuízo (Mês)",
      value: `R$ ${Math.abs(stats?.netProfit ?? 0).toFixed(2)}`,
      icon: stats && stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: stats && stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600",
      onClick: () => {
        if (typeof window !== "undefined") window.location.href = "/admin/faturamento";
      },
    },
    {
      title: "Vendas Pendentes",
      value: stats?.pendingCount || 0,
      icon: ShoppingCart,
      color: "text-yellow-600",
      onClick: () => {
        if (typeof window !== "undefined") window.location.href = "/admin/vendas";
      },
      highlight: (stats?.pendingCount || 0) > 0,
    },
    {
      title: "Estoque Baixo",
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      onClick: () => setShowLowStock(!showLowStock),
      highlight: (stats?.lowStockCount || 0) > 0,
    },
    {
      title: "Total de Produtos",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-pink",
      onClick: undefined,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua loja neste mês.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <Card
            key={card.title}
            className={`${card.onClick ? "cursor-pointer hover:border-pink/50 transition-colors" : ""} ${card.highlight && !showLowStock ? "ring-2 ring-yellow-500/20" : ""}`}
            onClick={card.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between gap-1">
                <div className="text-xl sm:text-2xl font-bold truncate">{card.value}</div>
                {card.onClick && (
                  <div className="text-xs text-muted-foreground hidden lg:flex items-center gap-1 shrink-0">
                    Ver <ChevronRight className="h-3 w-3" />
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
              {stats.lowStockProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantidade:{" "}
                      <span className="font-bold text-red-500">{product.stockQuantity}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/produtos" search={{ editId: product.id } as any}>
                      Gerenciar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Últimas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentSales && stats.recentSales.length > 0 ? (
            <div className="space-y-4">
              {stats.recentSales.map((sale: any) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {sale.customerName || "Cliente WhatsApp"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.sale_items?.map((i: any) => `${i.quantity}x ${i.products?.name}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        sale.status === "pending" ? "secondary" : sale.status === "confirmed" ? "default" : "outline"
                      }
                      className={sale.status === "pending" ? "bg-yellow-100 text-yellow-800" : sale.status === "confirmed" ? "bg-green-500" : ""}
                    >
                      {sale.status === "pending" ? "Pendente" : sale.status === "confirmed" ? "Ok" : "Canc."}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-bold">R$ {Number(sale.totalAmount).toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              Nenhuma venda registrada recentemente.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
