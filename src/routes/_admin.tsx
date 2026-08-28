import { createFileRoute, Outlet, redirect, Link, useRouter } from '@tanstack/react-router'
import { LayoutDashboard, Package, Box, Settings, LogOut, Menu, ShoppingCart, DollarSign, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import logoAsset from "@/assets/logo.png.asset.json"
import { resolveAssetUrl } from "@/lib/assets"
import { toast } from 'sonner'
import { useServerFn } from '@tanstack/react-start'
import { getCurrentSession } from '@/lib/auth/auth.functions'
import { tokenStorage } from '@/lib/auth/token-storage'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ location }) => {
    if (typeof window === 'undefined') return;

    const token = tokenStorage.get();
    if (!token) {
      throw redirect({ to: '/admin/login', search: { redirect: location.href }, replace: true });
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const getCurrentSessionFn = useServerFn(getCurrentSession);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getCurrentSessionFn();
        if (!session || session.role !== 'admin') {
          tokenStorage.clear();
          setIsAuthorized(false);
          toast.error('Sessão expirada ou inválida. Faça login novamente.');
          router.navigate({ to: '/admin/login', replace: true });
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('[admin layout] checkAuth failed', error);
        tokenStorage.clear();
        setIsAuthorized(false);
        router.navigate({ to: '/admin/login', replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, getCurrentSessionFn]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      tokenStorage.clear();
      window.location.href = '/admin/login';
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Vendas', icon: ShoppingCart, href: '/admin/vendas' },
    { label: 'Faturamento', icon: DollarSign, href: '/admin/faturamento' },
    { label: 'Despesas', icon: Receipt, href: '/admin/despesas' },
    { label: 'Produtos', icon: Package, href: '/admin/produtos' },
    { label: 'Estoque', icon: Box, href: '/admin/estoque' },
    { label: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 px-6 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={resolveAssetUrl(logoAsset)} alt="Logo" className="h-10 w-auto" />
          <span className="text-lg font-bold text-pink">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href as any}
            onClick={() => { setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-pink/5 hover:text-pink [&.active]:bg-pink/10 [&.active]:text-pink"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-3 text-gray-700 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src={resolveAssetUrl(logoAsset)} alt="Logo" className="h-8 w-auto" />
          <span className="text-lg font-bold text-pink">Admin</span>
        </Link>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu Administrativo</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-200 bg-white lg:block">
        <SidebarContent />
      </aside>
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 overflow-x-hidden">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[100vw]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
