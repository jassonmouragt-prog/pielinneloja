# Revisão de Responsividade e Ajustes Mobile

O objetivo é garantir uma experiência fluida em dispositivos móveis, tanto na área pública quanto na administrativa, corrigindo problemas de layout, navegação e interações identificados anteriormente.

## User Review Required

> [!IMPORTANT]
> A revisão de responsividade será feita simulando dispositivos móveis (320px a 768px). Se houver algum dispositivo específico que você queira priorizar, por favor me avise.

## Proposed Changes

### 1. Área Administrativa (Dashboard e Gestão)
- **Ajuste de Tabelas:** Implementar scroll horizontal suave em todas as tabelas (Produtos, Vendas, Faturamento) para evitar quebra de layout em telas pequenas.
- **Gráficos de Faturamento:** Tornar os gráficos responsivos (Recharts) para que se ajustem à largura do contêiner mobile.
- **Diálogos (Modais):** Garantir que os formulários de cadastro de produto e detalhes de venda ocupem 95% da largura da tela no mobile, com áreas de toque adequadas.
- **Sidebar Mobile:** Refinar o `Sheet` de navegação para que o fechamento ocorra imediatamente após o clique em um link.

### 2. Cabeçalho e Navegação Pública
- **Menu Mobile:** Ajustar o menu slide-in para garantir que as categorias sejam facilmente clicáveis.
- **Barra de Busca:** Otimizar o input de busca para não "empurrar" o logo em telas muito estreitas (iPhone SE).

### 3. Layout de Produtos e Categorias
- **Grid de Categorias:** Garantir que o grid de 3 colunas no mobile não cause sobreposição de texto.
- **Grid de Produtos:** Manter o layout de 2 colunas no mobile, ajustando o tamanho das fontes dos preços e botões "Adicionar" para evitar truncamento.

### 4. Banner Hero
- **Mobile Hero:** Ajustar o `aspect-ratio` do banner no mobile para garantir que o conteúdo visual principal não seja cortado excessivamente pelo `object-cover`.

## Technical Details
- Uso de classes utilitárias do Tailwind (e.g., `max-w-[100vw]`, `overflow-x-auto`, `text-xs sm:text-sm`).
- Ajustes no `src/routes/_admin.tsx` para gerenciar melhor o estado do menu mobile.
- Refinamento de componentes Shadcn (Table, Dialog) com classes customizadas para mobile.
