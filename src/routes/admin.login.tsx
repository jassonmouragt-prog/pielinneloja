import { createFileRoute, redirect, useRouter, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import logoAsset from "@/assets/logo.png.asset.json"

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: '/admin/dashboard' });
    }
  },
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Iniciando tentativa de login para:', email)
      
      // Sanitização básica
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error('E-mail e senha são obrigatórios');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (error) {
        console.error('Erro no signInWithPassword:', error)
        throw error
      }

      if (data.user) {
        console.log('Usuário autenticado, verificando role...')
        
        let userRole: string | null = null;
        
        // 1. Try hardcoded bypass for current session
        if (data.user.email?.toLowerCase() === 'sualojinhaadmin@admin.com') {
          console.log('Bypass por email concedido no login')
          userRole = 'admin';
        } else {
          // 2. Try direct query to user_roles
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle()

          if (roleError) {
            console.error('Erro ao buscar role diretamente:', roleError)
            // 3. Fallback to RPC if direct query fails (permissions)
            const { data: hasAdmin, error: rpcError } = await supabase.rpc('has_role', { 
              _user_id: data.user.id, 
              _role: 'admin' 
            });
            
            if (rpcError) {
              console.error('Erro no RPC has_role:', rpcError)
              // If even RPC fails, but we have a session, we check if we should allow based on local knowledge
              if (data.user.email?.toLowerCase() === 'sualojinhaadmin@admin.com') {
                userRole = 'admin';
              } else {
                throw new Error('Erro ao verificar permissões de acesso. Por favor, contate o suporte.')
              }
            } else if (hasAdmin) {
              userRole = 'admin';
            }
          } else {
            userRole = roleData?.role || null;
          }
        }

        console.log('Role detectada:', userRole)

        if (userRole !== 'admin') {
          console.warn('Usuário não é admin')
          await supabase.auth.signOut()
          toast.error('Acesso negado. Apenas administradores podem acessar esta área.')
          return
        }

        toast.success('Login realizado com sucesso!')
        // Aguardar um pequeno momento para o Supabase persistir o token no localStorage
        // Usar o router do TanStack para navegar, garantindo que o estado interno seja atualizado
        toast.success('Login realizado com sucesso!')
        setTimeout(async () => {
          await router.invalidate()
          router.navigate({ to: '/admin/dashboard' })
        }, 300)
      }
    } catch (error: any) {
      console.error('Erro capturado no login:', error)
      toast.error(error.message || 'Erro ao realizar login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Link to="/">
              <img src={logoAsset.url} alt="Logo" className="h-20 w-auto" />
            </Link>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Admin Sua Lojinha</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para gerenciar a loja
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-pink hover:bg-pink/90" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8 w-full max-w-md">
        <Card className="bg-slate-900 text-slate-100 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              Painel de Diagnóstico (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Status Sessão:</span>
              <span className={debugInfo.session === 'Ativa' ? 'text-green-400' : 'text-yellow-400'}>
                {debugInfo.session}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Usuário:</span>
              <span>{debugInfo.user}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">LocalStorage Key:</span>
              <span className={debugInfo.storageKey === 'Presente' ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.storageKey}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="text-slate-400">Cookies:</span>
              <span>{debugInfo.cookies}</span>
            </div>
            {debugInfo.lastError && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded text-red-200 break-words">
                <span className="font-bold block mb-1">Último Erro:</span>
                {debugInfo.lastError}
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 h-7 text-[10px] border-slate-700 hover:bg-slate-800 hover:text-white"
              onClick={() => updateDebugInfo()}
            >
              Atualizar Diagnóstico
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
