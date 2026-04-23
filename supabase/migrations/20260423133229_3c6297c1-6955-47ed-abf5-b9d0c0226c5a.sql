-- 1. Função has_role (SECURITY DEFINER, evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 2. Migrar admins existentes de profiles.role para user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::public.app_role;

-- 3. Reescrever policies de reservations
DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public inserts to reservations" ON public.reservations;

CREATE POLICY "Public can insert reservations"
ON public.reservations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));