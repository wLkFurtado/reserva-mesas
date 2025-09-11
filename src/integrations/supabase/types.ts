export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: {
          created_at: string
          email: string
          name: string
          phone: string
          date: string
          guests: number
          id: string
          periodo: string
        }
        Insert: {
          created_at?: string
          email: string
          name: string
          phone: string
          date: string
          guests: number
          id?: string
          periodo: string
        }
        Update: {
          created_at?: string
          email?: string
          name?: string
          phone?: string
          date?: string
          guests?: number
          id?: string
          periodo?: string
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