# Plan: Reset de Vendas e Exportação de Relatório Mensal

Implementação de ferramentas de gerenciamento de vendas no painel administrativo, permitindo a limpeza de registros e a exportação de dados para análise.

## User Review Required

> [!IMPORTANT]
> A funcionalidade de "Reset de Vendas" apagará permanentemente todos os registros de vendas, itens vendidos e movimentações de estoque associadas. Esta ação não poderá ser desfeita.

## Proposed Changes

### Admin Panel Improvements

#### 1. Faturamento & Vendas (Exportação)
- Adicionar um botão "Exportar Relatório (CSV)" na página de Faturamento ou Vendas.
- O relatório incluirá: ID da Venda, Data, Cliente, Itens (Quantidade x Produto), Valor Total e Status.
- Lógica client-side para gerar e baixar o arquivo CSV com base nos filtros atuais.

#### 2. Configurações (Reset de Vendas)
- Adicionar uma nova seção "Gerenciamento de Dados" na página de Configurações.
- Botão "Zerar Todas as Vendas" com um modal de confirmação "destrutivo" (exigindo que o usuário confirme a ação).
- Ação no servidor para limpar as tabelas `sales`, `sale_items` e `stock_movements` relacionadas de forma atômica.

### Technical Details

- **Nova Server Function:** `resetAllSales` em `src/lib/sales.functions.ts` usando `supabaseAdmin` para garantir permissões de deleção em massa.
- **Exportação CSV:** Utilizar uma função utilitária para converter o array de objetos de vendas em uma string formatada em CSV e disparar o download via Blob URL.
- **Segurança:** O reset de vendas será restrito a usuários com papel `admin` (já garantido pelo middleware do TanStack Start).

## Path to Verification

- **Teste de Exportação:** Gerar o CSV e verificar se as colunas e valores correspondem aos dados exibidos no painel.
- **Teste de Reset:** Executar a limpeza e verificar se o dashboard e as listagens de vendas aparecem vazios e se o estoque permanece consistente (ou se deve ser resetado também - a definir, assumindo que apenas o histórico de vendas é limpo).
