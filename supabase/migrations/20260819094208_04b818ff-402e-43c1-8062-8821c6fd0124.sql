-- Fix overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Modify Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Re-create secure admin policies without hardcoded email bypass
CREATE POLICY "Admin Insert" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'product-images' AND 
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin Update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
    bucket_id = 'product-images' AND 
    public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admin Delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (
    bucket_id = 'product-images' AND 
    public.has_role(auth.uid(), 'admin')
);

-- Secure SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
