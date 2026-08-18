
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
    DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Modify Access" ON storage.objects;
END
$$;

CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin Modify Access"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-images');
