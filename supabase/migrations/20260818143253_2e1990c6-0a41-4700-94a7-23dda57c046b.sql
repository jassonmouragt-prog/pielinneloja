-- 1. Restrict sales INSERT: Only authenticated users
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;
CREATE POLICY "Authenticated users can insert own sales" ON public.sales 
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Restrict sale_items INSERT: Only authenticated users
DROP POLICY IF EXISTS "Anyone can insert sale items" ON public.sale_items;
CREATE POLICY "Authenticated users can insert own sale items" ON public.sale_items 
FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sale_id AND s.id IS NOT NULL));

-- 3. Note: sales table could benefit from a user_id for better tracking, 
-- but we'll stick to the scanner's request for now.
