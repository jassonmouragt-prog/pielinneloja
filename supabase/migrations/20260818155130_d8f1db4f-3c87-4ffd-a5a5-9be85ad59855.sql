-- Garantir permissões de acesso para o administrador
-- Supabase no Lovable Cloud exige GRANTs explícitos para o PostgREST (Data API)

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.categories TO service_role;
GRANT ALL ON public.product_images TO service_role;
GRANT ALL ON public.stock_movements TO service_role;
GRANT ALL ON public.user_roles TO service_role;

-- Se houver sequências (IDs auto-incremento), precisamos de permissão nelas também
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
