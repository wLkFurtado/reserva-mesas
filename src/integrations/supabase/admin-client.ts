import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ankliiywmcpncymdlvaa.supabase.co";

// Service role key - bypassa RLS para operações administrativas
// IMPORTANTE: Esta key deve ser mantida segura e usada apenas no lado do servidor
// Para desenvolvimento local, você pode adicionar a service_role key aqui temporariamente
// Em produção, esta deve vir de uma variável de ambiente segura
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

// Cliente administrativo que bypassa RLS
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Função para verificar se o cliente admin está configurado
export const isAdminConfigured = () => {
  return !!SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY.length > 0;
};