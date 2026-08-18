import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { LayoutDashboard, Package, Box, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('Admin Guard: No session found, redirecting to login');
      throw redirect({ to: '/admin/login', replace: true });
    }

    try {
      // Tentar via RPC primeiro por ser SECURITY DEFINER e mais confiável para bypassar RLS
      const { data: hasAdmin, error: rpcError } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });

      if (rpcError) {
        console.error('Admin Layout: RPC error, falling back to direct query:', rpcError);
        // Fallback para query direta se o RPC falhar por qualquer motivo
        const { data: roleData, error: directError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (directError || roleData?.role !== 'admin') {
          console.error('Admin Layout: Direct query also failed or not admin:', directError);
          await supabase.auth.signOut();
          throw redirect({ to: '/admin/login' });
        }
      } else if (!hasAdmin) {
        console.warn('Admin Layout: User is not admin (via RPC)');
        await supabase.auth.signOut();
        throw redirect({ to: '/admin/login' });
      }
    } catch (e: any) {
      if (e.status === 302 || e.redirect) throw e; // Preservar o redirect se já for um
      console.error('Admin Layout: Unexpected auth verification error:', e);
      await supabase.auth.signOut();
      throw redirect({ to: '/admin/login', replace: true });
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Produtos', icon: Package, href: '/admin/produtos' },
    { label: 'Estoque', icon: Box, href: '/admin/produtos' }, // Using same page for now per plan
    { label: 'Configurações', icon: Settings, href: '/admin/dashboard' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <span className="text-xl font-bold text-pink">Admin Maakeup</span>
          </div>
          
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href as any}
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
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
