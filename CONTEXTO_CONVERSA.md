# Contexto da Conversa - Projeto Sua Lojinha Maakeup

> Documento de continuidade. **Atualizado em 28/08/2026** (2ª sessão: variações, despesas, estoque).
> Este arquivo é o "estado atual" do projeto. Toda vez que a conversa for retomada, leia este arquivo primeiro.

---

## 1. Visão geral do projeto

**Nome:** Sua Lojinha Maakeup (`sualojinhamakeup-1`)
**Tipo:** E-commerce de maquiagem com painel admin
**Stack:**
- TanStack Start (React 19 + Vite 8)
- TypeScript
- Drizzle ORM + Neon (Postgres serverless)
- Auth custom (JWT via jose + bcryptjs)
- Cloudflare R2 (S3-compatible) para imagens
- Sonner (toasts)
- TailwindCSS 4
- TanStack Query, Router
- Bun (package manager local)
- Deploy: **Vercel** (com `vercel.json` para rewrites)

**Localização:** `C:\Users\Jasson Moura\Documents\SITE SUA LOJINHA\sualojinhamakeup-1`

---

## 2. Migração Supabase → Neon/R2 (CONCLUÍDA)

### 2.1 O que foi removido
- `@supabase/supabase-js`
- `src/integrations/supabase/` (todos os arquivos)
- `supabase/` (migrations antigas + edge function)
- `update_categories.ts`, `fix_security.sql`

### 2.2 O que foi criado
| Pasta/Arquivo | Propósito |
|---|---|
| `src/db/client.ts` | Cliente Drizzle + Neon HTTP |
| `src/db/schema.ts` | 8 tabelas + enum `app_role` |
| `src/db/migrations/` (gerado pelo drizzle-kit) | SQL migrations |
| `drizzle/0000_init.sql` | Migration inicial |
| `drizzle.config.ts` | Config do drizzle-kit |
| `scripts/migrate.ts` | Aplica migrations no Neon |
| `scripts/bootstrap.ts` | Cria `has_role()`, RLS, policies, seed admin/categorias |
| `scripts/reseed-categories.ts` | Recria categorias (idempotente) |
| `scripts/upload-static-assets.ts` | Sobe logo/hero/banner pro R2 |
| `src/lib/auth/auth.ts` | `signSessionToken`, `verifySessionToken`, `authenticateUser`, `hashPassword`, `getUserRole` |
| `src/lib/auth/auth-middleware.ts` | `requireAuth` (server function middleware) |
| `src/lib/auth/auth-attacher.ts` | `attachAuthToken` (client function middleware) |
| `src/lib/auth/auth.functions.ts` | `signIn`, `getCurrentSession`, `bootstrapAdmin` |
| `src/lib/auth/token-storage.ts` | Helpers de localStorage (client-only, sem deps de server) |
| `src/lib/storage/r2.ts` | `uploadFile`, `deleteFile` via AWS SDK |
| `src/lib/storage/public-url.ts` | `publicImageUrl` para resolver chaves R2 no browser |
| `src/lib/assets.ts` | `resolveAssetUrl` para `.asset.json` (logo/hero/banner) |
| `src/lib/queries.queries.ts` | Server functions de leitura (públicas + admin) |
| `src/lib/admin/admin.functions.ts` | `getAdminProfile`, `updateProductStock` |
| `src/lib/admin/admin.queries.ts` | `upsertProduct`, `deleteProduct`, `upsertCategory`, `deleteCategory`, `listCategoriesAdmin` |
| `src/lib/sales.functions.ts` | `registerPendingSale`, `updateSaleStatus`, `resetAllSales` |
| `src/lib/ranking.queries.ts` | `getTopSellingProducts` (top 3 do mês) |

