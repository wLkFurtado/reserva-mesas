
-- 1. configuracoes: remove leitura pública (contém código de presença)
DROP POLICY IF EXISTS "Leitura publica de configuracoes" ON public.configuracoes;

-- 2. lista_convidados: restrita a admins
DROP POLICY IF EXISTS "Anyone can read convidados" ON public.lista_convidados;
CREATE POLICY "Admins can read convidados" ON public.lista_convidados
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email')));

-- 3. listas: restrita a admins
DROP POLICY IF EXISTS "Anyone can read listas" ON public.listas;
CREATE POLICY "Admins can read listas" ON public.listas
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email')));

-- 4. participantes: remove leitura pública de PII
DROP POLICY IF EXISTS "Leitura de participantes" ON public.participantes;
CREATE POLICY "Admins podem ler participantes" ON public.participantes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email')));

-- 5. rls_policy_always_true: substituir WITH CHECK true por validações mínimas
DROP POLICY IF EXISTS "Anyone can insert convidados" ON public.lista_convidados;
CREATE POLICY "Anyone can insert convidados" ON public.lista_convidados
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(nome)) > 0 AND lista_id IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert listas" ON public.listas;
CREATE POLICY "Anyone can insert listas" ON public.listas
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(nome_responsavel)) > 0 AND length(btrim(telefone)) > 0 AND length(btrim(tipo)) > 0);

DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
CREATE POLICY "Anyone can create reservations" ON public.reservations
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(name)) > 0 AND length(btrim(phone)) > 0 AND guests > 0 AND guests <= 110 AND date >= CURRENT_DATE);

DROP POLICY IF EXISTS "Anyone can create cabofrio reservations" ON public.reservations_cabofrio;
CREATE POLICY "Anyone can create cabofrio reservations" ON public.reservations_cabofrio
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(name)) > 0 AND length(btrim(phone)) > 0 AND guests > 0 AND date >= CURRENT_DATE);

DROP POLICY IF EXISTS "Anyone can create saopedro reservations" ON public.reservations_saopedro;
CREATE POLICY "Anyone can create saopedro reservations" ON public.reservations_saopedro
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(btrim(name)) > 0 AND length(btrim(phone)) > 0 AND guests > 0 AND date >= CURRENT_DATE);

-- 6. RLS enabled no policy: adicionar políticas admin-only nas tabelas sem políticas
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['boteco_saopedro','lista_baratissimo','lista_boteco_cabofrio','n8n_chat_histories','troia_pos_msg_log','troia_reservas'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins manage %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Admins manage %I" ON public.%I FOR ALL TO authenticated USING (has_role(auth.uid(), ''admin''::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> ''email''))) WITH CHECK (has_role(auth.uid(), ''admin''::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> ''email'')))', t, t);
  END LOOP;
END$$;

-- admins: adicionar políticas write para admins
DROP POLICY IF EXISTS "Admins manage admins" ON public.admins;
CREATE POLICY "Admins manage admins" ON public.admins FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM admins a WHERE a.email = (auth.jwt() ->> 'email')))
  WITH CHECK (EXISTS (SELECT 1 FROM admins a WHERE a.email = (auth.jwt() ->> 'email')));

-- vendas_troia: adicionar políticas de escrita para admins
DROP POLICY IF EXISTS "Admins manage vendas_troia" ON public.vendas_troia;
CREATE POLICY "Admins manage vendas_troia" ON public.vendas_troia FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update vendas_troia" ON public.vendas_troia FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete vendas_troia" ON public.vendas_troia FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Funções com search_path mutável
CREATE OR REPLACE FUNCTION public.obter_posicao_ranking(p_id uuid)
 RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_posicao INT;
