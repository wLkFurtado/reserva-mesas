-- Create test admin user
-- This user will be inserted directly with a known password for testing

-- First, create the auth user (this is a special case for demo purposes)
-- In production, this should be done through proper registration flows
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  phone_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_sent_at,
  email_change,
  email_change_token_new,
  email_change_token_current,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  last_sign_in_at,
  instance_id,
  banned_until,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'admin@troia.com',
  '$2a$10$WnMJjECd.L6PI8mEOSICou0Ry9sDSbgFs.TpbfmT1rEJUG.Kll4.e', -- password: admin123
  now(),
  null,
  null,
  '',
  null,
  '',
  null,
  '',
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrador"}',
  false,
  now(),
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000',
  null,
  null
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@troia.com',
  'Administrador',
  'admin'
) ON CONFLICT (id) DO NOTHING;