### 2.3 Schema (8 tabelas)
- `users` (id, email UNIQUE, password_hash, created_at, updated_at)
- `user_roles` (id, user_id → users, role: 'admin'|'user')
- `categories` (id, name UNIQUE, image_url, tone, created_at, updated_at)
- `products` (id, name, subtitle, description, price, category_id, stock_quantity, status, variations JSONB, timestamps)
- `product_images` (id, product_id, url, is_main, created_at)
- `sales` (id, total_amount, status, whatsapp_message, customer_name, created_at, confirmed_at)
- `sale_items` (id, sale_id, product_id, quantity, price_at_sale, variations JSONB, created_at)
- `stock_movements` (id, product_id, quantity, type, sale_id, notes, created_at)

Enum: `app_role` = 'admin' | 'user'

### 2.4 Variáveis de ambiente (`.env`)
```
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=...
AUTH_SECRET=<32+ chars random>
JWT_SECRET=<mesmo do AUTH_SECRET>
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=sualojinha-images
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev (ou custom domain)
VITE_R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
```

### 2.5 Credenciais admin
- Email: `sualojinhaadmin@admin.com`
- Senha: `ChangeMe123!` (definida por `ADMIN_SEED_PASSWORD` se setado)
- ⚠️ **SEGURANÇA**: `.env` está COMMITADO no git com credenciais reais expostas. **Ação pendente**: rotacionar `AUTH_SECRET`, senha do banco Neon, credenciais R2, e adicionar `.env` ao `.gitignore`.

### 2.6 Comandos úteis
```bash
bun install
bun run db:generate      # gera SQL migration a partir do schema
bun run db:migrate       # aplica migrations no Neon
bun run db:bootstrap     # cria has_role, RLS, seed admin + categorias
bun run db:reseed-categories  # recria categorias (apaga antigas não-listadas)
bun run db:studio        # Drizzle Studio GUI
bun run assets:upload    # sobe logo/hero/banner pro R2
bun run dev              # dev server
```

---

## 3. Bugs corrigidos durante a migração

### 3.1 Buffer no client-side
- **Problema**: `Buffer.from(buffer, "base64")` em rotas client-side quebrava (Buffer não existe no browser)
- **Solução**: `base64ToBytes(b64)` usando `atob` + `Uint8Array` (em `admin.queries.ts`)
- **Solução 2**: no client-side (`produtos.tsx`, `configuracoes.tsx`), conversão manual com `String.fromCharCode` + `btoa`

### 3.2 Image URLs (Supabase → R2)
- **Problema**: URLs do Supabase Storage não funcionavam mais
- **Solução**: `publicImageUrl(key)` em `src/lib/storage/public-url.ts` aplica `VITE_R2_PUBLIC_BASE_URL` automaticamente
- **Aplicado em**: `Products.tsx`, `ProductModal.tsx`, `Categories.tsx`, `TopSelling.tsx`, `admin/produtos.tsx`, `admin/configuracoes.tsx`

### 3.3 Logo/Hero/Banner com ícone de imagem rachada
- **Problema**: `.asset.json` apontava para URLs do proxy Lovable (`/__l5e/...`) que não funcionam fora dele
- **Solução**:
  1. `resolveAssetUrl()` em `src/lib/assets.ts`
  2. Script `assets:upload` que baixa do Lovable e sobe no R2
  3. Atualizou os JSONs com `r2_key` apontando pro R2
  4. Aplicou em 5 componentes: `Hero`, `KitsBanner`, `SiteHeader`, `SiteFooter`, `_admin`, `admin.login`

### 3.4 Toaster não montado
- **Problema**: `toast.error` não aparecia porque `<Toaster />` nunca foi renderizado
- **Solução**: adicionado `<Toaster richColors position="top-right" />` no `__root.tsx` `RootShell`

### 3.5 Erro "This page didn't load" no Vercel
Auditoria completa encontrou 19 problemas. Corrigidos os CRÍTICOS:
1. `tokenStorage` separado em `token-storage.ts` (sem import de `@tanstack/react-start`)
2. `beforeLoad` de admin simplificado: não chama mais server fn no SSR
3. `useEffect` único de auth check no `_admin.tsx`
4. `isAdminEmail` bypass agora cria role row automaticamente
5. `Buffer` → `Uint8Array` (Edge-compatible)
6. `randomUUID` de `node:crypto` → `crypto.randomUUID()` (Web Crypto API)
7. Logs em `verifySessionToken` e `getCurrentSession`
8. `vercel.json` criado com rewrite para `/api/$1`

