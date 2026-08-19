# Plano de Correção: Interface de Variações de Produtos

O usuário relatou que não consegue digitar no campo "Nome da variação" e que o botão "Adicionar" opção não funciona. Analisando o código em `src/routes/_admin.admin.produtos.tsx`, identifiquei problemas na forma como o estado das variações é manipulado dentro do formulário `react-hook-form`.

## Problemas Identificados
1.  **Manipulação de Estado Manual:** O campo "Nome da variação" usa `onChange` manual para atualizar o valor no `react-hook-form`. Isso pode causar perda de foco ou problemas de re-renderização se não for feito corretamente.
2.  **Botão "Adicionar" dependente de DOM:** O botão "Adicionar" tenta buscar o input pelo `id` usando `document.getElementById`, o que não é a prática recomendada no React/Hook Form e pode falhar se houver múltiplos modais ou problemas de sincronização.
3.  **Complexidade do `watch`:** O uso de `form.watch('variations')` mapeado diretamente pode causar lentidão se houver muitas variações.

## Alterações Propostas

### 1. Refatoração do Gerenciamento de Variações
- Substituir a manipulação manual por `useFieldArray` do `react-hook-form`. Isso garantirá que o estado seja gerenciado de forma nativa pela biblioteca, resolvendo problemas de foco e digitação.
- Adicionar um estado local temporário para a "Nova Opção" em cada variação para evitar o uso de `document.getElementById`.

### 2. Melhoria da UX
- Garantir que ao clicar em "Adicionar", a opção seja incluída na lista e o campo de texto limpo.
- Corrigir a validação para permitir que o usuário digite livremente o nome da variação.

## Detalhes Técnicos
- Importar `useFieldArray` de `react-hook-form`.
- Utilizar `fields` do `useFieldArray` para mapear as variações.
- Criar um pequeno componente interno ou gerenciar o estado do input de "Nova Opção" de forma controlada.

## Verificação
- Testar a criação de uma nova variação (ex: "Cor").
- Testar a digitação do nome da variação.
- Testar a adição de múltiplas opções (ex: "Rosa", "Vermelho") via botão e via tecla Enter.
- Confirmar que os dados são salvos corretamente no Supabase.
