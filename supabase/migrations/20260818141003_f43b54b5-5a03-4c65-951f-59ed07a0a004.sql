-- Revoke EXECUTE from anon and authenticated roles for the SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon, authenticated;

-- Ensure only service_role can execute it (it's used in RLS policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
