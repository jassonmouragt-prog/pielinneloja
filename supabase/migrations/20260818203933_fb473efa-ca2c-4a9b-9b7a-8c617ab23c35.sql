
-- Adicionar permissões explícitas de GRANT para o bucket e objetos
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;
