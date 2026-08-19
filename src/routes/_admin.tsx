import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { LayoutDashboard, Package, Box, Settings, LogOut, Menu, ShoppingCart, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'
import logoAsset from "@/assets/logo.png.asset.json"

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    // Fallback detection for client-side navigation
    const isClient = typeof window !== 'undefined';
    const storageKey = isClient ? Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token')) : null;
    const sessionStr = storageKey ? localStorage.getItem(storageKey) : null;
    let localSession = null;
    try {
      localSession = sessionStr ? JSON.parse(sessionStr) : null;
    } catch (e) {
      console.error('[AdminGuard] Error parsing session:', e);
    }

    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
    const session = supabaseSession || localSession;
    
    console.log('[AdminGuard] Session Check Email:', session?.user?.email);
    console.log('[AdminGuard] Session Check User ID:', session?.user?.id);
    
    if (!session) {
      console.log('[AdminGuard] No session found, redirecting to login');
      throw redirect({ to: '/admin/login', replace: true });
    }

    // Emergency bypass based on email for the known admin
    if (session.user.email?.toLowerCase() === 'sualojinhaadmin@admin.com') {
      console.log('[AdminGuard] Email bypass granted for', session.user.email);
      return { session, role: 'admin' as const };
    }

    if (session.user.id === 'd3c2ef39-bf82-47aa-98f2-fae877115be4') {
      console.log('[AdminGuard] User ID bypass granted for', session.user.id);
      return { session, role: 'admin' as const };
    }

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleData?.role === 'admin') {
        return { session, role: 'admin' as const };
      }

      console.error('[AdminGuard] Not authorized');
      throw redirect({ to: '/admin/login', replace: true });
    } catch (e: any) {
      if (e.to || e.redirect) throw e;
      console.error('[AdminGuard] Error verify:', e);
      throw redirect({ to: '/admin/login', replace: true });
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Vendas', icon: ShoppingCart, href: '/admin/vendas' },
    { label: 'Faturamento', icon: DollarSign, href: '/admin/faturamento' },
    { label: 'Produtos', icon: Package, href: '/admin/produtos' },
    { label: 'Estoque', icon: Box, href: '/admin/estoque' },
    { label: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 px-6 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="Logo" className="h-10 w-auto" />
          <span className="text-lg font-bold text-pink">Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href as any}
            onClick={() => setIsMobileMenuOpen(false)}
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoAsset.url} alt="Logo" className="h-8 w-auto" />
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

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}