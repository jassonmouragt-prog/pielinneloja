# Plan - Final Fix for Product Add/Edit Permissions and Redirection

Despite setting up the storage bucket and RLS policies, the user still experiences errors when adding or editing products. My diagnosis reveals a potential authorization/redirection loop where even a valid admin session might be getting redirected to the login page during CRUD operations due to strict `beforeLoad` checks or missing permissions.

## Diagnosis
1. **Redirection Loop**: The automated test showed that even with a session injected, navigating to `/admin/produtos` results in a redirect to `/admin/login`. This suggests the `beforeLoad` guard in `_admin.tsx` is failing.
2. **Missing GRANTs**: Lovable Cloud requires explicit `GRANT` statements for the `authenticated` role for both tables and sequences. While I added some, there might be subtle gaps (e.g., sequences, specific function execute permissions).
3. **Session Persistence**: The diagnostic panel shows that session persistence might be getting interrupted if the `authenticated` role doesn't have permissions to read its own role or the products it's trying to edit.

## Proposed Actions

### 1. Database - Final Permission Pass
- Add a migration that:
    - Re-grants all permissions on the `public` schema tables and sequences to `authenticated` and `service_role`.
    - Ensures the `has_role` function is executable by `authenticated` users.
    - Double-checks that `stock_movements` and `product_images` have the necessary grants.

### 2. Admin Guard - Robust Role Verification (`src/routes/_admin.tsx`)
- Simplify the `beforeLoad` check to handle potential RPC failures more gracefully.
- Add more logging to help identify why the redirect is happening.

### 3. Product CRUD - Error Handling (`src/routes/_admin.admin.produtos.tsx`)
- I have already added detailed logging, but I will ensure use of the RPC `has_role` if direct queries continue to fail due to RLS/Grant issues.
- Verify the bucket name used in code matches exactly the one created.

## Validation Plan
1. Apply the database migration.
2. Run the automated test again with a fresh session to confirm the redirect loop is broken.
3. Manually verify (if possible via logs/preview) that the "Novo Produto" dialog saves correctly.
