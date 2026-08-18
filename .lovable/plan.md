# Plano de Correção: Imagens dos Produtos

O usuário relatou que as imagens dos produtos não estão carregando corretamente (exibindo ícones de imagem quebrada). A investigação inicial indica que o bucket de armazenamento no banco de dados pode estar com o nome incorreto ou permissões insuficientes.

## Etapas de Diagnóstico e Correção

1.  **Verificar Buckets Existentes:**
    *   Listar todos os buckets no `storage.buckets` para identificar o nome correto (atualmente o código usa `product-images`, mas testes indicam que ele pode não existir ou estar inacessível).

2.  **Corrigir Configuração do Bucket:**
    *   Se o bucket correto for encontrado, garantir que ele seja **Público**.
    *   Se não existir, criar o bucket `product-images` como público usando a ferramenta apropriada.

3.  **Ajustar Políticas de RLS:**
    *   Garantir que a tabela `storage.objects` permita leitura pública para o bucket de produtos.
    *   Verificar permissões de `INSERT/UPDATE` para o papel `authenticated`.

4.  **Validar no Código:**
    *   Verificar se a URL gerada no `_admin.admin.produtos.tsx` e consumida no `Products.tsx` coincide com o domínio e bucket reais.
    *   Testar o upload e a exibição de um novo produto com imagem.

## Detalhes Técnicos

*   **Tabelas afetadas:** `storage.buckets`, `storage.objects`, `product_images`.
*   **Componentes afetados:** `src/routes/_admin.admin.produtos.tsx`, `src/components/site/Products.tsx`.
*   **Ferramentas:** `supabase--read_query`, `supabase--storage_create_bucket`, `supabase--migration`.
