import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<{
    session: any;
    user: any;
    lastError: string | null;
    storageKey: string | null;
    cookies: string | null;
  }>({
    session: null,
    user: null,
    lastError: null,
    storageKey: null,
    cookies: null
  })

  const updateDebugInfo = async (error: string | null = null) => {
    const { data: { session } } = await supabase.auth.getSession();
    const storageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token')) || null;
    
    setDebugInfo(prev => ({
      ...prev,
      session: session ? 'Ativa' : 'Nenhuma',
      user: session?.user?.email || 'Nenhum',
      lastError: error || prev.lastError,
      storageKey: storageKey ? 'Presente' : 'Ausente',
      cookies: document.cookie.includes('sb-') ? 'Detectados' : 'Nenhum cookie de auth'
    }));
  }

  useEffect(() => {
    updateDebugInfo();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Iniciando tentativa de login para:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro no signInWithPassword:', error)
        throw error
      }

      if (data.user) {
        console.log('Usuário autenticado, verificando role...')
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle()

        if (roleError) {
          console.error('Erro ao buscar role:', roleError)
          throw new Error('Erro ao verificar permissões de acesso.')
        }

        console.log('Dados da role:', roleData)

        if (roleData?.role !== 'admin') {
          console.warn('Usuário não é admin:', roleData?.role)
          await supabase.auth.signOut()
          toast.error('Acesso negado. Apenas administradores podem acessar esta área.')
          return
        }

        toast.success('Login realizado com sucesso!')
        // Aguardar um pequeno momento para o Supabase persistir o token no localStorage
        setTimeout(() => {
          window.location.assign('/admin/dashboard')
        }, 500)
      }
    } catch (error: any) {
      console.error('Erro capturado no login:', error)
      updateDebugInfo(error.message || 'Erro desconhecido');
      toast.error(error.message || 'Erro ao realizar login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
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
