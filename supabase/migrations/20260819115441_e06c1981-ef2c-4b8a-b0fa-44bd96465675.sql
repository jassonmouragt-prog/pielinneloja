ALTER TABLE public.sale_items ADD COLUMN variations JSONB DEFAULT NULL;
GRANT UPDATE(variations) ON public.sale_items TO authenticated;
GRANT SELECT(variations) ON public.sale_items TO anon;
GRANT ALL ON public.sale_items TO service_role;