# Migração Supabase → Neon + Cloudflare R2

Este projeto foi migrado de **Supabase** (Auth + Postgres + Storage) para uma stack totalmente serverless-friendly:

| Camada | Antes (Supabase) | Depois |
|---|---|---|
| Banco de dados | Supabase Postgres | **Neon Postgres** (serverless) |
| ORM | PostgREST (auto API) | **Drizzle ORM** |
| Auth | Supabase Auth (JWT) | **Custom JWT + bcryptjs** (jose) |
| Storage | Supabase Storage | **Cloudflare R2** (S3-compatible) |
| RLS | Supabase RLS | Postgres RLS (BYPASSRLS no app user) |

## Setup Pós-Migração

### 1. Criar projeto Neon

1. Acesse https://neon.tech e crie um novo projeto
2. Copie a **connection string** (formato: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
3. Cole em `DATABASE_URL` no `.env`

### 2. Configurar Cloudflare R2

1. No dashboard Cloudflare → R2 → Create bucket (ex: `sualojinha-images`)
2. Em R2 → Manage R2 API Tokens → Create API Token (perms: Object Read & Write)
3. Copie:
   - `R2_ACCOUNT_ID` (da URL do dashboard R2)
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
4. **Opcional**: Configure um domínio customizado para acesso público (ex: `https://images.sualojinha.com`) e use em `R2_PUBLIC_BASE_URL` e `VITE_R2_PUBLIC_BASE_URL`

### 3. Configurar `.env`

```bash
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="GERE-UMA-STRING-ALEATORIA-FORTE-DE-PELO-MENOS-32-CARACTERES"

R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="sualojinha-images"
R2_PUBLIC_BASE_URL="https://images.sualojinha.com"
VITE_R2_PUBLIC_BASE_URL="https://images.sualojinha.com"
```

### 4. Rodar migrations + bootstrap

```bash
bun install
bun run db:generate   # já gerado em drizzle/0000_init.sql — só precisa se mudar o schema
bun run db:migrate    # cria as 8 tabelas no Neon
bun run db:bootstrap  # cria função has_role, habilita RLS, cria policies, semeia admin e categorias padrão
```

**Credenciais admin criadas pelo bootstrap**:
- Email: `sualojinhaadmin@admin.com`
- Senha: `ChangeMe123!` (defina `ADMIN_SEED_PASSWORD` no `.env` antes de rodar para customizar)

### 5. Desenvolvimento

```bash
bun run dev
```

## Arquitetura

### Estrutura de pastas (novos)

```
src/
├── db/
│   ├── client.ts        # drizzle + neon-http (server only)
│   └── schema.ts        # 8 tabelas + enum app_role
├── lib/
│   ├── auth/
│   │   ├── auth.ts              # bcrypt + jose (signSessionToken, verifySessionToken, authenticateUser)
│   │   ├── auth-middleware.ts   # requireAuth (server function middleware)
│   │   ├── auth-attacher.ts     # attachAuthToken (client function middleware) - injeta Bearer no header
│   │   └── auth.functions.ts    # signIn, getCurrentSession, bootstrapAdmin
│   ├── storage/
│   │   ├── r2.ts                # uploadFile, deleteFile, buildPublicUrl
│   │   └── public-url.ts        # publicImageUrl (browser-side resolver)
│   ├── queries.queries.ts       # Server functions de leitura (públicas + admin)
│   ├── admin/
│   │   ├── admin.functions.ts   # getAdminProfile, updateProductStock
│   │   └── admin.queries.ts     # upsertProduct, deleteProduct, upsertCategory, etc.
│   └── sales.functions.ts       # registerPendingSale, updateSaleStatus, resetAllSales
drizzle/                         # SQL migrations geradas pelo drizzle-kit
scripts/
├── migrate.ts            # aplica migrations no Neon
└── bootstrap.ts          # função has_role + RLS + seed inicial
```

### Fluxo de Auth

1. **Login** (`POST /admin/login`):
   - Frontend chama `signIn` server function com email/senha
   - Server valida com `bcrypt.compare`, busca role em `user_roles`
   - Server assina JWT (jose, HS256, 7d) com `{ sub, email, role }`
   - Frontend armazena token em `localStorage` (`sualojinha_token`)
2. **Requisições subsequentes**:
   - `attachAuthToken` middleware (client) adiciona `Authorization: Bearer <token>` em toda serverFn
   - `requireAuth` middleware (server) valida token via `verifySessionToken`, busca role, rejeita se não for admin
3. **Logout**: limpa `localStorage` e redireciona

### Como o RLS funciona no Neon

Diferente do Supabase (que tem um `service_role` que bypassa RLS automaticamente), no Neon:

- A connection string do app **deve usar um usuário com `BYPASSRLS`** para fazer queries de admin
- As policies de RLS ficam ativas mas são bypassadas no app
- Para o futuro, se quiser usar PostgREST/Drizzle com RLS por usuário, basta criar roles adicionais

**Workaround aplicado**: o `bootstrap.ts` cria as policies de RLS (caso queira usar no futuro com roles diferentes), mas o `db/client.ts` usa a connection principal com `BYPASSRLS`.

## Endpoints Server (substituindo PostgREST)

Todos os dados passam por **TanStack Start server functions** com `useServerFn`:

### Públicos (sem auth)
- `listCategories()` → `GET /_serverFn/listCategories`
- `listPublicProducts({ categoryId?, limit? })`

### Admin (com `requireAuth`)
- `listAdminProducts()`, `listAdminProductsMinimal()`, `listProductsForStock()`
- `listStockMovements()`, `listSales()`, `getRecentSales()`, `getMonthSalesStats()`
- `getProductsForDashboard()`, `getBillingData()`
- `getAdminProfile()`, `updateProductStock()`
- `upsertProduct()` (recebe imagem em base64), `deleteProduct()`
- `upsertCategory()` (recebe ícone em base64), `deleteCategory()`, `listCategoriesAdmin()`
- `registerPendingSale()`, `updateSaleStatus()`, `resetAllSales()`

## Mudanças de API em relação ao Supabase

- **Sem mais `supabase.from(...)`** — todos os componentes agora chamam `useServerFn(fn)` com `useQuery`
- **Storage de imagens via R2**: o upload agora envia a imagem em **base64** pelo serverFn (mais simples que presigned URLs para este caso)
- **URLs de imagens**: salvas como **chave R2** (ex: `products/abc-123.jpg`) no banco. Para resolver no browser, use `publicImageUrl(key)` que aplica `VITE_R2_PUBLIC_BASE_URL` automaticamente
- **Auth localStorage key**: mudou de `sb-*-auth-token` para `sualojinha_token`

## Comandos úteis

```bash
bun run dev              # dev server
bun run build            # production build
bun run db:generate      # gera nova SQL migration a partir de src/db/schema.ts
bun run db:migrate       # aplica migrations no Neon
bun run db:bootstrap     # roda RLS + seed inicial (idempotente)
bun run db:studio        # Drizzle Studio (GUI do banco)
bun run lint
```
