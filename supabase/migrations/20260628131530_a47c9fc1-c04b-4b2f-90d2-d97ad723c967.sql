
-- 1. Participantes: remove public read
DROP POLICY IF EXISTS "Leitura de participantes" ON public.participantes;

-- 2. Palpites: remove timed public read, keep own + admin
DROP POLICY IF EXISTS "Leitura publica de palpites" ON public.palpites;
CREATE POLICY "Leitura de palpites restrita"
ON public.palpites FOR SELECT TO public
USING (
  auth.uid() = participante_id
  OR EXISTS (SELECT 1 FROM public.admins WHERE admins.email = (auth.jwt() ->> 'email'))
);

-- 3. Drop plaintext password column from gerentes
ALTER TABLE public.gerentes DROP COLUMN IF EXISTS senha;

-- 4. Fix function search_path on remaining functions
ALTER FUNCTION public.validar_senha_garcom(text) SET search_path = public;
ALTER FUNCTION public.salvar_palpite_com_codigo(uuid, uuid, integer, integer, text) SET search_path = public;
ALTER FUNCTION public.salvar_palpite_com_codigo(uuid, uuid, integer, integer, text, double precision, double precision) SET search_path = public;

-- 5. Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.calcular_pontos_jogo(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_daily_capacity() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.can_manage_reservation_image(text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.obter_posicao_ranking(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
-- Keep has_role executable for authenticated (used in RLS evaluation under invoker contexts is fine; definer still works without grant)

-- 6. Restrict storage listing: drop broad public SELECT, allow admins to list reservas/
DROP POLICY IF EXISTS "Imagens public read" ON storage.objects;
CREATE POLICY "Admins can list reservation images"
ON storage.objects FOR SELECT TO authenticated
USING (public.can_manage_reservation_image(bucket_id, name));
