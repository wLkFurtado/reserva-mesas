import { createClient } from '@supabase/supabase-js';

// Cliente administrativo para operações que precisam contornar RLS
// Usando a chave de serviço (service_role) em vez da chave pública (anon)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Usando a service_role key para contornar RLS
// Esta chave tem permissões administrativas e bypassa todas as políticas RLS
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Função para inserir dados de teste contornando RLS
export const insertTestDataAdmin = async (data: any[]) => {
  try {
    // Inserir dados diretamente usando o cliente admin (service_role)
    // O service_role bypassa automaticamente todas as políticas RLS
    const { data: result, error } = await supabaseAdmin
      .from('reservations')
      .insert(data)
      .select();
    
    if (error) {
      console.error('❌ Erro na inserção admin:', error);
      return { data: null, error };
    }
    
    console.log('✅ Dados inseridos com sucesso via admin:', result);
    return { data: result, error: null };
  } catch (err) {
    console.error('❌ Erro inesperado na inserção admin:', err);
    return { data: null, error: err };
  }
};