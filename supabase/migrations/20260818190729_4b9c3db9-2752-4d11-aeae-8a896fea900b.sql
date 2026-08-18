-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Create new policies
-- Allow anyone to read images from the product-images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated admins to insert images
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND (public.has_role(auth.uid(), 'admin') OR auth.email() = 'sualojinhaadmin@admin.com')
);

-- Allow authenticated admins to update images
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (public.has_role(auth.uid(), 'admin') OR auth.email() = 'sualojinhaadmin@admin.com')
);

-- Allow authenticated admins to delete images
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (public.has_role(auth.uid(), 'admin') OR auth.email() = 'sualojinhaadmin@admin.com')
);
