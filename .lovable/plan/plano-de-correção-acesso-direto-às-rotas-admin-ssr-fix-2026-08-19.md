# Plano de Correção: Acesso Direto às Rotas Admin (SSR Fix)

A página `/admin` e suas subrotas estão falhando no carregamento inicial (acesso direto via URL) devido ao uso de APIs restritas ao navegador (`localStorage`, `window`, etc.) durante a execução no servidor (SSR).

## Alterações Propostas

### 1. Ajuste no Route Guard do Admin
- Modificar `src/routes/_admin.tsx` para garantir que o código dentro do `beforeLoad` seja seguro para SSR.
- O TanStack Start executa o `beforeLoad` tanto no servidor quanto no cliente.
- Remover acessos diretos ao `localStorage` no escopo do servidor.
- Utilizar apenas os métodos do cliente Supabase que lidam corretamente com cookies/sessão em ambos os ambientes.

### 2. Ajuste na Rota de Login
- Revisar `src/routes/admin.login.tsx` para garantir que o `beforeLoad` não cause erros de hidratação.

### 3. Verificação de Subrotas
- Garantir que nenhum componente sob a rota layout `_admin` utilize APIs de navegador fora de `useEffect` ou sem guardas de ambiente.

## Detalhes Técnicos

No arquivo `src/routes/_admin.tsx`, a lógica atual tenta acessar `localStorage` diretamente se a sessão não for encontrada. Isso é fatal no SSR:

```typescript
// ATUAL (src/routes/_admin.tsx)
if (!session && typeof localStorage !== 'undefined') {
  const storageKey = Object.keys(localStorage).find(...) // localStorage pode ser indefinido no SSR
  // ...
}
```

Embora exista um `typeof window === 'undefined'` no início, o redirecionamento lançado no `beforeLoad` pode se comportar de forma diferente no servidor. O ideal é que o `beforeLoad` no servidor simplesmente deixe passar ou realize uma verificação baseada em cookies (que o Supabase SSR gerencia), e o cliente valide novamente após a hidratação.

**Passos:**
1. Em `src/routes/_admin.tsx`, isolar completamente a lógica de fallback do `localStorage` para garantir que nunca execute no servidor.
2. Refinar o `beforeLoad` para ser mais resiliente a ambientes sem DOM.
3. Verificar se há algum uso de `window` ou `localStorage` no corpo dos componentes administrativos.

## Validação
1. Acesso direto a `https://.../admin/dashboard` via barra de endereços do navegador.
2. Verificação de logs do servidor para garantir que nenhum erro de "localStorage is not defined" ocorra durante a renderização inicial.
