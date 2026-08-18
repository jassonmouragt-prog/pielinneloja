# Plan - Fix Product Add/Edit Errors

The user reports that an error persists when adding or editing products. Based on previous turns, we successfully created the `product-images` storage bucket and applied RLS policies. However, there might be a few remaining issues:
1. **RLS Policies for Tables**: Ensure that the `authenticated` role (admin) has proper `GRANT` permissions on all relevant tables (`products`, `product_images`, `stock_movements`).
2. **Missing `GRANT` statements**: Lovable Cloud requires explicit `GRANT` statements for the `authenticated` role to access tables in the `public` schema.
3. **Storage Bucket Accessibility**: Ensure the `product-images` bucket is correctly configured and the frontend is handling errors gracefully.

## Technical Details
- **Frontend**: Improve error logging in `src/routes/_admin.admin.produtos.tsx` to help identify the exact point of failure.
- **Backend**: Update database permissions.

## Proposed Changes

### 1. Database Permissions (`supabase/migrations/...`)
- Add a new migration to ensure all admin-related tables have the correct `GRANT` permissions for the `authenticated` role.
- Specifically: `GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.product_images, public.stock_movements TO authenticated;`
- Also ensure `service_role` has full access.

### 2. Frontend Debugging & Refinement (`src/routes/_admin.admin.produtos.tsx`)
- Enhance the `onSubmit` handler to log the full Supabase error object to the console.
- Check for potential null/undefined issues during the save process.

## Validation Plan
- I will attempt to reproduce the error or look for specific error logs in the browser.
- Once permissions are applied, I will verify if the add/edit flow works.