### 3.6 Race conditions no auth
- **Solução**: `beforeLoad` faz só `tokenStorage.get()` (client-only); `useEffect` chama `getCurrentSession` para validar o token

---

## 4. Mudanças da cliente (última leva)

### 4.1 Categorias
**Novas 9 categorias** (substituem as 7 antigas):
- Pele, Olhos, Lábios, Sobrancelhas, Perfumaria, Skincare, Cabelos, Corpo, Acessórios

**Mapeamento de cores/ícones (Lucide)** em `Categories.tsx`:
| Categoria | Cor (gradiente) | Ícone |
|---|---|---|
| Pele | pink-50 → rose-50 | Sparkles ✨ |
| Olhos | purple-50 → fuchsia-50 | Eye 👁 |
| Lábios | red-50 → rose-50 | Heart ❤️ |
| Sobrancelhas | amber-50 → yellow-50 | Brush 🖌 |
| Perfumaria | indigo-50 → violet-50 | SprayCan 🌫 |
| Skincare | sky-50 → cyan-50 | Droplet 💧 |
| Cabelos | emerald-50 → teal-50 | Wind 💨 |
| Corpo | orange-50 → amber-50 | Hand ✋ |
| Acessórios | fuchsia-50 → pink-50 | Gem 💎 |

### 4.2 "Preço único" → "Preço fixo"
- `SiteHeader.tsx:32` (texto da nav bar)
- `AnnouncementBar.tsx` (carrossel usa "PREÇO FIXO")

### 4.3 Badge "no Pix" nos preços
- `Products.tsx`: badge verde "no Pix" ao lado do preço nos cards
- `ProductModal.tsx`: badge verde "💰 no Pix" destacada
- `TopSelling.tsx`: badge igual nos cards do ranking
- **Decisão**: NÃO mostrar valor do cartão (apenas destacar o Pix)

### 4.4 Top 3 mais vendidos 🏆
- `src/lib/ranking.queries.ts`: server fn `getTopSellingProducts()` (soma `sale_items.quantity` agrupado por produto, filtra por `sales.status='confirmed'` e mês atual)
- `src/components/site/TopSelling.tsx`: componente com pódio 1º/2º/3º lugar
  - 1º: coroa dourada 👑
  - 2º: medalha prata
  - 3º: medalha bronze
  - Cards com gradiente sutil por posição
  - Aparece SÓ se houver vendas confirmadas no mês (senão fica oculto)
- Posicionado entre "Mais vendidos" e "Testimonials" no `index.tsx`

### 4.5 Carrossel dinâmico na nav bar
- `src/components/site/AnnouncementBar.tsx`
- 5 itens rotativos: PREÇO FIXO, TUDO BARATINHO, COMPRA SEGURA, PAGUE NO PIX, ENTREGA RÁPIDA
- Animação infinita via CSS `marquee-track` (30s loop)
- Gradientes nas bordas pra fade
- Otimizado com `will-change: transform`

### 4.6 Seta de scroll no Hero
- `Hero.tsx`: botão redondo branco semi-transparente no canto inferior central
- Animação `bounce-soft` (pula suave)
- `backdrop-blur-sm`
- Clique faz scroll pra `#categorias`

### 4.7 Cards de produto com hover "Adicionar"
- Em **desktop**: overlay rosa com botão branco "Adicionar" centralizado
- Imagem dá zoom (scale 110%)
- Em **mobile**: overlay aparece em `focus-visible` (acessibilidade)
- 500ms transition (suave)

### 4.8 Seção de Depoimentos
- `src/components/site/Testimonials.tsx`
- 6 depoimentos mockados (Mariana, Juliana, Beatriz, Camila, Larissa, Renata)
- Avatares com iniciais + gradiente
- Grid 3/2/1 (desktop/tablet/mobile)
- Paginação com setas anterior/próximo
- Posicionada entre `TopSelling` e `KitsBanner`

