# Plano de Implementação: Páginas Institucionais e de Ajuda

Este plano detalha a criação das páginas solicitadas na seção "Institucional" e "Ajuda" do rodapé, garantindo que cada link leve a uma página específica e informativa.

## Alterações Propostas

### 1. Novas Rotas
Criar arquivos de rota para cada página listada no rodapé:
- **Institucional:**
  - `/sobre-nos`
  - `/politica-de-privacidade`
  - `/trocas-e-devolucoes`
  - `/perguntas-frequentes` (FAQ)
  - `/fale-conosco` (Contato)
- **Ajuda:**
  - `/como-comprar`
  - `/formas-de-pagamento`
  - `/prazo-de-entrega`
  - `/rastreamento`
  - `/cancelamentos`

### 2. Componentes de UI
- Criar um componente de layout base para as páginas institucionais (`InstitutionalLayout.tsx`) para manter a consistência visual (títulos, margens, cabeçalho e rodapé).

### 3. Conteúdo das Páginas
Preencher as páginas com textos padrão (placeholders estruturados) que podem ser editados posteriormente pelo administrador:
- **Sobre nós:** História da "Sua Lojinha Maakeup" e missão (preço único acessível).
- **Políticas/Trocas:** Textos legais e procedimentais padrão para e-commerce.
- **Contato:** Formulário simples ou botões diretos para WhatsApp/E-mail.

### 4. Atualização do Rodapé
Modificar `src/components/site/SiteFooter.tsx` para usar `<Link>` do TanStack Router em todos os itens das colunas "Institucional" e "Ajuda", substituindo as âncoras (`<a>`) atuais.

## Detalhes Técnicos
- Utilizar `createFileRoute` para cada nova página em `src/routes/`.
- Garantir que todas as rotas sigam o padrão de design existente (Tailwind CSS, fontes, paleta de cores rosa/creme).
- As rotas serão geradas automaticamente pelo TanStack Router após a criação dos arquivos.

```text
Exemplo de Estrutura de Pasta:
src/routes/
├── sobre-nos.tsx
├── politica-de-privacidade.tsx
├── trocas-e-devolucoes.tsx
... e assim por diante.
```
