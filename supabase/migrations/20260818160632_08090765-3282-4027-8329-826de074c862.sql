-- Grants e políticas finais (sem criar o bucket via SQL)

-- 1. Grants definitivos em esquemas e objetos
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 2. Políticas de Admin para Products (Select público, CRUD para admin)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Products" ON public.products;
CREATE POLICY "Public Select Products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Products" ON public.products;
CREATE POLICY "Admin CRUD Products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Políticas de Admin para Product Images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Select Product Images" ON public.product_images;
CREATE POLICY "Public Select Product Images" ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin CRUD Product Images" ON public.product_images;
CREATE POLICY "Admin CRUD Product Images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Políticas de Admin para Stock Movements
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin CRUD Stock Movements" ON public.stock_movements;
CREATE POLICY "Admin CRUD Stock Movements" ON public.stock_movements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Grants para o esquema storage
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;
GRANT ALL ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;

-- Políticas de storage
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
