# Plano de Unificação do Acesso Admin

Corrigir erros de carregamento (SSR) e unificar a proteção de rotas administrativas sob o layout `_admin.tsx`.

## Ações Estruturais
- **Centralização:** Remover proteções redundantes ou manuais das sub-rotas `/admin/*` e confiar no guardião `beforeLoad` do arquivo pai `src/routes/_admin.tsx`.
- **SSR Safety:** Garantir que o `beforeLoad` em `_admin.tsx` aborte imediatamente no servidor (`typeof window === 'undefined'`) para evitar erros de APIs do navegador durante o carregamento inicial.
- **Robustez na Hidratação:** Aumentar o tempo de espera (debounce) para hidratação da sessão do Supabase no cliente, garantindo que acessos diretos à URL funcionem.

## Arquivos a serem modificados
- `src/routes/_admin.tsx`: Refinar o `beforeLoad` para máxima estabilidade e tratamento de erros centralizado.
- `src/routes/_admin.admin.produtos.tsx`: Remover qualquer lógica manual de proteção e garantir que a exportação da rota siga o padrão do TanStack Router.
- `src/routes/_admin.admin.dashboard.tsx`: Verificar conformidade com o layout pai.
- `src/routes/_admin.admin.vendas.tsx`: Verificar conformidade com o layout pai.
- `src/routes/_admin.admin.estoque.tsx`: Verificar conformidade com o layout pai.
- `src/routes/_admin.admin.configuracoes.tsx`: Verificar conformidade com o layout pai.
- `src/routes/_admin.admin.faturamento.tsx`: Verificar conformidade com o layout pai.

## Detalhes Técnicos
- O TanStack Router processa o `beforeLoad` de cima para baixo. Ao proteger `/_admin`, todas as rotas filhas (como `/_admin/admin/produtos`) herdam a proteção.
- O erro "This page didn't load" geralmente ocorre quando um loader ou componente tenta acessar `localStorage` ou `window` durante a renderização no servidor (Edge Runtime/Workers).
