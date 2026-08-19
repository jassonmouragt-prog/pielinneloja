# Plano de Melhorias Admin: Gestão de Vendas e Faturamento

Este plano detalha a implementação do sistema de confirmação de vendas via WhatsApp, uma nova aba de faturamento com gráficos mensais e ajustes no dashboard administrativo.

## Mudanças Propostas

### 1. Gestão de Vendas (WhatsApp)
- **Status Clicável**: Na página de Vendas, o badge "pending" será transformado em um botão interativo.
- **Ações Rápidas**: Ao clicar, o administrador poderá "Confirmar" (baixando estoque) ou "Cancelar" a venda.
- **Automação de Estoque**: A confirmação de uma venda realizada pelo site agora processará automaticamente a saída dos produtos no estoque.

### 2. Nova Aba: Faturamento
- **Página Dedicada**: Criação de `/admin/faturamento` para análise financeira detalhada.
- **Gráficos de Performance**: Utilização de `recharts` para exibir o faturamento mensal e comparativos entre meses.
- **Relatórios Mensais**: Lista de faturamento agrupada por mês com totalizadores.

### 3. Dashboard Administrativo
- **Reset Mensal**: Garantir que o card "Faturamento (Mês)" exiba apenas dados do mês corrente, zerando automaticamente no dia 1º.
- **Integração**: Link direto para a nova aba de faturamento a partir do dashboard.

## Detalhes Técnicos

- **Backend**: Atualização das server functions em `src/lib/sales.functions.ts` para lidar com a mudança de status e atualização de estoque via `supabaseAdmin`.
- **Frontend**: 
    - Uso de `Recharts` para visualização de dados.
    - Componentes de UI (Shadcn) para modais de confirmação.
- **Database**: Filtros por data (`gte`, `lte`) nas queries do Supabase para garantir a precisão dos períodos mensais.

## Observações
- A lógica de "zerar" o faturamento será baseada na filtragem temporal das consultas ao banco de dados no momento do carregamento da página.
