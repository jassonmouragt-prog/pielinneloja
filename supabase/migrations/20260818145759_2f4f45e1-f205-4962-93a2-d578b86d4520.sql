-- The linter warns about authenticated users executing a security definer function.
-- However, has_role IS intended to be used by the engine during RLS checks.
-- To satisfy the linter and be more secure, we revoke PUBLIC execute and only allow it for roles that need it.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
