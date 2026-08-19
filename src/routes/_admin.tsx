import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { LayoutDashboard, Package, Box, Settings, LogOut, Menu, ShoppingCart, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'
import logoAsset from "@/assets/logo.png.asset.json"

export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ location }) => {
    // Basic guard for SSR
    if (typeof window === 'undefined') return;

    // 1. Get current session with a small retry logic for hydration
    let sessionResponse = await supabase.auth.getSession();
    let session = sessionResponse.data.session;
    
    // Fallback: If no session from client, wait a bit and try one more time 
    // to handle hydration race conditions on some browsers/machines
    if (!session) {
      await new Promise(resolve => setTimeout(resolve, 300));
      sessionResponse = await supabase.auth.getSession();
      session = sessionResponse.data.session;
    }

    // Secondary fallback: check localStorage directly if Supabase is being stubborn
    if (!session && typeof localStorage !== 'undefined') {
      const storageKey = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
      const sessionStr = storageKey ? localStorage.getItem(storageKey) : null;
      if (sessionStr) {
        try {
          const localSession = JSON.parse(sessionStr);
          if (localSession && localSession.access_token) {
            session = localSession;
          }
        } catch (e) {
          console.error('[AdminGuard] Error parsing fallback session:', e);
        }
      }
    }

    if (!session) {
      console.log('[AdminGuard] No session found, redirecting to login');
      throw redirect({ 
        to: '/admin/login', 
        search: { redirect: location.href },
        replace: true 
      });
    }

    const userEmail = session.user.email?.toLowerCase();
    
    // Emergency bypass for the known admin to ensure access even if DB query fails
    if (userEmail === 'sualojinhaadmin@admin.com') {
      return { session, role: 'admin' as const };
    }

    try {
      // Check role in database via user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('[AdminGuard] Role check error:', roleError);
        // If we have a session and it's the admin email, we already returned above.
        // For others, if the query fails, we redirect to login for safety.
        throw redirect({ to: '/admin/login', replace: true });
      }

      if (roleData?.role === 'admin') {
        return { session, role: 'admin' as const };
      }

      console.error('[AdminGuard] Not authorized:', userEmail);
      throw redirect({ to: '/admin/login', replace: true });
    } catch (e: any) {
      if (e.to || e.redirect || [301, 302, 303, 307, 308].includes(e.status)) throw e;
      console.error('[AdminGuard] Unexpected error:', e);
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
            onClick={() => {
              setIsMobileMenuOpen(false);
            }}
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
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-0 overflow-x-hidden">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[100vw]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}