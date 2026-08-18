# Plan - Fix Admin Navigation Reset

The user is reporting that clicking on "Produtos", "Estoque", or "Configurações" in the admin sidebar redirects them back to the login page, even though the dashboard itself opens correctly.

## Problem Analysis
- The dashboard route `/admin/dashboard` is working.
- Other routes like `/admin/produtos` are triggering a redirect to `/admin/login`.
- This usually happens because the `beforeLoad` guard in `src/routes/_admin.tsx` is failing for these specific sub-routes, possibly due to session hydration delays or inconsistencies in how sub-routes are checked.
- In `src/routes/_admin.tsx`, I added a `beforeLoad` that checks for a session and then calls an RPC `has_role`. If this check fails, it signs the user out and redirects to login.

## Proposed Changes

### 1. Optimize `src/routes/_admin.tsx` Authentication Guard
- Ensure that the session is refreshed if possible.
- Add more logging to identify exactly why the verification is failing on sub-routes.
- Consider caching the role check result or using a more robust way to verify admin status during navigation.

### 2. Update Sidebar Links to use TanStack `Link` component
- Currently, the sidebar uses `<a>` tags with `href`. This causes a full page reload or at least a browser-native navigation that might not preserve internal router state as cleanly as the `<Link>` component from `@tanstack/react-router`.
- Using `<Link>` will allow the router to handle the transition smoothly, likely preserving the session better.

### 3. Verify Route Path Consistency
- Ensure that the paths in `navItems` match the actual routes defined in `routeTree.gen.ts`.
- The dashboard is working at `/admin/dashboard`. The products route is at `/admin/produtos`.

## Technical Details
- Replace `<a>` with `Link` in `AdminLayout` (`src/routes/_admin.tsx`).
- Improve error handling in `beforeLoad`.
