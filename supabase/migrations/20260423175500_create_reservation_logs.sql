-- Tabela de histórico/auditoria de reservas
CREATE TABLE IF NOT EXISTS public.reservation_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  note        TEXT,
  changed_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índice para buscar logs por reserva
CREATE INDEX IF NOT EXISTS reservation_logs_reservation_id_idx
  ON public.reservation_logs(reservation_id);

-- Sem RLS (igual ao padrão atual das outras tabelas do projeto)
ALTER TABLE public.reservation_logs DISABLE ROW LEVEL SECURITY;

-- Trigger que registra automaticamente mudanças de status
CREATE OR REPLACE FUNCTION public.log_reservation_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.reservation_logs (reservation_id, old_status, new_status)
    VALUES (NEW.id, OLD.status::TEXT, NEW.status::TEXT);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_reservation_status ON public.reservations;

CREATE TRIGGER trg_log_reservation_status
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_reservation_status_change();
