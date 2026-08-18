
-- Reset permissions for all public tables
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions for authenticated users on relevant tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Grant permissions for anon users where needed
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.categories TO anon;

-- Ensure sequences are usable for inserts by authenticated users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Simplify RLS for products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can select active products" ON public.products;
DROP POLICY IF EXISTS "Admin CRUD Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete" ON public.products;
DROP POLICY IF EXISTS "Admin Update" ON public.products;
DROP POLICY IF EXISTS "Public Select Products" ON public.products;

CREATE POLICY "Admins manage products" ON public.products
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read products" ON public.products
FOR SELECT TO anon, authenticated USING (status = 'active');

-- Simplify RLS for product_images
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can select product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin CRUD Product Images" ON public.product_images;
DROP POLICY IF EXISTS "Admin Delete" ON public.product_images;
DROP POLICY IF EXISTS "Public Select Product Images" ON public.product_images;

CREATE POLICY "Admins manage product images" ON public.product_images
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read product images" ON public.product_images
FOR SELECT TO anon, authenticated USING (true);
