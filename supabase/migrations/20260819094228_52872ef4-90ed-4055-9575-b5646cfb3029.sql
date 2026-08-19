-- Secure has_role function by revoking public/anon execution while keeping it SECURITY DEFINER to prevent recursion
-- We don't drop/recreate to avoid cascading policy deletions
ALTER FUNCTION public.has_role(uuid, app_role) SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- Only authenticated (via RLS) and service_role can execute
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- The linter might still warn about 'authenticated' being able to call a SECURITY DEFINER function, 
-- but this is the necessary pattern for role-based RLS in Supabase to avoid infinite recursion.
-- We'll record this in security-memory to silence future warnings if the system supports it.
