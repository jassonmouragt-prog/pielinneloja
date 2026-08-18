# Plan - Registro de Venda por WhatsApp

Implementar uma interface administrativa para registrar vendas realizadas via WhatsApp, integrando com o controle de estoque e faturamento já existentes no sistema.

## User Review Required

> [!IMPORTANT]
> - O registro de vendas afetará diretamente o estoque dos produtos.
> - As vendas serão registradas com status "Concluída" por padrão, mas permitiremos alteração.
> - O nome do cliente será um campo opcional para melhor acompanhamento.

## Proposed Changes

### Database & Schema
- Utilizar as tabelas existentes `sales`, `sale_items` e `stock_movements`.
- Garantir que as permissões (RLS) permitam a inserção de novas vendas pelo administrador.

### Admin Interface
- **Nova Rota:** Criar `src/routes/_admin.admin.vendas.tsx` para listagem e novo registro de vendas.
- **Formulário de Venda:**
    - Seleção de múltiplos produtos com busca/autocomplete.
    - Ajuste de quantidade por item.
    - Cálculo automático de preço total baseado nos preços unitários.
    - Campos para Nome do Cliente (opcional) e Data da Venda.
    - Status da venda (Pendente, Concluída, Cancelada).
- **Integração de Estoque:** Ao salvar uma venda "Concluída", gerar automaticamente movimentos de saída no estoque para cada item.

### Navigation
- Adicionar o item "Vendas" à sidebar administrativa em `src/routes/_admin.tsx`.

### Dashboard Integration
- Atualizar os cards de faturamento no Dashboard para refletir as vendas registradas manualmente.

## Technical Details

- **Components:** Uso de `Dialog`, `Command` (para busca de produtos), `Form`, e `Table` do shadcn/ui.
- **State Management:** React Hook Form com validação Zod.
- **Backend:** Transação via Supabase para garantir que a venda, os itens da venda e a movimentação de estoque sejam processados juntos.

## Constraints & Considerations
- Apenas usuários com papel `admin` poderão acessar esta funcionalidade.
- O sistema já possui uma tabela `sales`, então estenderemos seu uso que antes era focado apenas em logs de checkout.
