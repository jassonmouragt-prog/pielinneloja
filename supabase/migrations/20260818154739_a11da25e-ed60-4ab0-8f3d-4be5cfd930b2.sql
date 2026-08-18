-- Políticas de RLS para o bucket product-images

-- Permitir leitura pública das imagens
CREATE POLICY "Public Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Permitir que usuários autenticados (admin) façam upload
CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permitir que usuários autenticados (admin) atualizem suas imagens
CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permitir que usuários autenticados (admin) excluam imagens
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
