
-- 1) Fix search_path on functions
CREATE OR REPLACE FUNCTION public.log_reservation_status_change()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.reservation_logs (reservation_id, old_status, new_status)
    VALUES (NEW.id, OLD.status::TEXT, NEW.status::TEXT);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.verificar_limite_palpite()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_jogo_horario TIMESTAMPTZ;
BEGIN
  SELECT data_hora INTO v_jogo_horario FROM public.jogos WHERE id = NEW.jogo_id;
  IF NOW() >= v_jogo_horario + INTERVAL '5 minutes' THEN
    RAISE EXCEPTION 'Palpites para este jogo já foram encerrados (limite de 5 minutos após o início).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calcular_pontos_jogo(p_jogo_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_gols_casa INT;
  v_gols_visitante INT;
  v_finalizado BOOLEAN;
  r_palpite RECORD;
  v_pontos INT;
BEGIN
  SELECT gols_casa, gols_visitante, finalizado INTO v_gols_casa, v_gols_visitante, v_finalizado
  FROM public.jogos WHERE id = p_jogo_id;
  IF NOT COALESCE(v_finalizado, FALSE) OR v_gols_casa IS NULL OR v_gols_visitante IS NULL THEN
    RETURN;
  END IF;
  FOR r_palpite IN SELECT * FROM public.palpites WHERE jogo_id = p_jogo_id LOOP
    v_pontos := 0;
    IF r_palpite.palpite_casa = v_gols_casa AND r_palpite.palpite_visitante = v_gols_visitante THEN
      v_pontos := 10;
    ELSIF (
      (r_palpite.palpite_casa > r_palpite.palpite_visitante AND v_gols_casa > v_gols_visitante) OR
      (r_palpite.palpite_casa < r_palpite.palpite_visitante AND v_gols_casa < v_gols_visitante) OR
      (r_palpite.palpite_casa = r_palpite.palpite_visitante AND v_gols_casa = v_gols_visitante)
    ) THEN
      IF v_gols_casa = v_gols_visitante THEN
        v_pontos := 5;
      ELSIF (v_gols_casa - v_gols_visitante) = (r_palpite.palpite_casa - r_palpite.palpite_visitante) THEN
        v_pontos := 7;
      ELSE
        v_pontos := 5;
      END IF;
    END IF;
    UPDATE public.palpites SET pontos_ganhos = v_pontos WHERE id = r_palpite.id;
  END LOOP;
  UPDATE public.participantes p
  SET pontos_total = COALESCE((SELECT SUM(pontos_ganhos) FROM public.palpites WHERE participante_id = p.id), 0);
END;
$$;

-- 2) reservation_logs: admin-only access
CREATE POLICY "Admins can view reservation logs" ON public.reservation_logs
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reservation logs" ON public.reservation_logs
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT, DELETE ON public.reservation_logs TO authenticated;

-- 3) Revoke EXECUTE on internal functions from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.enforce_daily_capacity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_reservation_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verificar_limite_palpite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calcular_pontos_jogo(uuid) FROM PUBLIC, anon;
