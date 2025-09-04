
-- 1) Tabela de reservas
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  guests integer NOT NULL CHECK (guests >= 1 AND guests <= 50),
  reservation_date date NOT NULL,
  reservation_time time WITHOUT TIME ZONE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Habilitar RLS e políticas mínimas
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT público (site aberto) - sem expor leitura
CREATE POLICY "Allow public inserts to reservations"
  ON public.reservations
  FOR INSERT
  WITH CHECK (true);

-- (Opcional futuramente) criar políticas de SELECT/UPDATE/DELETE para equipe autenticada

-- 3) Índice por data para consultas/contagens
CREATE INDEX reservations_by_date ON public.reservations (reservation_date);

-- 4) Trigger para impor capacidade diária de 110 lugares
-- Usa lock por data para evitar corrida (overbooking em alta concorrência)
CREATE OR REPLACE FUNCTION public.enforce_daily_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  seats_booked integer;
  daily_capacity constant integer := 110;
BEGIN
  -- Lock por data na transação
  PERFORM pg_advisory_xact_lock(hashtext(NEW.reservation_date::text));

  SELECT COALESCE(SUM(guests), 0)
    INTO seats_booked
  FROM public.reservations
  WHERE reservation_date = NEW.reservation_date;

  IF seats_booked + NEW.guests > daily_capacity THEN
    RAISE EXCEPTION 'Capacidade diária atingida para % (reservadas: %, solicitadas: %, limite: %)',
      NEW.reservation_date, seats_booked, NEW.guests, daily_capacity
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$func$;

CREATE TRIGGER reservations_capacity_check
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_daily_capacity();

-- 5) Função segura para consultar status do dia (sem expor dados pessoais)
CREATE OR REPLACE FUNCTION public.get_reservations_status(target_date date)
RETURNS TABLE(
  reservation_date date,
  reservations_count integer,
  seats_booked integer,
  seats_remaining integer,
  capacity integer
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  daily_capacity constant integer := 110;
  count_res integer;
  sum_guests integer;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(guests), 0)
  INTO count_res, sum_guests
  FROM public.reservations
  WHERE reservation_date = target_date;

  reservation_date := target_date;
  reservations_count := count_res;
  seats_booked := sum_guests;
  capacity := daily_capacity;
  seats_remaining := GREATEST(daily_capacity - sum_guests, 0);

  RETURN NEXT;
END;
$$;

-- Permitir execução pública da função de status (mantendo a tabela protegida)
GRANT EXECUTE ON FUNCTION public.get_reservations_status(date) TO anon, authenticated;
