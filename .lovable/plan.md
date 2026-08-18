# Plano para Corrigir Acesso Administrativo

O objetivo é garantir que o usuário administrador (`sualojinhaadmin@admin.com`) consiga logar e acessar o dashboard, resolvendo o problema onde o login "apenas carrega e não abre nada".

## 1. Pesquisa e Diagnóstico
- Verificar se o usuário administrador existe no Supabase Auth.
- Confirmar se a role 'admin' está corretamente atribuída na tabela `user_roles`.
- Analisar os logs de rede e console no preview para identificar falhas silenciosas.

## 2. Ajustes no Backend (Supabase)
- **Criação do Usuário**: Se o usuário não existir, ele será criado via script administrativo (usando a `service_role`).
- **Atribuição de Role**: Garantir que o `user_id` do administrador esteja vinculado à role `admin` na tabela `public.user_roles`.
- **Permissões (RLS)**: Revisar as políticas de RLS para garantir que o administrador tenha permissão de leitura na tabela `user_roles`.

## 3. Ajustes no Frontend
- **src/routes/admin.login.tsx**:
  - Melhorar o tratamento de erro para exibir mensagens específicas se a role não for encontrada ou se o login falhar.
  - Garantir que a sessão seja persistida corretamente antes do redirecionamento.
- **src/routes/_admin.tsx**:
  - Ajustar o `beforeLoad` para ser mais resiliente, possivelmente adicionando um pequeno delay ou retry na verificação da role logo após o login.
  - Verificar se o redirecionamento está causando loops infinitos.

## 4. Verificação
- Testar o fluxo completo: Login -> Redirecionamento -> Dashboard -> Produtos.
- Validar se o logout funciona e limpa a sessão.

## Detalhes Técnicos
- Utilização de `supabaseAdmin` em um script temporário para configurar o usuário inicial.
- Ajuste das políticas de RLS para permitir `authenticated` usuários lerem a própria role na tabela `user_roles` (necessário para o `beforeLoad`).