### 4.9 Otimizações mobile
- Carrossel com `will-change: transform` (GPU)
- Bounce-soft leve
- Botão Adicionar só em hover/focus (mobile-first)
- Seta do Hero com `active:scale-95` (feedback tátil)
- Depoimentos paginados (não 6 de uma vez)

---

## 5. Páginas/Rotas principais

- `/` (index) → Hero, Benefits, Categories, Products, TopSelling, Testimonials, KitsBanner, InstagramSection
- `/categoria/$slug` → categoria específica
- `/admin/login` → tela de login
- `/_admin` (layout) → guard com `useEffect` que valida token via `getCurrentSession`
  - `/admin/dashboard` → cards de stats + últimas vendas
  - `/admin/vendas` → listagem + criar nova venda
  - `/admin/faturamento` → gráficos mensais
  - `/admin/produtos` → CRUD de produtos
  - `/admin/estoque` → controle de estoque
  - `/admin/configuracoes` → categorias + zerar vendas

---

## 6. Pendências / Próximos passos

### 6.1 Segurança (URGENTE)
- [ ] Rotacionar `AUTH_SECRET` (gerar novo valor de 32+ chars)
- [ ] Rotacionar senha do banco Neon (criar novo user)
- [ ] Rotacionar credenciais R2 (gerar novo API token)
- [ ] Adicionar `.env` ao `.gitignore` e rodar `git rm --cached .env`

### 6.2 Deploy
- [ ] Commit + push de todas as mudanças
- [ ] Vercel vai pegar automaticamente (já tem `vercel.json` com rewrite)
- [ ] Confirmar que **todas** as env vars estão configuradas no painel do Vercel

### 6.3 Operacional
- [ ] Re-categorizar o produto que ficou sem categoria após o `db:reseed-categories` (o que estava em "Maquiagem")
- [ ] Fazer uma venda confirmada no admin pra testar o Top 3 (precisa de venda com status='confirmed' no mês)

### 6.4 Melhorias futuras sugeridas (não pedidas)
- Refresh token / expiração menor (atualmente 7 dias)
- Logout server-side com invalidação real (atualmente só limpa localStorage)
- Migrar de localStorage para cookie HttpOnly (mais seguro contra XSS)
- Sistema de cupons/descontos
- Webhook de status de pagamento
- Cache de role no server (evitar 3 queries por carregamento de página)

---

## 7. Estrutura de pastas (atual)

```
src/
├── components/
│   ├── site/
│   │   ├── AnnouncementBar.tsx     # carrossel dinâmico
│   │   ├── Benefits.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── Categories.tsx           # cores + ícones
│   │   ├── data.ts                  # navLinks + footerColumns
│   │   ├── Hero.tsx                 # com seta de scroll
│   │   ├── InstagramSection.tsx
│   │   ├── KitsBanner.tsx
│   │   ├── ProductModal.tsx
│   │   ├── Products.tsx             # hover com botão Adicionar
│   │   ├── SiteFooter.tsx
│   │   ├── SiteHeader.tsx           # usa AnnouncementBar
│   │   ├── Testimonials.tsx         # NOVO
│   │   └── TopSelling.tsx           # NOVO - Top 3 🏆
│   └── ui/                          # shadcn
├── db/
│   ├── client.ts
│   └── schema.ts
├── lib/
│   ├── admin/
│   │   ├── admin.functions.ts
│   │   └── admin.queries.ts
│   ├── auth/
│   │   ├── auth-attacher.ts
│   │   ├── auth-middleware.ts
│   │   ├── auth.functions.ts
│   │   ├── auth.ts
│   │   └── token-storage.ts
│   ├── storage/
│   │   ├── public-url.ts
│   │   └── r2.ts
│   ├── assets.ts                    # resolveAssetUrl
│   ├── queries.queries.ts
│   ├── ranking.queries.ts           # NOVO
│   └── sales.functions.ts
└── routes/
    ├── __root.tsx                   # com <Toaster />
    ├── _admin.tsx                   # guard
    ├── admin.login.tsx
    ├── categoria.$slug.tsx
    ├── index.tsx
    └── _admin.admin.*.tsx (6 páginas)

scripts/
├── bootstrap.ts
├── migrate.ts
├── reseed-categories.ts
└── upload-static-assets.ts

drizzle/0000_init.sql
vercel.json
```

