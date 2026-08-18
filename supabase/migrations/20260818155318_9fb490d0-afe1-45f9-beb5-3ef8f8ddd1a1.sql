-- Garantir que o usuário sualojinhaadmin@admin.com tenha a role admin
-- Isso resolve redirecionamentos se a role tiver sido perdida ou não atribuída corretamente

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obter o ID do usuário
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'sualojinhaadmin@admin.com';
  
  IF v_user_id IS NOT NULL THEN
    -- Garantir a role admin na tabela user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;
