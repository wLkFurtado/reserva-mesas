-- Ensure bcrypt hashing is available via pgcrypto
-- Fix password and role for existing admin user

-- 1) Update the password for admin@troia.com to a known value and confirm email
UPDATE auth.users
SET 
  encrypted_password = crypt('admin123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  banned_until = NULL
WHERE email = 'admin@troia.com';

-- 2) Promote this user to admin in profiles
UPDATE public.profiles p
SET 
  role = 'admin',
  full_name = COALESCE(NULLIF(p.full_name, ''), 'Administrador')
FROM auth.users u
WHERE p.id = u.id AND u.email = 'admin@troia.com';

-- 3) Safety check: if profile doesn't exist for some reason, create it
INSERT INTO public.profiles (id, email, full_name, role)
SELECT u.id, u.email, 'Administrador', 'admin'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@troia.com' AND p.id IS NULL;