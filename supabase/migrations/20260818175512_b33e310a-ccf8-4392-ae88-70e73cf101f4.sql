
-- Ensure all tables have proper grants
GRANT ALL ON TABLE public.products TO authenticated, service_role;
GRANT ALL ON TABLE public.product_images TO authenticated, service_role;
GRANT ALL ON TABLE public.stock_movements TO authenticated, service_role;
GRANT ALL ON TABLE public.categories TO authenticated, service_role;
GRANT ALL ON TABLE public.sales TO authenticated, service_role;
GRANT ALL ON TABLE public.sale_items TO authenticated, service_role;
GRANT ALL ON TABLE public.user_roles TO authenticated, service_role;

-- Ensure sequences are accessible for inserts
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Policy: Allow public read access to images
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy: Allow authenticated users to upload images
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Insert Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated Insert Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy: Allow authenticated users to update images
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Update Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy: Allow authenticated users to delete images
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Delete Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Authenticated Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
    END IF;
END $$;
