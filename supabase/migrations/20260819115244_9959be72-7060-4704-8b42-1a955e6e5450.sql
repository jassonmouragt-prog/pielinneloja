ALTER TABLE public.products ADD COLUMN variations JSONB DEFAULT '[]'::jsonb;
GRANT UPDATE(variations) ON public.products TO authenticated;
GRANT SELECT(variations) ON public.products TO anon;
GRANT ALL ON public.products TO service_role;