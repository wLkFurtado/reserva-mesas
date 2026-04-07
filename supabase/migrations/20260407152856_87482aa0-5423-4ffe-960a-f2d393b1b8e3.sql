INSERT INTO public.profiles (id, email, role, full_name, display_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@troia.com', 'admin', 'Admin', 'Admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';