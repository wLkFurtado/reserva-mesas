-- Disable RLS on reservations table to allow public access
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reservations;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.reservations;
DROP POLICY IF EXISTS "Enable update for all users" ON public.reservations;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.reservations;

-- Since we're disabling RLS, we don't need policies
-- The table will be publicly accessible for all operations