# Plan - Fix Admin Redirection and Access

The user is reporting that the admin login still doesn't redirect to the dashboard. Investigation shows the user exists and has the admin role, but the redirection logic might be failing due to how session persistence is handled or route path mismatches.

## Proposed Changes

### Database & Permissions
- Verify `has_role` function is working as intended via `SECURITY DEFINER`.
- Ensure `authenticated` role has `EXECUTE` permission on `has_role`.

### Authentication & Redirection (`src/routes/admin.login.tsx`)
- Replace `window.location.assign('/admin/dashboard')` with `router.navigate({ to: '/admin/dashboard' })` or a more standard TanStack Router approach.
- Ensure the session is fully established before attempting redirection.
- Improve error handling for the role verification step.

### Admin Layout & Guard (`src/routes/_admin.tsx`)
- Refine the `beforeLoad` guard to handle potential race conditions during session hydration.
- Ensure it correctly matches the actual route structure (the routes are nested under `/_admin` but the paths start with `/admin/`).

### Route Structure
- Verify `src/routes/_admin.admin.dashboard.tsx` is correctly handled by the router (it seems it is, based on `routeTree.gen.ts`).

## Technical Details
- TanStack Router `redirect` in `beforeLoad` vs client-side `navigate`.
- Supabase session persistence in `localStorage`.
- Security Definer functions for RLS bypass.
