# Plano para Correção do Sistema de Login Admin

O usuário relatou dois problemas na área administrativa:
1. Os campos de e-mail e senha no `/admin/login` já vêm preenchidos (deseja-se que estejam vazios).
2. O botão "Entrar" não redireciona o usuário após o clique, mantendo a página no mesmo lugar.

## Alterações Propostas

### 1. Limpeza dos Campos de Login
- **Arquivo:** `src/routes/admin.login.tsx`
- **Ação:** Remover os valores iniciais fixos nos estados `email` e `password` no componente `AdminLoginPage`.

### 2. Correção do Fluxo de Login e Redirecionamento
- **Arquivo:** `src/routes/admin.login.tsx`
- **Ação:** 
    - Investigar por que o `window.location.href` ou a lógica de login pode estar falhando.
    - Garantir que o `supabase.auth.signInWithPassword` esteja sendo chamado corretamente.
    - Utilizar o hook `useRouter` ou `useNavigate` do TanStack Router para um redirecionamento mais robusto, ou manter o redirecionamento manual garantindo que a sessão seja detectada.
    - Adicionar logs de erro mais detalhados para depuração se necessário, embora o `toast` já deva mostrar erros.

### 3. Verificação de Permissões (Role)
- **Arquivo:** `src/routes/admin.login.tsx`
- **Ação:** Garantir que a consulta à tabela `user_roles` não esteja falhando silenciosamente ou causando um loop que impeça o redirecionamento.

## Detalhes Técnicos
- Os estados iniciais `useState('sualojinhaadmin@admin.com')` e `useState('raysl26')` serão alterados para `useState('')`.
- Verificaremos se há algum erro de rede ou de RLS que impeça o `single()` na consulta de `user_roles`.

---

Deseja que eu proceda com essas correções?