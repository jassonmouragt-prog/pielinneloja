import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
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
        // Usar reload para garantir que o estado da sessão seja limpo/atualizado
        window.location.assign('/admin/dashboard')
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
    </div>
  )
}
