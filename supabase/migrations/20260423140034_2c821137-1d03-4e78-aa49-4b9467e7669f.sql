-- =========================================
-- 1. ENUM de papéis de usuário
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =========================================
-- 2. Tabela user_roles
-- =========================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 3. Função has_role (SECURITY DEFINER)
-- =========================================
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

-- Policies user_roles: só admin gerencia
CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 4. Tabela reservations
-- =========================================
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  guests integer NOT NULL CHECK (guests > 0),
  date date NOT NULL,
  periodo text NOT NULL CHECK (periodo IN ('tarde', 'noite')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_date ON public.reservations(date);
CREATE INDEX idx_reservations_date_periodo ON public.reservations(date, periodo);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Policies: público insere, admin gerencia
CREATE POLICY "Anyone can create reservations"
ON public.reservations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view reservations"
ON public.reservations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reservations"
ON public.reservations FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reservations"
ON public.reservations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- 5. Trigger de capacidade diária (110)
-- =========================================
CREATE OR REPLACE FUNCTION public.enforce_daily_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_booked integer;
  capacity constant integer := 110;
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(guests), 0) INTO total_booked
  FROM public.reservations
  WHERE date = NEW.date
    AND status <> 'cancelled'
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF total_booked + NEW.guests > capacity THEN
    RAISE EXCEPTION 'Capacidade diária de % lugares excedida (já reservados: %, tentando adicionar: %)',
      capacity, total_booked, NEW.guests
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_daily_capacity
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_daily_capacity();

-- =========================================
-- 6. Função pública: status do dia por período
-- =========================================
CREATE OR REPLACE FUNCTION public.get_reservations_status_by_period(target_date date)
RETURNS TABLE (
  capacity integer,
  seats_booked_total integer,
  seats_remaining_total integer,
  seats_booked_tarde integer,
  seats_remaining_tarde integer,
  seats_booked_noite integer,
  seats_remaining_noite integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT
      COALESCE(SUM(guests) FILTER (WHERE status <> 'cancelled'), 0)::int AS booked_total,
      COALESCE(SUM(guests) FILTER (WHERE status <> 'cancelled' AND periodo = 'tarde'), 0)::int AS booked_tarde,
      COALESCE(SUM(guests) FILTER (WHERE status <> 'cancelled' AND periodo = 'noite'), 0)::int AS booked_noite
    FROM public.reservations
    WHERE date = target_date
  )
  SELECT
    110 AS capacity,
    booked_total,
    GREATEST(110 - booked_total, 0) AS seats_remaining_total,
    booked_tarde,
    GREATEST(110 - booked_total, 0) AS seats_remaining_tarde,
    booked_noite,
    GREATEST(110 - booked_total, 0) AS seats_remaining_noite
  FROM base
$$;

-- Permite chamada anônima da RPC
GRANT EXECUTE ON FUNCTION public.get_reservations_status_by_period(date) TO anon, authenticated;

-- =========================================
-- 7. Realtime na tabela reservations
-- =========================================
ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;