-- The previous migration might have been too restrictive for RPC calls from the client.
-- We need to ensure the function is executable by the authenticated role so the RPC works.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Also ensure the user_roles table is readable for the user to see their own role.
-- (This was already there but we reinforce it to be sure).
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT ON public.user_roles TO authenticated;
