# Plan - Admin Dashboard and Supabase Integration

The user wants a full admin dashboard for managing products, categories, stock, and sales, using Supabase for the backend and authentication.

## Proposed Changes

### 1. Database Schema (Supabase)

#### Create Tables
- `profiles`: Store user roles (admin).
- `categories`: Manage product categories.
- `products`: Manage product details, pricing, and active status.
- `stock_movements`: Track stock history (entries, sales, adjustments).
- `sales`: Track sales initiated from WhatsApp.

### 2. Authentication

#### Admin User
- Email: `sualojinhaadmin@admin.com`
- Password: `raysl26`
- Role: `admin`

### 3. Routes & Pages

#### Admin Routes
- `/admin/login`: Admin authentication page.
- `/admin/dashboard`: Stats and summaries.
- `/admin/produtos`: Product CRUD and stock management.

### 4. Admin Layout

- Sidebar with icons: Dashboard, Products, Stock, Settings.
- Responsive, clean, minimalist design (white/light gray with existing brand accent colors).

### 5. Frontend Components (Admin)

#### Dashboard Components
- Summary cards (Revenue, confirmed sales, top products, low stock).
- Revenue chart.
- Top products ranking.
- Recent sales list.

#### Product Management
- List view with filters (search, category).
- CRUD modals for Products and Categories.
- Image upload (Supabase Storage).
- Stock adjustment controls.

### 6. Integration with Public Storefront

- Update `Products` and `Categories` components to fetch data from Supabase instead of the static `data.ts`.
- Update the "Buy" button (WhatsApp redirect) to log a "pending confirmation" sale in Supabase.

## Technical Details

### Database Migrations
- Create migration `20240818140600_admin_schema.sql` with tables, RLS, and initial data.
- Grant permissions for `authenticated` and `service_role`.

### State Management
- Use `useQuery` (TanStack Query) for data fetching and synchronization.
- Use `useServerFn` for privileged operations.

### Security
- RLS policies to restrict `/admin` routes and data access to the `admin` user.
- Middleware to handle protected routes.

## User Review Required

> [!IMPORTANT]
> - I will create the `sualojinhaadmin@admin.com` user.
> - I will move the existing static product data to the Supabase database.
> - The storefront will now be dynamic, reflecting changes made in the admin panel.

## Verification Plan

### Automated Tests
- Run `bun run build` to verify routes and types.
- Verify RLS policies with test queries.

### Manual Verification
- Log in as the admin user.
- Create, edit, and delete a product.
- Adjust stock and verify alerts.
- Simulate a WhatsApp purchase and verify the "pending" sale in the dashboard.
- Confirm a sale and verify stock deduction.
