# Plan - Fixing Product Creation in Admin Dashboard

The user is unable to add new products in the admin panel. Based on previous logs and code inspection, this is likely due to RLS policies or permission issues on the `products`, `product_images`, or `stock_movements` tables, or issues with the storage bucket permissions.

## Proposed Changes

### Database Security
- Ensure `authenticated` users (admins) have full access to `products`, `product_images`, and `stock_movements`.
- Verify and fix RLS policies for the `product-images` storage bucket to allow admins to upload and delete images.
- Re-grant all privileges on the public schema to `authenticated` and `service_role` to ensure no permission gaps.

### Admin Dashboard (Product CRUD)
- Improve error reporting in `src/routes/_admin.admin.produtos.tsx` to display specific database errors (like RLS violations) to the user.
- Add additional logging to track the exact point of failure in the `onSubmit` handler.

### Verification
- Run a Playwright test to simulate product creation with an image upload.
- Verify the product appears on the home page and in the admin list.

## Technical Details
- SQL migration to widen `GRANT`s and fix `storage.objects` policies.
- UI updates to `src/routes/_admin.admin.produtos.tsx` for better UX during failures.
