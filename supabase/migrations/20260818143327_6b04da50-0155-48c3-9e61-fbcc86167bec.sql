-- Securely restrict public access to sales and sale_items
-- Since these are managed by a server function (registerPendingSale) using service_role,
-- we can disable public INSERT/UPDATE/DELETE entirely and only allow admin SELECT.

-- 1. Sales table
DROP POLICY IF EXISTS "Anyone can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert own sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can manage sales" ON public.sales;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales" ON public.sales 
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Sale Items table
DROP POLICY IF EXISTS "Anyone can insert sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can insert own sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Admins can manage sale items" ON public.sale_items;

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sale items" ON public.sale_items 
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Stock Movements - ensure only admin can manage
DROP POLICY IF EXISTS "Admins can manage stock movements" ON public.stock_movements;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage stock movements" ON public.stock_movements 
FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- Ensure GRANTS are correct (Data API still needs access even if RLS blocks anon)
GRANT SELECT ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
GRANT SELECT ON public.sale_items TO authenticated;
GRANT ALL ON public.sale_items TO service_role;
GRANT SELECT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
