-- Final Grant Pass para garantir acesso total ao admin autenticado

-- 1. Grant em Tabelas e Views
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 2. Grant em Sequences (para IDs auto-incremento)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. Grant de Execução em Funções (para o RPC has_role)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 4. Garantir que as tabelas específicas existam e tenham RLS configurado corretamente
-- (Muitas vezes o erro de alteração de produto é falta de política de UPDATE)

DO $$ 
BEGIN
    -- Garantir políticas de UPDATE/DELETE se não existirem
    -- Products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admin Update') THEN
        CREATE POLICY "Admin Update" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admin Delete') THEN
        CREATE POLICY "Admin Delete" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    -- Product Images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_images' AND policyname = 'Admin Delete') THEN
        CREATE POLICY "Admin Delete" ON public.product_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