BEGIN
  SELECT posicao INTO v_posicao FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY pontos_total DESC, criado_em ASC) AS posicao FROM participantes
  ) ranked WHERE ranked.id = p_id;
  RETURN COALESCE(v_posicao, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.ranking_por_rodada(p_rodada text)
 RETURNS TABLE(id uuid, nome text, pontos_total integer, criado_em timestamp with time zone, pontos_rodada bigint, posicao bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nome, p.pontos_total, p.criado_em,
    COALESCE(SUM(pa.pontos_ganhos), 0) AS pontos_rodada,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pa.pontos_ganhos), 0) DESC, p.criado_em ASC) AS posicao
  FROM participantes p
  LEFT JOIN palpites pa ON pa.participante_id = p.id
    AND pa.jogo_id IN (SELECT j.id FROM jogos j WHERE j.rodada = p_rodada)
  GROUP BY p.id, p.nome, p.pontos_total, p.criado_em
  ORDER BY pontos_rodada DESC, p.criado_em ASC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calcular_distancia(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
 RETURNS double precision LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public'
AS $function$
DECLARE R double precision := 6371000; dLat double precision; dLon double precision; a double precision; c double precision;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN RETURN 999999999.0; END IF;
  dLat := radians(lat2 - lat1); dLon := radians(lon2 - lon1);
  a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$function$;

CREATE OR REPLACE FUNCTION public.verificar_limite_palpite()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE v_jogo_horario TIMESTAMPTZ;
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.palpite_casa = NEW.palpite_casa AND OLD.palpite_visitante = NEW.palpite_visitante) THEN
      RETURN NEW;
    END IF;
  END IF;
  SELECT data_hora INTO v_jogo_horario FROM jogos WHERE id = NEW.jogo_id;
  IF NOW() >= v_jogo_horario - INTERVAL '1 minute' THEN
    RAISE EXCEPTION 'Os palpites devem ser enviados até 1 minuto antes do início do jogo.';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cadastrar_participante(p_nome text, p_email text, p_cpf text, p_telefone text, p_data_nascimento date, p_senha text, p_ref_id uuid)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_new_id UUID; v_starting_points INT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM participantes WHERE LOWER(email) = LOWER(TRIM(p_email))) THEN
    RETURN json_build_object('success', false, 'error', 'Este e-mail já está cadastrado!');
  END IF;
  IF EXISTS (SELECT 1 FROM participantes WHERE cpf = REGEXP_REPLACE(p_cpf, '\D', 'g')) THEN
    RETURN json_build_object('success', false, 'error', 'Este CPF já está cadastrado!');
  END IF;
  IF p_ref_id IS NOT NULL AND EXISTS (SELECT 1 FROM participantes WHERE id = p_ref_id) THEN
    v_starting_points := 5;
  END IF;
  INSERT INTO participantes (nome, email, cpf, telefone, data_nascimento, senha, pontos_total)
  VALUES (p_nome, LOWER(TRIM(p_email)), REGEXP_REPLACE(p_cpf, '\D', 'g'), p_telefone, p_data_nascimento, p_senha, v_starting_points)
  RETURNING id INTO v_new_id;
  IF p_ref_id IS NOT NULL AND EXISTS (SELECT 1 FROM participantes WHERE id = p_ref_id) THEN
    UPDATE participantes SET pontos_total = pontos_total + 5 WHERE id = p_ref_id;
  END IF;
  RETURN json_build_object('success', true, 'id', v_new_id, 'starting_points', v_starting_points);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calcular_pontos_jogo(p_jogo_id uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_gols_casa INT; v_gols_visitante INT; v_time_casa TEXT; v_time_visitante TEXT; v_finalizado BOOLEAN; r_palpite RECORD; v_pontos INT;
BEGIN
  SELECT time_casa, time_visitante, gols_casa, gols_visitante, finalizado
  INTO v_time_casa, v_time_visitante, v_gols_casa, v_gols_visitante, v_finalizado FROM jogos WHERE id = p_jogo_id;
  IF NOT COALESCE(v_finalizado, FALSE) OR v_gols_casa IS NULL OR v_gols_visitante IS NULL THEN RETURN; END IF;
  DELETE FROM ganhadores WHERE jogo_id = p_jogo_id AND premio IN ('1 Chopp Grátis (Acertou Placar do Brasil)', '1 Chopp Grátis (Acertou Placar da França)');
  FOR r_palpite IN SELECT * FROM palpites WHERE jogo_id = p_jogo_id LOOP
    v_pontos := 0;
    IF r_palpite.palpite_casa = v_gols_casa AND r_palpite.palpite_visitante = v_gols_visitante THEN v_pontos := 10;
    ELSIF ((r_palpite.palpite_casa > r_palpite.palpite_visitante AND v_gols_casa > v_gols_visitante)
        OR (r_palpite.palpite_casa < r_palpite.palpite_visitante AND v_gols_casa < v_gols_visitante)
        OR (r_palpite.palpite_casa = r_palpite.palpite_visitante AND v_gols_casa = v_gols_visitante)) THEN v_pontos := 4;
    END IF;
    UPDATE palpites SET pontos_ganhos = v_pontos WHERE id = r_palpite.id;
    IF (v_time_casa = 'Brasil' OR v_time_visitante = 'Brasil') AND v_pontos = 10 THEN
      INSERT INTO ganhadores (jogo_id, participante_id, premio, observacao)
      VALUES (p_jogo_id, r_palpite.participante_id, '1 Chopp Grátis (Acertou Placar do Brasil)', 'Pendente');
    END IF;
    IF (v_time_casa = 'França' AND v_time_visitante = 'Irlanda do Norte') AND v_pontos = 10 THEN
      INSERT INTO ganhadores (jogo_id, participante_id, premio, observacao)
      VALUES (p_jogo_id, r_palpite.participante_id, '1 Chopp Grátis (Acertou Placar da França)', 'Pendente');
    END IF;
  END LOOP;
  UPDATE participantes p SET pontos_total = COALESCE((SELECT SUM(pontos_ganhos) FROM palpites WHERE participante_id = p.id), 0)
  WHERE p.id IN (SELECT DISTINCT participante_id FROM palpites WHERE jogo_id = p_jogo_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_reservation_status_change()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.reservation_logs (reservation_id, old_status, new_status)
    VALUES (NEW.id, OLD.status::TEXT, NEW.status::TEXT);
  END IF;
  RETURN NEW;
END;
$function$;

-- 8. Revoga EXECUTE de funções SECURITY DEFINER internas/trigger de anon/authenticated
REVOKE EXECUTE ON FUNCTION public.calcular_pontos_jogo(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_daily_capacity() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_reservation_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_reservation_status_change() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verificar_limite_palpite() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calcular_distancia(double precision, double precision, double precision, double precision) FROM anon, authenticated, PUBLIC;

-- 9. Storage objects: políticas no bucket 'imagens' (público leitura, admin escrita)
DROP POLICY IF EXISTS "Imagens public read" ON storage.objects;
CREATE POLICY "Imagens public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'imagens');

DROP POLICY IF EXISTS "Imagens admin insert" ON storage.objects;
CREATE POLICY "Imagens admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'imagens' AND (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email'))));

DROP POLICY IF EXISTS "Imagens admin update" ON storage.objects;
CREATE POLICY "Imagens admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'imagens' AND (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email'))));

DROP POLICY IF EXISTS "Imagens admin delete" ON storage.objects;
CREATE POLICY "Imagens admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'imagens' AND (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (SELECT 1 FROM admins WHERE email = (auth.jwt() ->> 'email'))));

-- 10. Realtime: restringir broadcast/presence à admins (postgres_changes continua governado pelas policies da tabela origem)
DROP POLICY IF EXISTS "Only admins can use realtime channels" ON realtime.messages;
CREATE POLICY "Only admins can use realtime channels" ON realtime.messages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
