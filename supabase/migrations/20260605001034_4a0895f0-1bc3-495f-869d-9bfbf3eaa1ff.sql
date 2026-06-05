
-- 1) Add columns to reservation_logs
ALTER TABLE public.reservation_logs
  ADD COLUMN IF NOT EXISTS bar text NOT NULL DEFAULT 'troia',
  ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT 'status_changed',
  ADD COLUMN IF NOT EXISTS changed_by uuid,
  ADD COLUMN IF NOT EXISTS changed_by_email text;

-- Relax old_status (deleted/created may have null)
ALTER TABLE public.reservation_logs ALTER COLUMN new_status DROP NOT NULL;

-- 2) RLS policies for INSERT (admins)
DROP POLICY IF EXISTS "Admins can insert reservation logs" ON public.reservation_logs;
CREATE POLICY "Admins can insert reservation logs" ON public.reservation_logs
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

GRANT INSERT ON public.reservation_logs TO authenticated;

-- 3) Generic logging function (SECURITY INVOKER so auth.uid()/jwt reflect caller)
CREATE OR REPLACE FUNCTION public.log_reservation_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_bar text := TG_ARGV[0];
  v_uid uuid := auth.uid();
  v_email text := NULLIF(auth.jwt() ->> 'email', '');
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.reservation_logs (reservation_id, old_status, new_status, action, bar, changed_by, changed_by_email)
    VALUES (NEW.id::uuid, NULL, NEW.status::text, 'created', v_bar, v_uid, v_email);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.reservation_logs (reservation_id, old_status, new_status, action, bar, changed_by, changed_by_email)
      VALUES (NEW.id::uuid, OLD.status::text, NEW.status::text, 'status_changed', v_bar, v_uid, v_email);
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.reservation_logs (reservation_id, old_status, new_status, action, bar, changed_by, changed_by_email)
    VALUES (OLD.id::uuid, OLD.status::text, NULL, 'deleted', v_bar, v_uid, v_email);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- 4) Drop old triggers and install new ones for each bar table
DROP TRIGGER IF EXISTS trg_log_reservation_status_change ON public.reservations;
DROP TRIGGER IF EXISTS log_reservation_status_change ON public.reservations;
DROP TRIGGER IF EXISTS trg_log_reservation_change ON public.reservations;
DROP TRIGGER IF EXISTS trg_log_reservation_change_cabofrio ON public.reservations_cabofrio;
DROP TRIGGER IF EXISTS trg_log_reservation_change_saopedro ON public.reservations_saopedro;

CREATE TRIGGER trg_log_reservation_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_change('troia');

CREATE TRIGGER trg_log_reservation_change_cabofrio
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations_cabofrio
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_change('cabofrio');

CREATE TRIGGER trg_log_reservation_change_saopedro
  AFTER INSERT OR UPDATE OR DELETE ON public.reservations_saopedro
  FOR EACH ROW EXECUTE FUNCTION public.log_reservation_change('saopedro');

-- 5) Make sure RLS lets admins see logs from all bars (existing policy already does, but RLS must be enabled)
ALTER TABLE public.reservation_logs ENABLE ROW LEVEL SECURITY;
