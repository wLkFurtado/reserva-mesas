// Utilitário para criar dados de teste contornando problemas de RLS
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin, isAdminConfigured } from '@/integrations/supabase/admin-client';

export interface TestReservation {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  periodo: 'tarde' | 'noite';
}

const testReservations: TestReservation[] = [
  {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-1111',
    guests: 4,
    date: '2025-01-15',
    periodo: 'tarde'
  },
  {
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 99999-2222',
    guests: 2,
    date: '2025-01-15',
    periodo: 'noite'
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(11) 99999-3333',
    guests: 6,
    date: '2025-01-16',
    periodo: 'tarde'
  }
];

// Função para inserir dados de teste com múltiplas estratégias
export const insertTestData = async (): Promise<{ success: boolean; data?: any; error?: any }> => {
  console.log('🔄 Iniciando inserção de dados de teste...');
  
  try {
    // Estratégia 1: Usar cliente administrativo (bypassa RLS)
    if (isAdminConfigured()) {
      console.log('📝 Tentativa 1: Cliente administrativo (bypassa RLS)');
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('reservations')
        .insert(testReservations)
        .select();
      
      if (!adminError && adminData) {
        console.log('✅ Inserção com cliente admin bem-sucedida:', adminData.length, 'registros');
        return { success: true, data: adminData };
      }
      
      console.log('⚠️ Inserção com cliente admin falhou:', adminError?.message);
    } else {
      console.log('⚠️ Cliente administrativo não configurado (SUPABASE_SERVICE_ROLE_KEY não encontrada)');
    }
    
    // Estratégia 2: Tentar inserção direta
    console.log('📝 Tentativa 2: Inserção direta');
    const { data: directData, error: directError } = await supabase
      .from('reservations')
      .insert(testReservations)
      .select();
    
    if (!directError && directData) {
      console.log('✅ Inserção direta bem-sucedida!');
      return { success: true, data: directData };
    }
    
    console.log('⚠️ Inserção direta falhou:', directError?.message);
    
    // Estratégia 3: Inserir um por vez
    console.log('📝 Tentativa 3: Inserção individual');
    const results = [];
    let hasError = false;
    
    for (let i = 0; i < testReservations.length; i++) {
      const reservation = testReservations[i];
      console.log(`📝 Inserindo reserva ${i + 1}/${testReservations.length}:`, reservation.name);
      
      const { data: singleData, error: singleError } = await supabase
        .from('reservations')
        .insert([reservation])
        .select();
      
      if (singleError) {
        console.log(`❌ Erro ao inserir ${reservation.name}:`, singleError.message);
        hasError = true;
      } else if (singleData) {
        console.log(`✅ ${reservation.name} inserido com sucesso`);
        results.push(...singleData);
      }
    }
    
    if (results.length > 0) {
      console.log(`✅ Inserção parcial bem-sucedida! ${results.length} reservas criadas.`);
      return { success: true, data: results };
    }
    
    console.log('❌ Todas as estratégias falharam');
    return { 
      success: false, 
      error: {
        message: 'Não foi possível inserir dados de teste. Configure SUPABASE_SERVICE_ROLE_KEY ou desabilite RLS.',
        details: { adminConfigured: isAdminConfigured() }
      }
    };
    
  } catch (error) {
    console.log('❌ Erro inesperado:', error);
    return { success: false, error };
  }
};

// Função para limpar dados de teste
export const clearTestData = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .in('email', testReservations.map(r => r.email));
    
    if (error) {
      console.log('❌ Erro ao limpar dados de teste:', error.message);
      return { success: false, error };
    }
    
    console.log('✅ Dados de teste removidos com sucesso!');
    return { success: true };
  } catch (error) {
    console.log('❌ Erro inesperado ao limpar dados:', error);
    return { success: false, error };
  }
};