import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { LayoutDashboard, Package, Box, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('Admin Guard: Checking session...', session ? 'Present' : 'Absent');

    if (!session) {
      console.log('Admin Guard: No session found, redirecting to login');
      throw redirect({ to: '/admin/login', replace: true });
    }

    try {
      console.log('Admin Guard: Verifying role for user:', session.user.id);
      
      // Tentativa 1: RPC (Security Definer - ignora RLS)
      const { data: hasAdmin, error: rpcError } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (!rpcError && hasAdmin === true) {
        console.log('Admin Guard: RPC check successful, user is admin');
        return { session, role: 'admin' };
      }

      console.warn('Admin Layout: RPC check failed or returned false. RPC Error:', rpcError, 'Result:', hasAdmin);

      // Tentativa 2: Query Direta (Depende de RLS e GRANTS)
      const { data: roleData, error: directError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      console.log('Admin Layout: Direct query result:', roleData, 'Error:', directError);

      if (roleData?.role === 'admin') {
        console.log('Admin Guard: Direct query successful, user is admin');
        return { session, role: 'admin' };
      }

      console.error('Admin Layout: All role checks failed. Direct Error:', directError);
      
      // Se chegamos aqui, o usuário não é admin ou houve um erro crítico
      // Em ambientes de desenvolvimento/preview, às vezes o signOut pode ser agressivo demais
      // se houver algum erro de rede momentâneo. Mas para segurança é necessário.
      // await supabase.auth.signOut();
      throw redirect({ to: '/admin/login', replace: true });
      
    } catch (e: any) {
      // Se for um objeto de redirect do TanStack, relançamos
      if (e.to || e.redirect) throw e;
      
      console.error('Admin Layout: Unexpected auth verification error:', e);
      // await supabase.auth.signOut();
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
    { label: 'Produtos', icon: Package, href: '/admin/produtos' },
    { label: 'Estoque', icon: Box, href: '/admin/estoque' },
    { label: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold text-pink">Admin Maakeup</span>
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
        <span className="text-xl font-bold text-pink">Admin Maakeup</span>
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