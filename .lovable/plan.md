# Plano: Melhoria de Categorias e Detalhes de Produto

Este plano visa aprimorar a experiência de navegação por categorias e a visualização detalhada de produtos no site, tornando a interface mais intuitiva e informativa.

## 1. Ícones para Categorias em Destaque

### O que será feito
- Adição de ícones visuais para as categorias na seção "Categorias em destaque" da página inicial.
- Os ícones serão configuráveis através do painel administrativo.

### Detalhes técnicos
- Atualização do componente `Categories.tsx` para renderizar ícones/imagens dinâmicas vindas do banco de dados.
- Modificação da página de configurações administrativa (`_admin.admin.configuracoes.tsx`) para permitir o upload e gerenciamento de imagens para cada categoria.

## 2. Redirecionamento de Categorias

### O que será feito
- Garantir que todas as chamadas de categoria (na home e no menu) apontem corretamente para a rota `/categoria/$slug`.
- Padronização da geração de slugs para evitar erros de navegação.

### Detalhes técnicos
- Refatoração do `Categories.tsx` para usar o componente `<Link>` do TanStack Router em vez de âncoras `#`.
- Ajuste na lógica de mapeamento de nomes de categoria para slugs na `SiteHeader.tsx` e `Categories.tsx`.

## 3. Detalhes do Produto em Aba de Destaque (Quick View)

### O que será feito
- Implementação de uma visualização detalhada do produto (Quick View) que abre ao clicar no card do produto.
- A visualização incluirá imagem ampliada, descrição completa e botão de compra.

### Detalhes técnicos
- Criação de um novo componente `ProductModal.tsx` utilizando `Dialog` do shadcn/ui.
- Atualização do componente `Products.tsx` para gerenciar o estado do modal e passar os dados do produto selecionado.
- Garantia de que o fluxo de "Adicionar ao Carrinho" funcione perfeitamente de dentro do modal.

## Experiência do Usuário (Resumo)
1. **Navegação Visual:** O usuário identifica categorias mais rápido através de ícones.
2. **Foco no Conteúdo:** Ao clicar em uma categoria, o usuário vê apenas o que lhe interessa em uma página dedicada.
3. **Decisão de Compra:** O usuário pode ler detalhes sobre um produto sem sair da página atual, agilizando o processo de adicionar múltiplos itens ao carrinho.
