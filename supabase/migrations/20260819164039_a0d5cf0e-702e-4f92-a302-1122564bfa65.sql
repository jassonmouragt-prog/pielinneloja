-- This is a workaround since we can't use the Supabase Auth API directly for password reset in this environment
-- We'll try to ensure the user exists and has the correct role first.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = 'd3c2ef39-bf82-47aa-98f2-fae877115be4') THEN
        INSERT INTO public.user_roles (user_id, role) VALUES ('d3c2ef39-bf82-47aa-98f2-fae877115be4', 'admin');
    END IF;
END $$;