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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      fuente: {
        Row: {
          clase: string | null
          created_at: string | null
          id_fuente: number
          id_ubicacion: number | null
          nombre: string
          tipo: string | null
        }
        Insert: {
          clase?: string | null
          created_at?: string | null
          id_fuente?: number
          id_ubicacion?: number | null
          nombre: string
          tipo?: string | null
        }
        Update: {
          clase?: string | null
          created_at?: string | null
          id_fuente?: number
          id_ubicacion?: number | null
          nombre?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuente_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicacion"
            referencedColumns: ["id_ubicacion"]
          },
        ]
      }
      laboratorio: {
        Row: {
          created_at: string | null
          email: string | null
          estado: string | null
          id_laboratorio: number
          id_ubicacion_lab: number | null
          nombre: string
          telefono: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id_laboratorio?: number
          id_ubicacion_lab?: number | null
          nombre: string
          telefono?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id_laboratorio?: number
          id_ubicacion_lab?: number | null
          nombre?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "laboratorio_id_ubicacion_lab_fkey"
            columns: ["id_ubicacion_lab"]
            isOneToOne: false
            referencedRelation: "ubicacion_laboratorio"
            referencedColumns: ["id_ubicacion_lab"]
          },
        ]
      }
      muestreo: {
        Row: {
          codigo: string
          created_at: string | null
          descripcion: string | null
          id_laboratorio: number | null
          id_muestreo: number
          id_prestador: number | null
          id_solicitante: number | null
          nombre: string
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descripcion?: string | null
          id_laboratorio?: number | null
          id_muestreo?: number
          id_prestador?: number | null
          id_solicitante?: number | null
          nombre: string
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descripcion?: string | null
          id_laboratorio?: number | null
          id_muestreo?: number
          id_prestador?: number | null
          id_solicitante?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "muestreo_id_laboratorio_fkey"
            columns: ["id_laboratorio"]
            isOneToOne: false
            referencedRelation: "laboratorio"
            referencedColumns: ["id_laboratorio"]
          },
          {
            foreignKeyName: "muestreo_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          },
          {
            foreignKeyName: "muestreo_id_solicitante_fkey"
            columns: ["id_solicitante"]
            isOneToOne: false
            referencedRelation: "solicitante"
            referencedColumns: ["id_solicitante"]
          },
        ]
      }
      prestador: {
        Row: {
          codigo_anterior: number | null
          codigo_sistema: number | null
          created_at: string | null
          direccion: string | null
          id_autoridad_sanitaria: string | null
          id_prestador: number
          id_sspd: string | null
          id_ubicacion: number | null
          nit: string | null
          nombre: string
          nombre_sistema: string | null
          telefono: string | null
        }
        Insert: {
          codigo_anterior?: number | null
          codigo_sistema?: number | null
          created_at?: string | null
          direccion?: string | null
          id_autoridad_sanitaria?: string | null
          id_prestador?: number
          id_sspd?: string | null
          id_ubicacion?: number | null
          nit?: string | null
          nombre: string
          nombre_sistema?: string | null
          telefono?: string | null
        }
        Update: {
          codigo_anterior?: number | null
          codigo_sistema?: number | null
          created_at?: string | null
          direccion?: string | null
          id_autoridad_sanitaria?: string | null
          id_prestador?: number
          id_sspd?: string | null
          id_ubicacion?: number | null
          nit?: string | null
          nombre?: string
          nombre_sistema?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestador_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicacion"
            referencedColumns: ["id_ubicacion"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nombre: string | null
          rol: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nombre?: string | null
          rol?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string | null
          rol?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reporte: {
        Row: {
          codigo: string
          created_at: string | null
          estado: string | null
          fecha_creacion: string | null
          id_reporte: number
          id_prestador: number | null
          punto: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          estado?: string | null
          fecha_creacion?: string | null
          id_reporte?: number
          id_prestador?: number | null
          punto?: string | null
        }
        Update: {
          codigo: string
          created_at?: string | null
          estado?: string | null
          fecha_creacion?: string | null
          id_reporte?: number
          id_prestador?: number | null
          punto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "representante_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          }
        ]
      }
      representante: {
        Row: {
          cargo: string | null
          created_at: string | null
          email: string | null
          id_prestador: number | null
          id_representante: number
          nombre: string
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id_prestador?: number | null
          id_representante?: number
          nombre: string
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id_prestador?: number | null
          id_representante?: number
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "representante_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          },
        ]
      }
      solicitante: {
        Row: {
          created_at: string | null
          estado: string | null
          id_solicitante: number
          id_ubicacion_sol: number | null
          nombre: string
        }
        Insert: {
          created_at?: string | null
          estado?: string | null
          id_solicitante?: number
          id_ubicacion_sol?: number | null
          nombre: string
        }
        Update: {
          created_at?: string | null
          estado?: string | null
          id_solicitante?: number
          id_ubicacion_sol?: number | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitante_id_ubicacion_sol_fkey"
            columns: ["id_ubicacion_sol"]
            isOneToOne: false
            referencedRelation: "ubicacion_solicitante"
            referencedColumns: ["id_ubicacion_sol"]
          },
        ]
      }
      tecnico: {
        Row: {
          created_at: string | null
          email: string | null
          id_laboratorio: number | null
          id_tecnico: number
          id_ubicacion_tec: number | null
          identificacion: number | null
          nombre: string
          profesion: string | null
          telefono: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id_laboratorio?: number | null
          id_tecnico?: number
          id_ubicacion_tec?: number | null
          identificacion?: number | null
          nombre: string
          profesion?: string | null
          telefono?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id_laboratorio?: number | null
          id_tecnico?: number
          id_ubicacion_tec?: number | null
          identificacion?: number | null
          nombre?: string
          profesion?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnico_id_laboratorio_fkey"
            columns: ["id_laboratorio"]
            isOneToOne: false
            referencedRelation: "laboratorio"
            referencedColumns: ["id_laboratorio"]
          },
          {
            foreignKeyName: "tecnico_id_ubicacion_tec_fkey"
            columns: ["id_ubicacion_tec"]
            isOneToOne: false
            referencedRelation: "ubicacion_tecnico"
            referencedColumns: ["id_ubicacion_tec"]
          },
        ]
      }
      ubicacion: {
        Row: {
          created_at: string | null
          departamento: string
          id_ubicacion: number
          municipio: string
          vereda: string | null
        }
        Insert: {
          created_at?: string | null
          departamento: string
          id_ubicacion?: number
          municipio: string
          vereda?: string | null
        }
        Update: {
          created_at?: string | null
          departamento?: string
          id_ubicacion?: number
          municipio?: string
          vereda?: string | null
        }
        Relationships: []
      }
      ubicacion_laboratorio: {
        Row: {
          created_at: string | null
          departamento: string
          direccion: string | null
          id_ubicacion_lab: number
          municipio: string
        }
        Insert: {
          created_at?: string | null
          departamento: string
          direccion?: string | null
          id_ubicacion_lab?: number
          municipio: string
        }
        Update: {
          created_at?: string | null
          departamento?: string
          direccion?: string | null
          id_ubicacion_lab?: number
          municipio?: string
        }
        Relationships: []
      }
      ubicacion_solicitante: {
        Row: {
          created_at: string | null
          departamento: string
          id_ubicacion_sol: number
          municipio: string
        }
        Insert: {
          created_at?: string | null
          departamento: string
          id_ubicacion_sol?: number
          municipio: string
        }
        Update: {
          created_at?: string | null
          departamento?: string
          id_ubicacion_sol?: number
          municipio?: string
        }
        Relationships: []
      }
      ubicacion_tecnico: {
        Row: {
          created_at: string | null
          departamento: string
          direccion: string | null
          id_ubicacion_tec: number
          municipio: string
        }
        Insert: {
          created_at?: string | null
          departamento: string
          direccion?: string | null
          id_ubicacion_tec?: number
          municipio: string
        }
        Update: {
          created_at?: string | null
          departamento?: string
          direccion?: string | null
          id_ubicacion_tec?: number
          municipio?: string
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
