
CREATE OR REPLACE FUNCTION public.enforce_daily_capacity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_booked integer;
  capacity constant integer := 110;
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- Admins podem ultrapassar a capacidade (confirmação é feita no painel)
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
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
$function$;
