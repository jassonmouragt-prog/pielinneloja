# Plano: Adição de Nome do Cliente no Fluxo de Compra e Dashboard

Este plano descreve as alterações necessárias para solicitar o nome do cliente antes de finalizar o pedido via WhatsApp e exibir esse nome no painel administrativo de vendas.

## Alterações

### 1. Backend (Supabase)
- A tabela `sales` já possui a coluna `customer_name` (verificado via `supabase--read_query`).
- Atualizar a função de servidor `registerPendingSale` em `src/lib/sales.functions.ts` para aceitar e salvar o campo `customerName`.

### 2. Frontend (Site)
- **src/components/site/CartDrawer.tsx**:
    - Adicionar um estado local para o nome do cliente.
    - Incluir um campo de entrada (input) no carrinho para o cliente digitar seu nome.
    - Validar se o nome foi preenchido antes de liberar o botão "Finalizar Pedido".
    - Enviar o nome para a função `registerPendingSale`.
    - Incluir o nome na mensagem enviada para o WhatsApp.

### 3. Painel Administrativo
- **src/routes/_admin.admin.vendas.tsx**:
    - Garantir que a listagem de vendas exiba o nome do cliente corretamente (já existe lógica parcial, mas vamos reforçar).
    - Exibir o nome de forma clara na tabela de vendas.

## Detalhes Técnicos

### Esquema de Validação (Zod)
```typescript
// src/lib/sales.functions.ts
export const registerPendingSale = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    customerName: z.string().optional(), // Novo campo
    totalAmount: z.number(),
    whatsappMessage: z.string(),
    items: z.array(...)
  }).parse(data))
```

### Componente de Interface (CartDrawer)
- Adicionar componente `Input` do Shadcn UI.
- Adicionar label "Seu Nome" acima do botão de finalizar.

## Verificação
- Testar o fluxo de compra no site e verificar se o nome aparece no banco de dados.
- Acessar `/admin/admin/vendas` e confirmar se o nome é exibido na lista.
