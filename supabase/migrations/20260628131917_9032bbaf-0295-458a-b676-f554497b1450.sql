
-- 1. Restaurar leitura pública de participantes
DROP POLICY IF EXISTS "Leitura de participantes" ON public.participantes;
CREATE POLICY "Leitura de participantes"
ON public.participantes FOR SELECT TO public
USING (true);

-- 2. Restaurar política original de palpites
DROP POLICY IF EXISTS "Leitura de palpites restrita" ON public.palpites;
DROP POLICY IF EXISTS "Leitura publica de palpites" ON public.palpites;
CREATE POLICY "Leitura publica de palpites"
ON public.palpites FOR SELECT TO public
USING (
  auth.uid() = participante_id
  OR EXISTS (
    SELECT 1 FROM public.jogos
    WHERE jogos.id = palpites.jogo_id
      AND now() >= (jogos.data_hora - interval '1 minute')
  )
  OR EXISTS (SELECT 1 FROM public.admins WHERE admins.email = (auth.jwt() ->> 'email'))
);

-- 3. Recriar coluna senha em gerentes
ALTER TABLE public.gerentes ADD COLUMN IF NOT EXISTS senha text;

-- 4. Restaurar EXECUTE público nas funções usadas pelo bolão
GRANT EXECUTE ON FUNCTION public.calcular_pontos_jogo(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.obter_posicao_ranking(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
