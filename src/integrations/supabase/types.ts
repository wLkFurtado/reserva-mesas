export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      "[AVIV] Contato": {
        Row: {
          created_at: string
          id: number
          nome: string | null
          queixa_principal: string | null
          telefone: string | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nome?: string | null
          queixa_principal?: string | null
          telefone?: string | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string | null
          queixa_principal?: string | null
          telefone?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      "[MALU]contacts": {
        Row: {
          contact_id: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          contact_id?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          contact_id?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      "[WISLEI] Contatos": {
        Row: {
          created_at: string
          id: number
          nome: string | null
          pacote_escolhido: string | null
          telefone: string | null
          timestamp: string | null
          tipo_fotografia: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nome?: string | null
          pacote_escolhido?: string | null
          telefone?: string | null
          timestamp?: string | null
          tipo_fotografia?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nome?: string | null
          pacote_escolhido?: string | null
          telefone?: string | null
          timestamp?: string | null
          tipo_fotografia?: string | null
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          contact_id: string
          created_by: string | null
          id: string
          interaction_date: string
          interaction_type: string
          notes: string
        }
        Insert: {
          contact_id: string
          created_by?: string | null
          id?: string
          interaction_date?: string
          interaction_type: string
          notes: string
        }
        Update: {
          contact_id?: string
          created_by?: string | null
          id?: string
          interaction_date?: string
          interaction_type?: string
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_id: string | null
          country_code: string
          data_submissao: string
          email: string
          equipe_front_office: string
          expectativas_agencia: string
          experiencia_anterior: string | null
          faturamento_mensal: string
          id: string
          instagram: string
          investimento_ads: string
          lead_score: number | null
          name: string
          origem: string | null
          phone: string
          trabalhou_com_agencia: boolean
        }
        Insert: {
          contact_id?: string | null
          country_code?: string
          data_submissao?: string
          email: string
          equipe_front_office: string
          expectativas_agencia: string
          experiencia_anterior?: string | null
          faturamento_mensal: string
          id?: string
          instagram: string
          investimento_ads: string
          lead_score?: number | null
          name: string
          origem?: string | null
          phone: string
          trabalhou_com_agencia: boolean
        }
        Update: {
          contact_id?: string | null
          country_code?: string
          data_submissao?: string
          email?: string
          equipe_front_office?: string
          expectativas_agencia?: string
          experiencia_anterior?: string | null
          faturamento_mensal?: string
          id?: string
          instagram?: string
          investimento_ads?: string
          lead_score?: number | null
          name?: string
          origem?: string | null
          phone?: string
          trabalhou_com_agencia?: boolean
        }
        Relationships: []
      }
      "Contato_ AZUL": {
        Row: {
          bairro_empresa: string | null
          CPF: string | null
          created_at: string
          faturamento_empresa: string | null
          id: number
          loja_fisica: string | null
          nome: string | null
          ramo_atuacao: string | null
          telefone: string | null
          timestamp: string | null
        }
        Insert: {
          bairro_empresa?: string | null
          CPF?: string | null
          created_at?: string
          faturamento_empresa?: string | null
          id?: number
          loja_fisica?: string | null
          nome?: string | null
          ramo_atuacao?: string | null
          telefone?: string | null
          timestamp?: string | null
        }
        Update: {
          bairro_empresa?: string | null
          CPF?: string | null
          created_at?: string
          faturamento_empresa?: string | null
          id?: number
          loja_fisica?: string | null
          nome?: string | null
          ramo_atuacao?: string | null
          telefone?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      documentos_julia: {
        Row: {
          content: string
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documentsmalu: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      Formulario: {
        Row: {
          bot_capabilities: Json | null
          brand_image: string | null
          common_scenarios: string | null
          communication_tone: Json | null
          company_description: string | null
          company_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_position: string | null
          created_at: string
          data_collection: string | null
          data_privacy: string | null
          difficult_situations: string | null
          financial_services: string | null
          frequent_questions: string | null
          id: number
          implementation_channels: Json | null
          knowledge_base: string | null
          kpis: string | null
          language_rules: string | null
          legal_notices: string | null
          main_pain_points: string | null
          main_problem: string | null
          regulations: string | null
          responsible_name: string | null
          restrictions: string | null
          sales_funnel_stage: string | null
          sector_jargon: string | null
          success_metrics: string | null
          system_integrations: string | null
          target_audience: string | null
          technical_restrictions: string | null
        }
        Insert: {
          bot_capabilities?: Json | null
          brand_image?: string | null
          common_scenarios?: string | null
          communication_tone?: Json | null
          company_description?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          data_collection?: string | null
          data_privacy?: string | null
          difficult_situations?: string | null
          financial_services?: string | null
          frequent_questions?: string | null
          id?: number
          implementation_channels?: Json | null
          knowledge_base?: string | null
          kpis?: string | null
          language_rules?: string | null
          legal_notices?: string | null
          main_pain_points?: string | null
          main_problem?: string | null
          regulations?: string | null
          responsible_name?: string | null
          restrictions?: string | null
          sales_funnel_stage?: string | null
          sector_jargon?: string | null
          success_metrics?: string | null
          system_integrations?: string | null
          target_audience?: string | null
          technical_restrictions?: string | null
        }
        Update: {
          bot_capabilities?: Json | null
          brand_image?: string | null
          common_scenarios?: string | null
          communication_tone?: Json | null
          company_description?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          data_collection?: string | null
          data_privacy?: string | null
          difficult_situations?: string | null
          financial_services?: string | null
          frequent_questions?: string | null
          id?: number
          implementation_channels?: Json | null
          knowledge_base?: string | null
          kpis?: string | null
          language_rules?: string | null
          legal_notices?: string | null
          main_pain_points?: string | null
          main_problem?: string | null
          regulations?: string | null
          responsible_name?: string | null
          restrictions?: string | null
          sales_funnel_stage?: string | null
          sector_jargon?: string | null
          success_metrics?: string | null
          system_integrations?: string | null
          target_audience?: string | null
          technical_restrictions?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          data_cadastro: string
          data_entrada: string | null
          fonte_lead: string | null
          id: string
          nome_completo: string
          status: Database["public"]["Enums"]["lead_status"]
          telefone: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          data_cadastro?: string
          data_entrada?: string | null
          fonte_lead?: string | null
          id?: string
          nome_completo: string
          status?: Database["public"]["Enums"]["lead_status"]
          telefone: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          data_cadastro?: string
          data_entrada?: string | null
          fonte_lead?: string | null
          id?: string
          nome_completo?: string
          status?: Database["public"]["Enums"]["lead_status"]
          telefone?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories_aviv: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories_azul: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories_malu: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories_wislei: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      n8n_fila_mensagens: {
        Row: {
          id: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Insert: {
          id?: number
          id_mensagem: string
          mensagem: string
          telefone: string
          timestamp: string
        }
        Update: {
          id?: number
          id_mensagem?: string
          mensagem?: string
          telefone?: string
          timestamp?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          email: string
          guests: number
          id: string
          name: string
          phone: string
          reservation_date: string
          reservation_time: string
        }
        Insert: {
          created_at?: string
          email: string
          guests: number
          id?: string
          name: string
          phone: string
          reservation_date: string
          reservation_time: string
        }
        Update: {
          created_at?: string
          email?: string
          guests?: number
          id?: string
          name?: string
          phone?: string
          reservation_date?: string
          reservation_time?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_reservations_status: {
        Args: { target_date: string }
        Returns: {
          capacity: number
          reservation_date: string
          reservations_count: number
          seats_booked: number
          seats_remaining: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_julia: {
        Args:
          | { filter?: Json; match_count?: number; query_embedding: string }
          | {
              match_threshold?: number
              max_limit?: number
              query_embedding: string
            }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documentsmalu: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      lead_status: "aguardando" | "entrou"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_status: ["aguardando", "entrou"],
    },
  },
} as const
