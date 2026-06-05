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
      admins: {
        Row: {
          criado_em: string | null
          email: string
          id: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
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
      configuracoes: {
        Row: {
          atualizado_em: string | null
          chave: string
          valor: string
        }
        Insert: {
          atualizado_em?: string | null
          chave: string
          valor: string
        }
        Update: {
          atualizado_em?: string | null
          chave?: string
          valor?: string
        }
        Relationships: []
      }
      ganhadores: {
        Row: {
          anunciado_em: string | null
          id: string
          jogo_id: string | null
          observacao: string | null
          participante_id: string | null
          premio: string
          rodada: string | null
        }
        Insert: {
          anunciado_em?: string | null
          id?: string
          jogo_id?: string | null
          observacao?: string | null
          participante_id?: string | null
          premio: string
          rodada?: string | null
        }
        Update: {
          anunciado_em?: string | null
          id?: string
          jogo_id?: string | null
          observacao?: string | null
          participante_id?: string | null
          premio?: string
          rodada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ganhadores_jogo_id_fkey"
            columns: ["jogo_id"]
            isOneToOne: false
            referencedRelation: "jogos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ganhadores_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
        ]
      }
      jogos: {
        Row: {
          bandeira_casa: string | null
          bandeira_visitante: string | null
          cidade: string | null
          criado_em: string | null
          data_hora: string
          estadio: string | null
          finalizado: boolean | null
          gols_casa: number | null
          gols_visitante: number | null
          grupo: string | null
          id: string
          rodada: string
          time_casa: string
          time_visitante: string
        }
        Insert: {
          bandeira_casa?: string | null
          bandeira_visitante?: string | null
          cidade?: string | null
          criado_em?: string | null
          data_hora: string
          estadio?: string | null
          finalizado?: boolean | null
          gols_casa?: number | null
          gols_visitante?: number | null
          grupo?: string | null
          id?: string
          rodada: string
          time_casa: string
          time_visitante: string
        }
        Update: {
          bandeira_casa?: string | null
          bandeira_visitante?: string | null
          cidade?: string | null
          criado_em?: string | null
          data_hora?: string
          estadio?: string | null
          finalizado?: boolean | null
          gols_casa?: number | null
          gols_visitante?: number | null
          grupo?: string | null
          id?: string
          rodada?: string
          time_casa?: string
          time_visitante?: string
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
      palpites: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          jogo_id: string | null
          palpite_casa: number
          palpite_visitante: number
          participante_id: string | null
          pontos_ganhos: number | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          jogo_id?: string | null
          palpite_casa: number
          palpite_visitante: number
          participante_id?: string | null
          pontos_ganhos?: number | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          jogo_id?: string | null
          palpite_casa?: number
          palpite_visitante?: number
          participante_id?: string | null
          pontos_ganhos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "palpites_jogo_id_fkey"
            columns: ["jogo_id"]
            isOneToOne: false
            referencedRelation: "jogos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "palpites_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes: {
        Row: {
          criado_em: string | null
          data_nascimento: string
          email: string
          id: string
          nome: string
          pontos_total: number | null
          telefone: string
        }
        Insert: {
          criado_em?: string | null
          data_nascimento: string
          email: string
          id?: string
          nome: string
          pontos_total?: number | null
          telefone: string
        }
        Update: {
          criado_em?: string | null
          data_nascimento?: string
          email?: string
          id?: string
          nome?: string
          pontos_total?: number | null
          telefone?: string
        }
        Relationships: []
      }
      reservation_logs: {
        Row: {
          action: string
          bar: string
          changed_at: string
          changed_by: string | null
          changed_by_email: string | null
          id: string
          new_status: string | null
          note: string | null
          old_status: string | null
          reservation_id: string
        }
        Insert: {
          action?: string
          bar?: string
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          id?: string
          new_status?: string | null
          note?: string | null
          old_status?: string | null
          reservation_id: string
        }
        Update: {
          action?: string
          bar?: string
          changed_at?: string
          changed_by?: string | null
          changed_by_email?: string | null
          id?: string
          new_status?: string | null
          note?: string | null
          old_status?: string | null
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_logs_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          date: string
          email: string
          guests: number
          id: string
          message: string | null
          name: string
          periodo: string
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          email: string
          guests: number
          id?: string
          message?: string | null
          name: string
          periodo: string
          phone: string
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          email?: string
          guests?: number
          id?: string
          message?: string | null
          name?: string
          periodo?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      reservations_cabofrio: {
        Row: {
          created_at: string
          date: string
          email: string
          guests: number
          id: string
          local: string
          message: string | null
          name: string
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          email: string
          guests: number
          id?: string
          local: string
          message?: string | null
          name: string
          phone: string
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          email?: string
          guests?: number
          id?: string
          local?: string
          message?: string | null
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      reservations_saopedro: {
        Row: {
          created_at: string
          date: string
          email: string
          guests: number
          id: string
          local: string
          message: string | null
          name: string
          phone: string
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          email: string
          guests: number
          id?: string
          local: string
          message?: string | null
          name: string
          phone: string
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          email?: string
          guests?: number
          id?: string
          local?: string
          message?: string | null
          name?: string
          phone?: string
          status?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      calcular_pontos_jogo: { Args: { p_jogo_id: string }; Returns: undefined }
      get_reservations_status_by_period: {
        Args: { target_date: string }
        Returns: {
          capacity: number
          seats_booked_noite: number
          seats_booked_tarde: number
          seats_booked_total: number
          seats_remaining_noite: number
          seats_remaining_tarde: number
          seats_remaining_total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      salvar_palpite_com_codigo: {
        Args: {
          p_codigo_presenca: string
          p_jogo_id: string
          p_palpite_casa: number
          p_palpite_visitante: number
          p_participante_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
