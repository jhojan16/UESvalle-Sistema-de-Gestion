// Supabase generated types - FULL SCHEMA UPDATED

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analisis_muestra: {
        Row: {
          id_analisis_muestra: number
          tipo_analisis: string
          caracteristica: string | null
          metodo: string | null
          resultado: number | null
          unidades: string | null
          valores_aceptados: string | null
          diagnostico: string | null
          id_muestra: number | null
        }
        Insert: {
          id_analisis_muestra?: number
          tipo_analisis: string
          caracteristica?: string | null
          metodo?: string | null
          resultado?: number | null
          unidades?: string | null
          valores_aceptados?: string | null
          diagnostico?: string | null
          id_muestra?: number | null
        }
        Update: {
          id_analisis_muestra?: number
          tipo_analisis?: string
          caracteristica?: string | null
          metodo?: string | null
          resultado?: number | null
          unidades?: string | null
          valores_aceptados?: string | null
          diagnostico?: string | null
          id_muestra?: number | null
        }
        Relationships: []
      }

      MuestraResumen: {
        Row: {
          id_muestra: number
          cantidad_analisis: number
          tipos_analisis: string[]
          ultimo_analisis?: string
        }
      }

      anexo: {
        Row: {
          id_reporte1: number
          inspeccion_ocular: string | null
          tipo_inspeccion_ocular: string | null
          fecha_inspeccion_ocular: string | null
          fecha_entidades: string | null
          departamento: string | null
          municipio: string | null
          vereda: string | null
          autoridad_sanitaria: string | null
          id_mapa: number | null
          fecha_reunion_entidades: string | null
        }
        Insert: {
          id_reporte1?: number
          inspeccion_ocular?: string | null
          tipo_inspeccion_ocular?: string | null
          fecha_inspeccion_ocular?: string | null
          fecha_entidades?: string | null
          departamento?: string | null
          municipio?: string | null
          vereda?: string | null
          autoridad_sanitaria?: string | null
          id_mapa?: number | null
          fecha_reunion_entidades?: string | null
        }
        Update: {
          id_reporte1?: number
          inspeccion_ocular?: string | null
          tipo_inspeccion_ocular?: string | null
          fecha_inspeccion_ocular?: string | null
          fecha_entidades?: string | null
          departamento?: string | null
          municipio?: string | null
          vereda?: string | null
          autoridad_sanitaria?: string | null
          id_mapa?: number | null
          fecha_reunion_entidades?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anexo_id_mapa_fkey"
            columns: ["id_mapa"]
            isOneToOne: false
            referencedRelation: "mapa_riesgo"
            referencedColumns: ["id_mapa"]
          }
        ]
      }

      anexo2: {
        Row: {
          id_reporte2: number
          consecutivo_mapa_riesgo: string | null
          anterior_mapa_riesgo: string | null
          id_mapa: number | null
        }
        Insert: {
          id_reporte2?: number
          consecutivo_mapa_riesgo?: string | null
          anterior_mapa_riesgo?: string | null
          id_mapa?: number | null
        }
        Update: {
          id_reporte2?: number
          consecutivo_mapa_riesgo?: string | null
          anterior_mapa_riesgo?: string | null
          id_mapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anexo2_id_mapa_fkey"
            columns: ["id_mapa"]
            isOneToOne: false
            referencedRelation: "mapa_riesgo"
            referencedColumns: ["id_mapa"]
          }
        ]
      }

      bocatoma: {
        Row: {
          id_bocatoma: number
          fecha: string | null
          caract_fisica: string | null
          caract_quimica: string | null
          caract_microbiologicas: string | null
          caract_especiales: string | null
          descartadas: string | null
          id_reporte2: number | null
        }
        Insert: {
          id_bocatoma?: number
          fecha?: string | null
          caract_fisica?: string | null
          caract_quimica?: string | null
          caract_microbiologicas?: string | null
          caract_especiales?: string | null
          descartadas?: string | null
          id_reporte2?: number | null
        }
        Update: {
          id_bocatoma?: number
          fecha?: string | null
          caract_fisica?: string | null
          caract_quimica?: string | null
          caract_microbiologicas?: string | null
          caract_especiales?: string | null
          descartadas?: string | null
          id_reporte2?: number | null
        }
        Relationships: []
      }

      caracteristica: {
        Row: {
          id_caracteristica: number
          caracteristica_seguimiento: string | null
          frecuencia_pp: string | null
          minimo_muestras_pp: string | null
          frecuencia_as: string | null
          minimo_muestras_as: string | null
          id_reporte3: number | null
        }
        Insert: {
          id_caracteristica?: number
          caracteristica_seguimiento?: string | null
          frecuencia_pp?: string | null
          minimo_muestras_pp?: string | null
          frecuencia_as?: string | null
          minimo_muestras_as?: string | null
          id_reporte3?: number | null
        }
        Update: {
          id_caracteristica?: number
          caracteristica_seguimiento?: string | null
          frecuencia_pp?: string | null
          minimo_muestras_pp?: string | null
          frecuencia_as?: string | null
          minimo_muestras_as?: string | null
          id_reporte3?: number | null
        }
        Relationships: []
      }

      caracteristica_priorizada: {
        Row: {
          id_caracteristica: number
          actividad_contaminante: string | null
          caract_fisica: string | null
          caract_quimica: string | null
          caract_microbiologica: string | null
          caract_especial: string | null
          observaciones: string | null
          id_reporte1: number | null
        }
        Insert: {
          id_caracteristica?: number
          actividad_contaminante?: string | null
          caract_fisica?: string | null
          caract_quimica?: string | null
          caract_microbiologica?: string | null
          caract_especial?: string | null
          observaciones?: string | null
          id_reporte1?: number | null
        }
        Update: {
          id_caracteristica?: number
          actividad_contaminante?: string | null
          caract_fisica?: string | null
          caract_quimica?: string | null
          caract_microbiologica?: string | null
          caract_especial?: string | null
          observaciones?: string | null
          id_reporte1?: number | null
        }
        Relationships: []
      }

      documento_fuente: {
        Row: {
          id_documento: number
          fuente_info: string | null
          nombre_documento: string | null
          tipo_documento: string | null
          autor: string | null
          fecha_publicacion: string | null
          id_reporte1: number | null
        }
        Insert: {
          id_documento?: number
          fuente_info?: string | null
          nombre_documento?: string | null
          tipo_documento?: string | null
          autor?: string | null
          fecha_publicacion?: string | null
          id_reporte1?: number | null
        }
        Update: {
          id_documento?: number
          fuente_info?: string | null
          nombre_documento?: string | null
          tipo_documento?: string | null
          autor?: string | null
          fecha_publicacion?: string | null
          id_reporte1?: number | null
        }
        Relationships: []
      }

      entidad_participante: {
        Row: {
          id_entidad: number
          entidad: string | null
          dependencia: string | null
          cargo: string | null
          id_reporte1: number | null
        }
        Insert: {
          id_entidad?: number
          entidad?: string | null
          dependencia?: string | null
          cargo?: string | null
          id_reporte1?: number | null
        }
        Update: {
          id_entidad?: number
          entidad?: string | null
          dependencia?: string | null
          cargo?: string | null
          id_reporte1?: number | null
        }
        Relationships: []
      }

      fuente: {
        Row: {
          id_fuente: number
          nombre: string
          clase: string | null
          tipo: string | null
          id_ubicacion: number | null
        }
        Insert: {
          id_fuente?: number
          nombre: string
          clase?: string | null
          tipo?: string | null
          id_ubicacion?: number | null
        }
        Update: {
          id_fuente?: number
          nombre?: string
          clase?: string | null
          tipo?: string | null
          id_ubicacion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fuente_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicacion"
            referencedColumns: ["id_ubicacion"]
          }
        ]
      }

      inspeccion: {
        Row: {
          id_inspeccion: number
          id_inspeccion_sivicap: number | null
          fecha_inspeccion: string | null
          autoridad_inspeccion: string | null
          fecha_visita_anterior: string | null
          nombre_visita_anterior: string | null
          copia_visita_anterior: string | null
          concepto: string | null
          plazo_ejecucion_inspeccion: string | null
          plan_mejoramiento: string | null
          habitantes_municipio: number | null
          viviendas: number | null
          viviendas_urbano: number | null
          iraba_inspeccion: number | null
          indice_tratamiento: number | null
          indice_continuidad: number | null
          bps: number | null
          estado: string | null
          id_prestador: number | null
        }
        Insert: {
          id_inspeccion: number
          id_inspeccion_sivicap?: number | null
          fecha_inspeccion?: string | null
          autoridad_inspeccion?: string | null
          fecha_visita_anterior?: string | null
          nombre_visita_anterior?: string | null
          copia_visita_anterior?: string | null
          concepto?: string | null
          plazo_ejecucion_inspeccion?: string | null
          plan_mejoramiento?: string | null
          habitantes_municipio?: number | null
          viviendas?: number | null
          viviendas_urbano?: number | null
          iraba_inspeccion?: number | null
          indice_tratamiento?: number | null
          indice_continuidad?: number | null
          bps?: number | null
          estado?: string | null
          id_prestador?: number | null
        }
        Update: {
          id_inspeccion?: number
          id_inspeccion_sivicap?: number | null
          fecha_inspeccion?: string | null
          autoridad_inspeccion?: string | null
          fecha_visita_anterior?: string | null
          nombre_visita_anterior?: string | null
          copia_visita_anterior?: string | null
          concepto?: string | null
          plazo_ejecucion_inspeccion?: string | null
          plan_mejoramiento?: string | null
          habitantes_municipio?: number | null
          viviendas?: number | null
          viviendas_urbano?: number | null
          iraba_inspeccion?: number | null
          indice_tratamiento?: number | null
          indice_continuidad?: number | null
          bps?: number | null
          estado?: string | null
          id_prestador?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspeccion_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          }
        ]
      }

      laboratorio: {
        Row: {
          id_laboratorio: number
          nombre: string
          estado: string | null
          telefono: string | null
          email: string | null
          id_ubicacion_lab: number | null
        }
        Insert: {
          id_laboratorio?: number
          nombre: string
          estado?: string | null
          telefono?: string | null
          email?: string | null
          id_ubicacion_lab?: number | null
        }
        Update: {
          id_laboratorio?: number
          nombre?: string
          estado?: string | null
          telefono?: string | null
          email?: string | null
          id_ubicacion_lab?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "laboratorio_id_ubicacion_lab_fkey"
            columns: ["id_ubicacion_lab"]
            isOneToOne: false
            referencedRelation: "ubicacion_laboratorio"
            referencedColumns: ["id_ubicacion_lab"]
          }
        ]
      }

      mapa_riesgo: {
        Row: {
          id_mapa: number
          id_prestador: number | null
          id_punto_captacion: number | null
        }
        Insert: {
          id_mapa: number
          id_prestador?: number | null
          id_punto_captacion?: number | null
        }
        Update: {
          id_mapa?: number
          id_prestador?: number | null
          id_punto_captacion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mapa_riesgo_id_punto_captacion_fkey"
            columns: ["id_punto_captacion"]
            isOneToOne: false
            referencedRelation: "punto_captacion"
            referencedColumns: ["id_punto_captacion"]
          },
          {
            foreignKeyName: "mapa_riesgo_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          }
        ]
      }

      muestra: {
        Row: {
          id_muestra: number
          muestra_no: string
          contramuestra_pp: string | null
          id_prestador: number | null
          id_laboratorio: number | null
          id_solicitante: number | null
          fecha_toma: string | null
          fecha_recepcion_lab: string | null
          fecha_analisis_lab: string | null
          desinfectante: string | null
          coagulante: string | null
          analisis_solicitados: string | null
          resultados_para: string | null
          observaciones: string | null
          nota: string | null
          irca_basico: number | null
          irca_especial: number | null
          irca: number | null
          nivel_riesgo: string | null
          id_muestreo: number | null
          codigo_laboratorio: string | null
          tipo_muestra: string | null
        }
        Insert: {
          id_muestra?: number
          muestra_no: string
          contramuestra_pp?: string | null
          id_prestador?: number | null
          id_laboratorio?: number | null
          id_solicitante?: number | null
          fecha_toma?: string | null
          fecha_recepcion_lab?: string | null
          fecha_analisis_lab?: string | null
          desinfectante?: string | null
          coagulante?: string | null
          analisis_solicitados?: string | null
          resultados_para?: string | null
          observaciones?: string | null
          nota?: string | null
          irca_basico?: number | null
          irca_especial?: number | null
          irca?: number | null
          nivel_riesgo?: string | null
          id_muestreo?: number | null
          codigo_laboratorio?: string | null
          tipo_muestra?: string | null
        }
        Update: {
          id_muestra?: number
          muestra_no?: string
          contramuestra_pp?: string | null
          id_prestador?: number | null
          id_laboratorio?: number | null
          id_solicitante?: number | null
          fecha_toma?: string | null
          fecha_recepcion_lab?: string | null
          fecha_analisis_lab?: string | null
          desinfectante?: string | null
          coagulante?: string | null
          analisis_solicitados?: string | null
          resultados_para?: string | null
          observaciones?: string | null
          nota?: string | null
          irca_basico?: number | null
          irca_especial?: number | null
          irca?: number | null
          nivel_riesgo?: string | null
          id_muestreo?: number | null
          codigo_laboratorio?: string | null
          tipo_muestra?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "muestra_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          },
          {
            foreignKeyName: "muestra_id_laboratorio_fkey"
            columns: ["id_laboratorio"]
            isOneToOne: false
            referencedRelation: "laboratorio"
            referencedColumns: ["id_laboratorio"]
          },
          {
            foreignKeyName: "muestra_id_muestreo_fkey"
            columns: ["id_muestreo"]
            isOneToOne: false
            referencedRelation: "punto_muestreo"
            referencedColumns: ["id_muestreo"]
          }
        ]
      }

      prestador: {
        Row: {
          id_prestador: number
          nit: string | null
          id_autoridad_sanitaria: string | null
          nombre: string | null
          direccion: string | null
          telefono: string | null
          id_ubicacion: number | null
          codigo_sistema: number | null
          codigo_anterior: number | null
          nombre_sistema: string | null
        }
        Insert: {
          id_prestador?: number
          nit?: string | null
          id_autoridad_sanitaria?: string | null
          nombre?: string | null
          direccion?: string | null
          telefono?: string | null
          id_ubicacion?: number | null
          codigo_sistema?: number | null
          codigo_anterior?: number | null
          nombre_sistema?: string | null
        }
        Update: {
          id_prestador?: number
          nit?: string | null
          id_autoridad_sanitaria?: string | null
          nombre?: string | null
          direccion?: string | null
          telefono?: string | null
          id_ubicacion?: number | null
          codigo_sistema?: number | null
          codigo_anterior?: number | null
          nombre_sistema?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prestador_id_ubicacion_fkey"
            columns: ["id_ubicacion"]
            isOneToOne: false
            referencedRelation: "ubicacion"
            referencedColumns: ["id_ubicacion"]
          }
        ]
      }

      profiles: {
        Row: {
          id: string
          nombre: string | null
          email: string | null
          rol: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          nombre?: string | null
          email?: string | null
          rol?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
          email?: string | null
          rol?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }

      punto_captacion: {
        Row: {
          id_punto_captacion: number
          tipo_captacion: string
          fuente_captacion: string | null
          georeferenciacion: string | null
          departamento: string | null
          municipio: string | null
          vereda: string | null
        }
        Insert: {
          id_punto_captacion?: number
          tipo_captacion: string
          fuente_captacion?: string | null
          georeferenciacion?: string | null
          departamento?: string | null
          municipio?: string | null
          vereda?: string | null
        }
        Update: {
          id_punto_captacion?: number
          tipo_captacion?: string
          fuente_captacion?: string | null
          georeferenciacion?: string | null
          departamento?: string | null
          municipio?: string | null
          vereda?: string | null
        }
        Relationships: []
      }

      punto_muestreo: {
        Row: {
          id_muestreo: number
          codigo: string
          nombre: string | null
          descripcion: string | null
          departamento: string | null
          municipio: string | null
          vereda: string | null
          latitud: string | null
          longitud: string | null
          direccion: string | null
        }
        Insert: {
          id_muestreo?: number
          codigo: string
          nombre?: string | null
          descripcion?: string | null
          departamento?: string | null
          municipio?: string | null
          vereda?: string | null
          latitud?: string | null
          longitud?: string | null
          direccion?: string | null
        }
        Update: {
          id_muestreo?: number
          codigo?: string
          nombre?: string | null
          descripcion?: string | null
          departamento?: string | null
          municipio?: string | null
          vereda?: string | null
          latitud?: string | null
          longitud?: string | null
          direccion?: string | null
        }
        Relationships: []
      }

      red: {
        Row: {
          id_red: number
          fecha: string | null
          caract_fisicas: string | null
          caract_quimicas: string | null
          caract_microbiologicas: string | null
          caract_especiales: string | null
          descartadas: string | null
          medidas_sanitarias: string | null
          observaciones: string | null
          id_reporte2: number | null
        }
        Insert: {
          id_red?: number
          fecha?: string | null
          caract_fisicas?: string | null
          caract_quimicas?: string | null
          caract_microbiologicas?: string | null
          caract_especiales?: string | null
          descartadas?: string | null
          medidas_sanitarias?: string | null
          observaciones?: string | null
          id_reporte2?: number | null
        }
        Update: {
          id_red?: number
          fecha?: string | null
          caract_fisicas?: string | null
          caract_quimicas?: string | null
          caract_microbiologicas?: string | null
          caract_especiales?: string | null
          descartadas?: string | null
          medidas_sanitarias?: string | null
          observaciones?: string | null
          id_reporte2?: number | null
        }
        Relationships: []
      }

      representante: {
        Row: {
          id_representante: number
          nombre: string
          cargo: string | null
          email: string | null
          id_prestador: number | null
        }
        Insert: {
          id_representante?: number
          nombre: string
          cargo?: string | null
          email?: string | null
          id_prestador?: number | null
        }
        Update: {
          id_representante?: number
          nombre?: string
          cargo?: string | null
          email?: string | null
          id_prestador?: number | null
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

      resolucion: {
        Row: {
          id_resolucion: number
          numero_resolucion: string | null
          fecha_expedicion: string | null
          archivo_resolucion: string | null
          id_reporte2: number | null
        }
        Insert: {
          id_resolucion?: number
          numero_resolucion?: string | null
          fecha_expedicion?: string | null
          archivo_resolucion?: string | null
          id_reporte2?: number | null
        }
        Update: {
          id_resolucion?: number
          numero_resolucion?: string | null
          fecha_expedicion?: string | null
          archivo_resolucion?: string | null
          id_reporte2?: number | null
        }
        Relationships: []
      }

      riesgo: {
        Row: {
          id_riesgo: number
          actividad: string | null
          entidad: string | null
          evidencia: string | null
          fecha: string | null
          cumple: string | null
          id_reporte3: number | null
        }
        Insert: {
          id_riesgo?: number
          actividad?: string | null
          entidad?: string | null
          evidencia?: string | null
          fecha?: string | null
          cumple?: string | null
          id_reporte3?: number | null
        }
        Update: {
          id_riesgo?: number
          actividad?: string | null
          entidad?: string | null
          evidencia?: string | null
          fecha?: string | null
          cumple?: string | null
          id_reporte3?: number | null
        }
        Relationships: []
      }

      seguimiento: {
        Row: {
          id_reporte3: number
          consecutivo_mapa_riesgo: string | null
          fecha_creacion: string | null
          fecha_actualizacion: string | null
          id_mapa: number | null
        }
        Insert: {
          id_reporte3?: number
          consecutivo_mapa_riesgo?: string | null
          fecha_creacion?: string | null
          fecha_actualizacion?: string | null
          id_mapa?: number | null
        }
        Update: {
          id_reporte3?: number
          consecutivo_mapa_riesgo?: string | null
          fecha_creacion?: string | null
          fecha_actualizacion?: string | null
          id_mapa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_id_mapa_fkey"
            columns: ["id_mapa"]
            isOneToOne: false
            referencedRelation: "mapa_riesgo"
            referencedColumns: ["id_mapa"]
          }
        ]
      }

      seguimiento_inspeccion: {
        Row: {
          id_inspeccion: number
          nombre_archivo: string | null
          acta: string | null
          fecha_acta: string | null
        }
        Insert: {
          id_inspeccion?: number
          nombre_archivo?: string | null
          acta?: string | null
          fecha_acta?: string | null
        }
        Update: {
          id_inspeccion?: number
          nombre_archivo?: string | null
          acta?: string | null
          fecha_acta?: string | null
        }
        Relationships: []
      }

      seguridad: {
        Row: {
          id_seguridad: number
          medida: string | null
          fecha: string | null
          observacion: string | null
          id_reporte3: number | null
        }
        Insert: {
          id_seguridad?: number
          medida?: string | null
          fecha?: string | null
          observacion?: string | null
          id_reporte3?: number | null
        }
        Update: {
          id_seguridad?: number
          medida?: string | null
          fecha?: string | null
          observacion?: string | null
          id_reporte3?: number | null
        }
        Relationships: []
      }

      solicitante: {
        Row: {
          id_solicitante: number
          nombre: string
          estado: string | null
          id_ubicacion_sol: number | null
        }
        Insert: {
          id_solicitante?: number
          nombre: string
          estado?: string | null
          id_ubicacion_sol?: number | null
        }
        Update: {
          id_solicitante?: number
          nombre?: string
          estado?: string | null
          id_ubicacion_sol?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitante_id_ubicacion_sol_fkey"
            columns: ["id_ubicacion_sol"]
            isOneToOne: false
            referencedRelation: "ubicacion_solicitante"
            referencedColumns: ["id_ubicacion_sol"]
          }
        ]
      }

      tecnico: {
        Row: {
          id_tecnico: number
          identificacion: number | null
          nombre: string
          telefono: string | null
          profesion: string | null
          email: string | null
          id_ubicacion_tec: number | null
          id_laboratorio: number | null
        }
        Insert: {
          id_tecnico?: number
          identificacion?: number | null
          nombre: string
          telefono?: string | null
          profesion?: string | null
          email?: string | null
          id_ubicacion_tec?: number | null
          id_laboratorio?: number | null
        }
        Update: {
          id_tecnico?: number
          identificacion?: number | null
          nombre?: string
          telefono?: string | null
          profesion?: string | null
          email?: string | null
          id_ubicacion_tec?: number | null
          id_laboratorio?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnico_id_ubicacion_tec_fkey"
            columns: ["id_ubicacion_tec"]
            isOneToOne: false
            referencedRelation: "ubicacion_tecnico"
            referencedColumns: ["id_ubicacion_tec"]
          },
          {
            foreignKeyName: "tecnico_id_laboratorio_fkey"
            columns: ["id_laboratorio"]
            isOneToOne: false
            referencedRelation: "laboratorio"
            referencedColumns: ["id_laboratorio"]
          }
        ]
      }

      ubicacion: {
        Row: {
          id_ubicacion: number
          departamento: string
          municipio: string
          vereda: string | null
        }
        Insert: {
          id_ubicacion?: number
          departamento: string
          municipio: string
          vereda?: string | null
        }
        Update: {
          id_ubicacion?: number
          departamento?: string
          municipio?: string
          vereda?: string | null
        }
        Relationships: []
      }

      ubicacion_laboratorio: {
        Row: {
          id_ubicacion_lab: number
          departamento: string
          municipio: string
          direccion: string | null
        }
        Insert: {
          id_ubicacion_lab?: number
          departamento: string
          municipio: string
          direccion?: string | null
        }
        Update: {
          id_ubicacion_lab?: number
          departamento?: string
          municipio?: string
          direccion?: string | null
        }
        Relationships: []
      }

      ubicacion_solicitante: {
        Row: {
          id_ubicacion_sol: number
          departamento: string
          municipio: string
        }
        Insert: {
          id_ubicacion_sol?: number
          departamento: string
          municipio: string
        }
        Update: {
          id_ubicacion_sol?: number
          departamento?: string
          municipio?: string
        }
        Relationships: []
      }

      ubicacion_tecnico: {
        Row: {
          id_ubicacion_tec: number
          departamento: string
          municipio: string
          direccion: string | null
        }
        Insert: {
          id_ubicacion_tec?: number
          departamento: string
          municipio: string
          direccion?: string | null
        }
        Update: {
          id_ubicacion_tec?: number
          departamento?: string
          municipio?: string
          direccion?: string | null
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

export type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
  ? DefaultSchema[DefaultSchemaEnumNameOrOptions]
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
  ? DefaultSchema[PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
