-- Criação de funções RPC para operações administrativas
-- Estas funções permitem operações que contornam RLS quando necessário

-- Função para desabilitar RLS temporariamente na tabela reservations
CREATE OR REPLACE FUNCTION disable_rls_for_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desabilita RLS na tabela reservations
  ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
  
  -- Remove todas as políticas existentes
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.reservations;
  DROP POLICY IF EXISTS "Enable insert for all users" ON public.reservations;
  DROP POLICY IF EXISTS "Enable update for all users" ON public.reservations;
  DROP POLICY IF EXISTS "Enable delete for all users" ON public.reservations;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reservations;
  DROP POLICY IF EXISTS "Enable update for users based on email" ON public.reservations;
  DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.reservations;
  
  -- Garante permissões para anon e authenticated
  GRANT ALL ON public.reservations TO anon;
  GRANT ALL ON public.reservations TO authenticated;
  GRANT USAGE ON SEQUENCE reservations_id_seq TO anon;
  GRANT USAGE ON SEQUENCE reservations_id_seq TO authenticated;
END;
$$;

-- Função para executar SQL arbitrário (apenas para service_role)
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Executa a query e retorna o resultado como JSON
  EXECUTE query;
  
  -- Retorna sucesso
  SELECT json_build_object('success', true, 'message', 'Query executed successfully') INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Retorna erro
    SELECT json_build_object('success', false, 'error', SQLERRM) INTO result;
    RETURN result;
END;
$$;

-- Garante que apenas service_role pode executar essas funções
REVOKE ALL ON FUNCTION disable_rls_for_reservations() FROM PUBLIC;
REVOKE ALL ON FUNCTION execute_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION disable_rls_for_reservations() TO service_role;
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;

-- Comentários explicativos
COMMENT ON FUNCTION disable_rls_for_reservations() IS 'Função administrativa para desabilitar RLS na tabela reservations';
COMMENT ON FUNCTION execute_sql(text) IS 'Função administrativa para executar SQL arbitrário (apenas service_role)';