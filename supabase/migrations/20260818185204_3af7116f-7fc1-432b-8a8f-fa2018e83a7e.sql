-- Add customer_name to sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Ensure RLS and Grants for the new feature
GRANT ALL ON public.sales TO authenticated;
GRANT ALL ON public.sale_items TO authenticated;
GRANT ALL ON public.stock_movements TO authenticated;

-- Ensure sequences are accessible for authenticated users
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
