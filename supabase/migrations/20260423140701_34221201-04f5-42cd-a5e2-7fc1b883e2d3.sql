INSERT INTO public.user_roles (user_id, role)
VALUES ('90c2958a-2d78-43bf-b63d-ab82664bb276', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;