---

## 8. Como retomar esta conversa

Quando o usuário voltar dizendo "vamos continuar de onde paramos":

1. **Ler este arquivo primeiro** para entender o estado
2. Confirmar com o usuário o que ele quer fazer
3. Se houver erro em produção, pedir logs do Vercel
4. Se houver mudança visual, perguntar **o que especificamente** mudou (categoria X, página Y, componente Z)
5. Sempre rodar `node_modules\.bin\tsc --noEmit` após mudanças

### Padrões do projeto
- Não usar `Buffer` no client-side
- Não usar `node:crypto` (usar `crypto.randomUUID()`)
- Sempre usar `publicImageUrl()` para imagens R2
- Sempre usar `resolveAssetUrl()` para `.asset.json`
- Server fns com `useServerFn` + `useQuery`
- Toast via `sonner` (`toast.success`/`toast.error`)
- Tokens em `localStorage` via `tokenStorage` (key: `sualojinha_token`)
- Sempre fazer `git status` antes de commit
- Sempre rodar `bun run db:reseed-categories` se cliente pedir mudança de categorias

### Comandos para debugar
```bash
# Logs do Vercel
vercel logs <url>

# Verificar env vars no Vercel
vercel env ls

# Forçar redeploy
vercel --force
```

---

## 9. Variações + Estoque + Despesas (sessão 2)

### 9.1 Tabelas adicionadas (migration 0001)
- **`product_variations`**: id, product_id → products, variation_name, option_value, **stock individual**, sort_order, timestamps
  - UNIQUE INDEX em (product_id, variation_name, option_value)
- **`expenses`**: id, type (enum), description, amount, expense_date, notes, timestamps
  - INDEX em type e expense_date
- Enums adicionados:
  - `expense_type`: funcionaria | fornecedores | agua | luz | internet | aluguel | marketing | impostos | outros

### 9.2 Server functions novas
- `src/lib/product-variations.queries.ts`:
  - `listProductVariations({ productId })` — lista variações
  - `syncProductVariations({ productId, variations })` — apaga todas e recria (transação); soma estoque total no `products.stockQuantity`
  - `getProductWithVariations({ productId })` — busca produto + variações agrupadas
- `src/lib/expenses.queries.ts`:
  - `listExpenses({ type?, from?, to?, limit? })`
  - `createExpense({ type, description, amount, expenseDate?, notes? })`
  - `deleteExpense({ id })`
  - `getExpensesSummary({ from?, to? })` — agrupado por tipo
- Adicionado em `src/lib/queries.queries.ts`:
  - `getDashboardSummary()` — retorna `{ revenue, totalExpenses, netProfit, confirmedCount, pendingCount }` do mês atual

### 9.3 Comportamento do admin de produtos
- `src/routes/_admin.admin.produtos.tsx`:
  - Form de variações atualizado: cada opção tem input de **estoque individual**
  - Ao salvar: `upsertProduct` → `syncProductVariations` (sincroniza variações + atualiza estoque total)
  - Ao editar: `loadProductVariations(productId)` carrega as variações do banco pro form
- `src/routes/_admin.admin.despesas.tsx` (página `/admin/despesas`):
  - 1 card: "Despesas deste mês" (sem cards extras de tipo)
  - Filtros: **Mês** (mês atual + últimos 12 meses) + **Tipo** (9 opções)
  - Botão "Limpar filtros" quando algum filtro está ativo
  - Tabela com data, tipo (com ícone + cor), descrição, valor, ações
  - Modal de criação com 9 tipos no select, cada um com ícone e cor

### 9.4 Comportamento do site público
- `src/components/site/Products.tsx`:
  - Cards **abrem modal ao clicar** (não mais hover-only) — mobile-friendly
  - Hover: scale 105% na imagem + scale 0.98 no active (feedback tátil)
