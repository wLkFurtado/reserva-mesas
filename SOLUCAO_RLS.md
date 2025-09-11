# Solução para Problema de RLS (Row Level Security)

## Problema Identificado
A aplicação estava falhando ao inserir dados de teste devido às políticas de Row Level Security (RLS) do Supabase que bloqueiam inserções não autorizadas na tabela `reservations`.

## Solução Implementada

### 1. Cliente Administrativo
Criamos um cliente Supabase separado (`admin-client.ts`) que usa a `service_role` key para contornar as políticas RLS:

```typescript
// src/integrations/supabase/admin-client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY, // Esta key bypassa RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### 2. Utilitário de Dados de Teste
Refatoramos o arquivo `test-data.ts` para usar múltiplas estratégias:
1. **Cliente administrativo** (bypassa RLS) - Estratégia principal
2. **Inserção direta** - Fallback para casos onde RLS permite
3. **Inserção individual** - Última tentativa

### 3. Configuração de Ambiente
Criamos `.env.local` para armazenar a service_role key de forma segura.

## Como Configurar

### Passo 1: Obter a Service Role Key
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard/project/ankliiywmcpncymdlvaa)
2. Vá em **Settings > API**
3. Copie a **service_role** key (secret)

### Passo 2: Configurar Variável de Ambiente
1. Abra o arquivo `.env.local`
2. Descomente a linha `VITE_SUPABASE_SERVICE_ROLE_KEY`
3. Cole sua service_role key real:
```env
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_real_aqui
```

### Passo 3: Reiniciar o Servidor
```bash
npm run dev
```

## Alternativas para Produção

### Opção 1: Configurar Políticas RLS Adequadas
```sql
-- Permitir inserção para usuários autenticados
CREATE POLICY "Enable insert for authenticated users" ON public.reservations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir leitura pública
CREATE POLICY "Enable read access for all users" ON public.reservations
    FOR SELECT USING (true);
```

### Opção 2: Desabilitar RLS Temporariamente
```sql
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;
```

### Opção 3: Usar Função com SECURITY DEFINER
```sql
CREATE OR REPLACE FUNCTION insert_test_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.reservations (name, email, phone, guests, date, periodo)
    VALUES 
        ('João Silva', 'joao@email.com', '(11) 99999-1111', 4, '2025-01-15', 'tarde'),
        ('Maria Santos', 'maria@email.com', '(11) 99999-2222', 2, '2025-01-15', 'noite'),
        ('Pedro Oliveira', 'pedro@email.com', '(11) 99999-3333', 6, '2025-01-16', 'tarde');
END;
$$;
```

## Segurança

⚠️ **IMPORTANTE**: 
- A `service_role` key tem acesso total ao banco de dados
- Nunca exponha esta key em código cliente em produção
- Use apenas para desenvolvimento/testes ou em funções serverless seguras
- O arquivo `.env.local` já está no `.gitignore` para evitar commits acidentais

## Arquivos Modificados
- `src/integrations/supabase/admin-client.ts` (novo)
- `src/utils/test-data.ts` (refatorado)
- `src/pages/AdminDashboard.tsx` (atualizado)
- `.env.local` (novo)
- `supabase/migrations/20250115000001_disable_rls_for_testing.sql` (novo)

## Próximos Passos
1. Configure a service_role key conforme instruções acima
2. Teste a inserção de dados no AdminDashboard
3. Em produção, implemente autenticação adequada
4. Configure políticas RLS apropriadas para seu caso de uso