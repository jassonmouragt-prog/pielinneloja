# Plano de Implementação - Área Administrativa e Responsividade

O objetivo deste plano é completar as funcionalidades administrativas (CRUD de produtos, estoque, configurações) e tornar o painel administrativo totalmente responsivo para dispositivos móveis e tablets.

## 1. Funcionalidades Administrativas

### CRUD de Produtos
- Implementar diálogo de criação/edição de produtos em `src/routes/_admin.admin.produtos.tsx`.
- Adicionar suporte a upload de imagens via Supabase Storage (bucket `product-images`).
- Implementar funcionalidade de exclusão com confirmação.
- Integrar com as tabelas `products`, `categories` e `product_images`.

### Gerenciamento de Estoque
- Criar a página `src/routes/_admin.admin.estoque.tsx` para controle de entradas e saídas.
- Visualização de histórico de movimentações (tabela `stock_movements`).
- Atalhos para ajuste rápido de estoque.

### Configurações
- Criar a página `src/routes/_admin.admin.configuracoes.tsx`.
- Opções para gerenciar categorias (adicionar/remover).
- Configurações básicas da loja (contato WhatsApp, etc).

## 2. Responsividade do Painel

### Estrutura do Layout (`_admin.tsx`)
- Implementar menu lateral retrátil (Mobile Sidebar) usando `Sheet` do shadcn/ui.
- Cabeçalho mobile com botão de menu (hamburger).
- Garantir que o conteúdo principal (`main`) se ajuste corretamente em telas pequenas.

### Tabelas e Listas
- Adaptar as tabelas em `produtos` e `estoque` para scroll horizontal em mobile ou transformar em "cards" em telas muito pequenas.
- Otimizar formulários para exibição em coluna única no mobile.

## Detalhes Técnicos
- **Frontend:** React, TanStack Router, Tailwind CSS, Lucide Icons.
- **Backend:** Supabase (Auth, DB, Storage).
- **Componentes:** shadcn/ui (Dialog, Form, Select, Sheet, Table).

---
**Nota:** O fluxo de autenticação e redirecionamento já foi corrigido anteriormente, agora focaremos na usabilidade e completude das ferramentas de gestão.