- `src/components/site/ProductModal.tsx`:
  - **Seletor de variações obrigatório** se o produto tem variações
  - Cada opção mostra: nome + **"X em estoque"** abaixo
    - Cor normal: cinza
    - Estoque baixo (≤3): amarelo
    - Esgotado (0): vermelho + "Esgotado" + ícone de X + **line-through** + cursor not-allowed + disabled
  - Botão "Adicionar" desabilitado se: faltam opções OU alguma selecionada está esgotada
  - Aviso dinâmico "X em estoque" ou "Apenas X em estoque" (≤3) abaixo do preço
  - **Seletor de quantidade** com `−` `quantidade` `+` limitado ao estoque da seleção
  - Botão mostra "Adicionar X ao carrinho" quando quantity > 1
- `src/hooks/useCart.ts`:
  - `addItem(product, quantity?)` agora aceita quantidade (default 1)
  - Persistência via Zustand (localStorage) com `cart-storage`

### 9.5 Backend updates importantes
- `src/lib/queries.queries.ts` — `listPublicProducts`:
  - Faz JOIN com `product_variations` e injeta `stockByOption: Record<optionValue, stock>` em cada variação
  - Formato final da variação pro client: `{ name, options, stockByOption }`
- `src/lib/admin/admin.queries.ts` — `upsertProduct`:
  - Aceita variations com `options` como `string[]` OU `Array<{value, stock}>` (compatibilidade com produtos antigos)
  - Faz normalização interna: `o => typeof o === "string" ? o : o.value`

### 9.6 Dashboard atualizado (`/_admin/admin/dashboard`)
6 cards em grid responsivo:
1. Faturamento (Mês) - verde - `/admin/faturamento`
2. Despesas (Mês) - vermelho - `/admin/despesas`
3. Lucro Líquido ou Prejuízo - verde/vermelho (dinâmico) - `/admin/faturamento`
4. Vendas Pendentes - amarelo - `/admin/vendas`
5. Estoque Baixo - vermelho - toggle
6. Total de Produtos - rosa

### 9.7 Faturamento atualizado (`/_admin/admin/faturamento`)
- 4 cards: Receita (verde) / Despesas (vermelho) / Lucro (verde-vermelho) / Ticket Médio
- Gráfico de barras com 3 séries: Receita / Despesas / Lucro
- Resumo mensal: `+R$ receita / -R$ despesa / =R$ lucro` por mês

### 9.8 Menu lateral admin atualizado
Links: Dashboard | Vendas | Faturamento | **Despesas** | Produtos | Estoque | Configurações

---

## 10. Padrões de erro comuns (pra evitar)

### 10.1 "variations: 0, options: 0 — Expected string, received object"
**Causa**: server fn `upsertProduct` esperava `options: string[]` mas o form admin envia `options: { value, stock }[]`
**Solução**: server fn usa `z.union([z.string(), z.object({...})])` e normaliza internamente

### 10.2 Rotas TanStack Router "not assignable to keyof FileRoutesByPath"
**Causa**: types do TanStack Router ainda não foram regenerados após criar nova rota
**Solução**: rodar `npx @tanstack/router-cli generate` OU rodar `tsc --noEmit` que re-gera (deixar o typecheck resolver)

### 10.3 "Type 'any' is missing the following properties"
**Causa**: schema Zod opcional vs obrigatório. `stock: z.coerce.number().default(0)` gera `stock?: number` mas o form envia `stock: number`
**Solução**: usar `z.number()` direto (sem `.default()`) quando o form sempre envia o valor

### 10.4 Buffer/Node no client
**NUNCA** usar `Buffer` ou `node:crypto` em código que vai pro client bundle
**Sempre** usar `atob` + `Uint8Array` (browser) ou `crypto.randomUUID()` (Web Crypto API)

### 10.5 localStorage no SSR
**NUNCA** acessar `window.localStorage` direto, sempre via `tokenStorage.get()` que tem guard `typeof window`

---

**Última atualização:** 28/08/2026 - Sessão 2 finalizada (variações com estoque, despesas, lucro líquido, modal melhorado). Commit + push automáticos, aguardando deploy do Vercel.
