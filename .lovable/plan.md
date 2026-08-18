# Segurança: Proteção de Dados de Vendas e Estoque

Este plano detalha as correções de segurança aplicadas para proteger os dados da loja, restringindo o acesso direto ao banco de dados e utilizando funções de servidor seguras para o processo de checkout.

## Alterações Técnicas

### 1. Migração de Banco de Dados (Segurança RLS)
- **Remoção de Acesso Público**: Foram removidas as políticas que permitiam inserções diretas (INSERT) por usuários anônimos nas tabelas `sales` e `sale_items`.
- **Restrição Administrativa**: Novas políticas garantem que apenas usuários com a função de 'admin' autenticada possam ler (SELECT) ou gerenciar dados nestas tabelas via API pública.
- **Isolamento de Estoque**: A tabela `stock_movements` agora está estritamente restrita a administradores.

### 2. Funções de Servidor (Back-end)
- **Refatoração do Checkout**: A função de servidor `registerPendingSale` em `src/lib/sales.functions.ts` foi atualizada para utilizar o `supabaseAdmin`. 
- **Privilégios Elevados no Servidor**: O uso do cliente administrativo no servidor permite que o sistema registre vendas e itens de venda mesmo com as políticas de RLS restritivas ativadas, garantindo que o processo de compra funcione de forma segura sem expor o banco de dados a ataques de injeção de dados falsos pelo front-end.

## Verificação de Segurança
As vulnerabilidades reportadas pelo scan (`PUBLIC_WRITABLE_DATA` e `MISSING_RLS_PROTECTION`) foram resolvidas através do fechamento do acesso direto via API e delegando a responsabilidade de escrita para o ambiente seguro do servidor.
