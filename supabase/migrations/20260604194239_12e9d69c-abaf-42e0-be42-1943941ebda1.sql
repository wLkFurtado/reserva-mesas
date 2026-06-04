
-- ============ Lock down PII tables (other apps use service_role) ============
ALTER TABLE public.boteco_saopedro ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.boteco_saopedro FROM anon, authenticated;

ALTER TABLE public.lista_baratissimo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lista_baratissimo FROM anon, authenticated;

ALTER TABLE public.lista_boteco_cabofrio ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lista_boteco_cabofrio FROM anon, authenticated;

ALTER TABLE public.troia_reservas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.troia_reservas FROM anon, authenticated;

ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.n8n_chat_histories FROM anon, authenticated;

-- ============ vendas_troia: admin-only read ============
CREATE POLICY "Admins can view vendas_troia" ON public.vendas_troia
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT ON public.vendas_troia TO authenticated;

-- ============ Tighten always-true policies ============
-- lista_convidados: keep public insert/select (used by guest list signups); remove open update/delete
DROP POLICY IF EXISTS "Anyone can update convidados" ON public.lista_convidados;
DROP POLICY IF EXISTS "Anyone can delete convidados" ON public.lista_convidados;

-- listas: keep public insert/select; remove open update
DROP POLICY IF EXISTS "Anyone can update listas" ON public.listas;

-- palpites: keep public insert/select; remove open update
DROP POLICY IF EXISTS "Edicao de palpite" ON public.palpites;

-- participantes: keep public insert/select; remove open update
DROP POLICY IF EXISTS "Atualizacao de participante" ON public.participantes;
