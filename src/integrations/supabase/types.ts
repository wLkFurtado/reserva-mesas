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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      boteco_saopedro: {
        Row: {
          aniversario: string | null
          atualizado_em: string | null
          cpf: string
          nome: string | null
          ultima_visita: string | null
          valor_ultima_compra: number | null
          whatsapp: string | null
        }
        Insert: {
          aniversario?: string | null
          atualizado_em?: string | null
          cpf: string
          nome?: string | null
          ultima_visita?: string | null
          valor_ultima_compra?: number | null
          whatsapp?: string | null
        }
        Update: {
          aniversario?: string | null
          atualizado_em?: string | null
          cpf?: string
          nome?: string | null
          ultima_visita?: string | null
          valor_ultima_compra?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      lista_baratissimo: {
        Row: {
          aniversario: string | null
          atualizado_em: string | null
          cpf: string
          disparo_bloquinho: string | null
          nome: string | null
          ultima_visita: string | null
          ultimo_disparo: string | null
          valor_ultima_compra: number | null
          whatsapp: string | null
        }
        Insert: {
          aniversario?: string | null
          atualizado_em?: string | null
          cpf: string
          disparo_bloquinho?: string | null
          nome?: string | null
          ultima_visita?: string | null
          ultimo_disparo?: string | null
          valor_ultima_compra?: number | null
          whatsapp?: string | null
        }
        Update: {
          aniversario?: string | null
          atualizado_em?: string | null
          cpf?: string
          disparo_bloquinho?: string | null
          nome?: string | null
          ultima_visita?: string | null
          ultimo_disparo?: string | null
          valor_ultima_compra?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      lista_boteco_cabofrio: {
        Row: {
          aniversario: string | null
          atualizado_em: string | null
          cpf: string
          disparo_bloquinho: string | null
          nome: string | null
          ultima_visita: string | null
          ultimo_disparo: string | null
          valor_ultima_compra: number | null
          whatsapp: string | null
        }
        Insert: {
          aniversario?: string | null
          atualizado_em?: string | null
          cpf: string
          disparo_bloquinho?: string | null
          nome?: string | null
          ultima_visita?: string | null
          ultimo_disparo?: string | null
          valor_ultima_compra?: number | null
          whatsapp?: string | null
        }
        Update: {
          aniversario?: string | null
          atualizado_em?: string | null
          cpf?: string
          disparo_bloquinho?: string | null
          nome?: string | null
          ultima_visita?: string | null
          ultimo_disparo?: string | null
          valor_ultima_compra?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      lista_convidados: {
        Row: {
          data_entrada: string | null
          id: string
          lista_id: string
          nome: string
          status: string | null
        }
        Insert: {
          data_entrada?: string | null
          id?: string
          lista_id: string
          nome: string
          status?: string | null
        }
        Update: {
          data_entrada?: string | null
          id?: string
          lista_id?: string
          nome?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_convidados_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "listas"
            referencedColumns: ["id"]
          },
        ]
      }
      listas: {
        Row: {
          data_cadastro: string | null
          data_entrada: string | null
          data_evento: string | null
          fonte_lead: string | null
          id: string
          nome_responsavel: string
          status: string | null
          telefone: string
          tipo: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          data_cadastro?: string | null
          data_entrada?: string | null
          data_evento?: string | null
          fonte_lead?: string | null
          id?: string
          nome_responsavel: string
          status?: string | null
          telefone: string
          tipo: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          data_cadastro?: string | null
          data_entrada?: string | null
          data_evento?: string | null
          fonte_lead?: string | null
          id?: string
          nome_responsavel?: string
          status?: string | null
          telefone?: string
          tipo?: string
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
      troia_reservas: {
        Row: {
          criado_em: string | null
          data_reserva: string | null
          id: string
          nome: string | null
          numero_pessoas: number | null
          session_id: string | null
          telefone: string | null
          tipo_reserva: string | null
        }
        Insert: {
          criado_em?: string | null
          data_reserva?: string | null
          id: string
          nome?: string | null
          numero_pessoas?: number | null
          session_id?: string | null
          telefone?: string | null
          tipo_reserva?: string | null
        }
        Update: {
          criado_em?: string | null
          data_reserva?: string | null
          id?: string
          nome?: string | null
          numero_pessoas?: number | null
          session_id?: string | null
          telefone?: string | null
          tipo_reserva?: string | null
        }
        Relationships: []
      }
      vendas_troia: {
        Row: {
          chipNfc: string | null
          created_at: string
          date: string | null
          isPaid: boolean | null
          paymentType: string | null
          productsValue: number | null
          terminal: string | null
          tipValue: number | null
          transactionId: string
          userBirthdate: string | null
          userDocument: string | null
          userDocumentType: string | null
          userEmail: string | null
          userGender: string | null
          userName: string | null
          userPhone: string | null
        }
        Insert: {
          chipNfc?: string | null
          created_at?: string
          date?: string | null
          isPaid?: boolean | null
          paymentType?: string | null
          productsValue?: number | null
          terminal?: string | null
          tipValue?: number | null
          transactionId: string
          userBirthdate?: string | null
          userDocument?: string | null
          userDocumentType?: string | null
          userEmail?: string | null
          userGender?: string | null
          userName?: string | null
          userPhone?: string | null
        }
        Update: {
          chipNfc?: string | null
          created_at?: string
          date?: string | null
          isPaid?: boolean | null
          paymentType?: string | null
          productsValue?: number | null
          terminal?: string | null
          tipValue?: number | null
          transactionId?: string
          userBirthdate?: string | null
          userDocument?: string | null
          userDocumentType?: string | null
          userEmail?: string | null
          userGender?: string | null
          userName?: string | null
          userPhone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
