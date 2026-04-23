CREATE OR REPLACE FUNCTION public.get_reservations_status_by_period(target_date date)
RETURNS TABLE(
  reservation_date date,
  capacity integer,
  seats_booked_total integer,
  seats_remaining_total integer,
  seats_booked_tarde integer,
  seats_booked_noite integer,
  seats_remaining_tarde integer,
  seats_remaining_noite integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cap integer := 110;
  total integer := 0;
  tarde integer := 0;
  noite integer := 0;
BEGIN
  SELECT COALESCE(SUM(guests), 0) INTO total
  FROM public.reservations
  WHERE date = target_date;

  SELECT COALESCE(SUM(guests), 0) INTO tarde
  FROM public.reservations
  WHERE date = target_date AND periodo = 'tarde';

  SELECT COALESCE(SUM(guests), 0) INTO noite
  FROM public.reservations
  WHERE date = target_date AND periodo = 'noite';

  RETURN QUERY SELECT
    target_date,
    cap,
    total,
    GREATEST(cap - total, 0),
    tarde,
    noite,
    GREATEST(cap - tarde, 0),
    GREATEST(cap - noite, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_reservations_status_by_period(date) TO anon, authenticated;