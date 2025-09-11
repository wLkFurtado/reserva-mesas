-- Remove the previous test user and create a proper one
DELETE FROM auth.users WHERE email = 'admin@troia.com';
DELETE FROM public.profiles WHERE email = 'admin@troia.com';

-- Create a simple admin user through the auth system
-- We'll use a different approach - create via signup flow simulation
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@teste.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert corresponding profile
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users 
WHERE email = 'admin@teste.com';