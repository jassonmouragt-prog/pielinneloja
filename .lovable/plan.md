# Plan - Fix Admin Session Access

The goal is to fix the "This page didn't load" error when accessing the admin area from machines other than the development one. The investigation shows that while authentication works, the TanStack Router route guard (`beforeLoad`) might be failing due to race conditions in session hydration or permission checks.

## User Review Required

> [!IMPORTANT]
> The issue likely stems from how the browser handles the Supabase session across different domains or during the initial load (hydration). I will optimize the route guard to be more resilient.

- I will remove the emergency email bypass once we confirm the database roles are correctly set for the admin user.

## Proposed Changes

### Admin Session Guard
- Refactor `src/routes/_admin.tsx` to handle session hydration more robustly.
- Implement a cleaner fallback mechanism for `user_roles` check, ensuring that if a user is already authenticated as `sualojinhaadmin@admin.com`, they are treated as admin even if the database query fails temporarily.
- Ensure `beforeLoad` waits for the Supabase client to be ready if called on the client side.

### Authentication Flow
- Improve `src/routes/admin.login.tsx` to ensure `localStorage` is properly synchronized before redirecting to the dashboard.
- Add a explicit `await supabase.auth.getSession()` before navigation to ensure the internal state is consistent.

### Database Permissions (Verification)
- Ensure `GRANT SELECT ON public.user_roles TO authenticated` is active (I will re-run the grant if needed).
- Ensure `GRANT EXECUTE ON FUNCTION public.has_role TO authenticated` is active.

## Technical Details

- **File**: `src/routes/_admin.tsx` - Optimization of `beforeLoad` logic.
- **File**: `src/routes/admin.login.tsx` - Improved login-to-dashboard transition.
- **Library**: `@supabase/supabase-js` - Using `auth.onAuthStateChange` or explicit `getSession` calls to handle hydration.
- **Framework**: `@tanstack/react-router` - Utilizing `router.invalidate()` correctly after auth changes.

## Verification Plan

### Manual Verification
1. Open the preview URL in an incognito window or a different browser.
2. Log in using `sualojinhaadmin@admin.com`.
3. Verify that navigation between admin sub-pages (Dashboard, Products, Sales) works without redirection to login.
4. Verify that the "This page didn't load" error is gone.

### Automated Verification
1. Run a Playwright script to simulate login from a fresh session.
2. Check if the script successfully reaches the dashboard and navigates to `/admin/produtos`.
