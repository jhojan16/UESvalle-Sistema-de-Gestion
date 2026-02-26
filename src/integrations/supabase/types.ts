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
      analisis_muestra: {
        Row: {
          caracteristica: string | null
          diagnostico: string | null
          id_analisis_muestra: number
          id_muestra: number
          metodo: string | null
          resultado: string | null
          tipo_analisis: string | null
          unidades: string | null
          valores_aceptados: string | null
        }
        Insert: {
          caracteristica?: string | null
          diagnostico?: string | null
          id_analisis_muestra?: number
          id_muestra: number
          metodo?: string | null
          resultado?: string | null
          tipo_analisis?: string | null
          unidades?: string | null
          valores_aceptados?: string | null
        }
        Update: {
          caracteristica?: string | null
          diagnostico?: string | null
          id_analisis_muestra?: number
          id_muestra?: number
          metodo?: string | null
          resultado?: string | null
          tipo_analisis?: string | null
          unidades?: string | null
          valores_aceptados?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analisis_muestra_id_muestra_fkey"
            columns: ["id_muestra"]
            isOneToOne: false
            referencedRelation: "muestra"
            referencedColumns: ["id_muestra"]
          },
        ]
      }
      anexo: {
        Row: {
          autoridad_sanitaria: string | null
          departamento: string | null
          fecha_entidades: string | null
          fecha_inspeccion_ocular: string | null
          fecha_reunion_entidades: string | null
          id_mapa: number | null
          id_reporte1: number
          inspeccion_ocular: string | null
          municipio: string | null
          tipo_inspeccion_ocular: string | null
          vereda: string | null
        }
        Insert: {
          autoridad_sanitaria?: string | null
          departamento?: string | null
          fecha_entidades?: string | null
          fecha_inspeccion_ocular?: string | null
          fecha_reunion_entidades?: string | null
          id_mapa?: number | null
          id_reporte1?: number
          inspeccion_ocular?: string | null
          municipio?: string | null
          tipo_inspeccion_ocular?: string | null
          vereda?: string | null
        }
        Update: {
          autoridad_sanitaria?: string | null
          departamento?: string | null
          fecha_entidades?: string | null
          fecha_inspeccion_ocular?: string | null
          fecha_reunion_entidades?: string | null
          id_mapa?: number | null
          id_reporte1?: number
          inspeccion_ocular?: string | null
          municipio?: string | null
          tipo_inspeccion_ocular?: string | null
          vereda?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anexo_id_mapa_fkey"
            columns: ["id_mapa"]
            isOneToOne: false
            referencedRelation: "mapa_riesgo"
            referencedColumns: ["id_mapa"]
          },
        ]
      }
      anexo2: {
        Row: {
          anterior_mapa_riesgo: string | null
          consecutivo_mapa_riesgo: string | null
          id_mapa: number | null
          id_reporte2: number
        }
        Insert: {
          anterior_mapa_riesgo?: string | null
          consecutivo_mapa_riesgo?: string | null
          id_mapa?: number | null
          id_reporte2?: number
        }
        Update: {
          anterior_mapa_riesgo?: string | null
          consecutivo_mapa_riesgo?: string | null
          id_mapa?: number | null
          id_reporte2?: number
        }
        Relationships: [
          {
            foreignKeyName: "anexo2_id_mapa_fkey"
            columns: ["id_mapa"]
            isOneToOne: false
            referencedRelation: "mapa_riesgo"
            referencedColumns: ["id_mapa"]
          },
        ]
      }
      bocatoma: {
        Row: {
          caract_especiales: string | null
          caract_fisica: string | null
          caract_microbiologicas: string | null
          caract_quimica: string | null
          descartadas: string | null
          fecha: string | null
          id_bocatoma: number
          id_reporte2: number | null
        }
        Insert: {
          caract_especiales?: string | null
          caract_fisica?: string | null
          caract_microbiologicas?: string | null
          caract_quimica?: string | null
          descartadas?: string | null
          fecha?: string | null
          id_bocatoma?: number
          id_reporte2?: number | null
        }
        Update: {
          caract_especiales?: string | null
          caract_fisica?: string | null
          caract_microbiologicas?: string | null
          caract_quimica?: string | null
          descartadas?: string | null
          fecha?: string | null
          id_bocatoma?: number
          id_reporte2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bocatoma_id_reporte2_fkey"
            columns: ["id_reporte2"]
            isOneToOne: false
            referencedRelation: "anexo2"
            referencedColumns: ["id_reporte2"]
          },
        ]
      }
      caracteristica_priorizada: {
        Row: {
          actividad_contaminante: string | null
          carac_especial: string | null
          carac_fisica: string | null
          carac_microbiologica: string | null
          carac_quimica: string | null
          id_caracteristica: number
          id_reporte1: number | null
          observaciones: string | null
        }
        Insert: {
          actividad_contaminante?: string | null
          carac_especial?: string | null
          carac_fisica?: string | null
          carac_microbiologica?: string | null
          carac_quimica?: string | null
          id_caracteristica?: number
          id_reporte1?: number | null
          observaciones?: string | null
        }
        Update: {
          actividad_contaminante?: string | null
          carac_especial?: string | null
          carac_fisica?: string | null
          carac_microbiologica?: string | null
          carac_quimica?: string | null
          id_caracteristica?: number
          id_reporte1?: number | null
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "caracteristica_priorizada_id_reporte1_fkey"
            columns: ["id_reporte1"]
            isOneToOne: false
            referencedRelation: "anexo"
            referencedColumns: ["id_reporte1"]
          },
        ]
      }
      documento_fuente: {
        Row: {
          autor: string | null
          fecha_publicacion: string | null
          fuente_info: string | null
          id_documento: number
          id_reporte1: number | null
          nombre_documento: string | null
          tipo_documento: string | null
        }
        Insert: {
          autor?: string | null
          fecha_publicacion?: string | null
          fuente_info?: string | null
          id_documento?: number
          id_reporte1?: number | null
          nombre_documento?: string | null
          tipo_documento?: string | null
        }
        Update: {
          autor?: string | null
          fecha_publicacion?: string | null
          fuente_info?: string | null
          id_documento?: number
          id_reporte1?: number | null
          nombre_documento?: string | null
          tipo_documento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documento_fuente_id_reporte1_fkey"
            columns: ["id_reporte1"]
            isOneToOne: false
            referencedRelation: "anexo"
            referencedColumns: ["id_reporte1"]
          },
        ]
      }
      entidad_participante: {
        Row: {
          cargo: string | null
          dependencia: string | null
          entidad: string | null
          id_entidad: number
          id_reporte1: number | null
        }
        Insert: {
          cargo?: string | null
          dependencia?: string | null
          entidad?: string | null
          id_entidad?: number
          id_reporte1?: number | null
        }
        Update: {
          cargo?: string | null
          dependencia?: string | null
          entidad?: string | null
          id_entidad?: number
          id_reporte1?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entidad_participante_id_reporte1_fkey"
            columns: ["id_reporte1"]
            isOneToOne: false
            referencedRelation: "anexo"
            referencedColumns: ["id_reporte1"]
          },
        ]
      }
      fuente: {
        Row: {
          clase: string | null
          id_fuente: number
          id_ubicacion: number | null
          nombre: string
          tipo: string | null
        }
        Insert: {
          clase?: string | null
          id_fuente?: number
          id_ubicacion?: number | null
          nombre: string
          tipo?: string | null
        }
        Update: {
          clase?: string | null
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
      inspeccion: {
        Row: {
          autoridad_inspeccion: string | null
          bps: number | null
          concepto: string | null
          copia_visita_anterior: string | null
          estado: string | null
          fecha_inspeccion: string | null
          fecha_visita_anterior: string | null
          habitantes_municipio: number | null
          id_inspeccion: number
          id_inspeccion_sivicap: string | null
          id_prestador: number | null
          indice_continuidad: number | null
          indice_tratamiento: number | null
          iraba_inspeccion: number | null
          nombre_visita_anterior: string | null
          plan_mejoramiento: string | null
          plazo_ejecucion_inspeccion: string | null
          viviendas: number | null
          viviendas_urbano: number | null
        }
        Insert: {
          autoridad_inspeccion?: string | null
          bps?: number | null
          concepto?: string | null
          copia_visita_anterior?: string | null
          estado?: string | null
          fecha_inspeccion?: string | null
          fecha_visita_anterior?: string | null
          habitantes_municipio?: number | null
          id_inspeccion?: number
          id_inspeccion_sivicap?: string | null
          id_prestador?: number | null
          indice_continuidad?: number | null
          indice_tratamiento?: number | null
          iraba_inspeccion?: number | null
          nombre_visita_anterior?: string | null
          plan_mejoramiento?: string | null
          plazo_ejecucion_inspeccion?: string | null
          viviendas?: number | null
          viviendas_urbano?: number | null
        }
        Update: {
          autoridad_inspeccion?: string | null
          bps?: number | null
          concepto?: string | null
          copia_visita_anterior?: string | null
          estado?: string | null
          fecha_inspeccion?: string | null
          fecha_visita_anterior?: string | null
          habitantes_municipio?: number | null
          id_inspeccion?: number
          id_inspeccion_sivicap?: string | null
          id_prestador?: number | null
          indice_continuidad?: number | null
          indice_tratamiento?: number | null
          iraba_inspeccion?: number | null
          nombre_visita_anterior?: string | null
          plan_mejoramiento?: string | null
          plazo_ejecucion_inspeccion?: string | null
          viviendas?: number | null
          viviendas_urbano?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inspeccion_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          },
        ]
      }
      inspeccion_staging: {
        Row: {
          autoridad_inspeccion: string | null
          batch_id: string | null
          bps: string | null
          concepto: string | null
          copia_visita_anterior: string | null
          created_at: string | null
          estado: string | null
          fecha_inspeccion: string | null
          fecha_visita_anterior: string | null
          habitantes_municipio: string | null
          id_inspeccion_sivicap: string | null
          id_staging: number
          indice_continuidad: string | null
          indice_tratamiento: string | null
          iraba_inspeccion: string | null
          nit: string | null
          nombre_visita_anterior: string | null
          plan_mejoramiento: string | null
          plazo_ejecucion_inspeccion: string | null
          processed: boolean | null
          viviendas: string | null
          viviendas_urbano: string | null
        }
        Insert: {
          autoridad_inspeccion?: string | null
          batch_id?: string | null
          bps?: string | null
          concepto?: string | null
          copia_visita_anterior?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_inspeccion?: string | null
          fecha_visita_anterior?: string | null
          habitantes_municipio?: string | null
          id_inspeccion_sivicap?: string | null
          id_staging?: number
          indice_continuidad?: string | null
          indice_tratamiento?: string | null
          iraba_inspeccion?: string | null
          nit?: string | null
          nombre_visita_anterior?: string | null
          plan_mejoramiento?: string | null
          plazo_ejecucion_inspeccion?: string | null
          processed?: boolean | null
          viviendas?: string | null
          viviendas_urbano?: string | null
        }
        Update: {
          autoridad_inspeccion?: string | null
          batch_id?: string | null
          bps?: string | null
          concepto?: string | null
          copia_visita_anterior?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_inspeccion?: string | null
          fecha_visita_anterior?: string | null
          habitantes_municipio?: string | null
          id_inspeccion_sivicap?: string | null
          id_staging?: number
          indice_continuidad?: string | null
          indice_tratamiento?: string | null
          iraba_inspeccion?: string | null
          nit?: string | null
          nombre_visita_anterior?: string | null
          plan_mejoramiento?: string | null
          plazo_ejecucion_inspeccion?: string | null
          processed?: boolean | null
          viviendas?: string | null
          viviendas_urbano?: string | null
        }
        Relationships: []
      }
      laboratorio: {
        Row: {
          email: string | null
          estado: string | null
          id_laboratorio: number
          id_ubicacion_lab: number | null
          nombre: string
          telefono: string | null
        }
        Insert: {
          email?: string | null
          estado?: string | null
          id_laboratorio?: number
          id_ubicacion_lab?: number | null
          nombre: string
          telefono?: string | null
        }
        Update: {
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
            foreignKeyName: "mapa_riesgo_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          },
          {
            foreignKeyName: "mapa_riesgo_id_punto_captacion_fkey"
            columns: ["id_punto_captacion"]
            isOneToOne: false
            referencedRelation: "punto_captacion"
            referencedColumns: ["id_punto_captacion"]
          },
        ]
      }
      mapa_riesgo_staging: {
        Row: {
          actividad_contaminante: string | null
          anexo1_departamento: string | null
          anexo1_municipio: string | null
          anexo1_vereda: string | null
          anexo2_consecutivo: string | null
          anterior_mapa_riesgo: string | null
          archivo_resolucion: string | null
          autor: string | null
          autoridad_sanitaria: string | null
          batch_id: string | null
          bocatoma_descartadas: string | null
          bocatoma_especiales: string | null
          bocatoma_fecha: string | null
          bocatoma_fisica: string | null
          bocatoma_micro: string | null
          bocatoma_quimica: string | null
          carac_especial: string | null
          carac_fisica: string | null
          carac_microbiologica: string | null
          carac_quimica: string | null
          caracteristica_seguimiento: string | null
          cargo: string | null
          cp_observaciones: string | null
          created_at: string | null
          dependencia: string | null
          entidad: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          fecha_entidades: string | null
          fecha_expedicion: string | null
          fecha_inspeccion_ocular: string | null
          fecha_publicacion: string | null
          fecha_reunion_entidades: string | null
          frecuencia_as: string | null
          frecuencia_pp: string | null
          fuente_captacion: string | null
          fuente_info: string | null
          georeferenciacion: string | null
          id_mapa: string | null
          id_staging: number
          inspeccion_ocular: string | null
          medidas_sanitarias: string | null
          minimo_muestras_as: string | null
          minimo_muestras_pp: string | null
          nit: string | null
          nombre_documento: string | null
          numero_resolucion: string | null
          pc_departamento: string | null
          pc_municipio: string | null
          pc_vereda: string | null
          processed: boolean | null
          red_descartadas: string | null
          red_especiales: string | null
          red_fecha: string | null
          red_fisica: string | null
          red_micro: string | null
          red_observaciones: string | null
          red_quimica: string | null
          riesgo_actividad: string | null
          riesgo_cumple: string | null
          riesgo_entidad: string | null
          riesgo_evidencia: string | null
          riesgo_fecha: string | null
          seguimiento_consecutivo: string | null
          seguridad_fecha: string | null
          seguridad_medida: string | null
          seguridad_observacion: string | null
          si_acta: string | null
          si_archivo: string | null
          si_fecha: string | null
          tipo_captacion: string | null
          tipo_documento: string | null
          tipo_inspeccion_ocular: string | null
        }
        Insert: {
          actividad_contaminante?: string | null
          anexo1_departamento?: string | null
          anexo1_municipio?: string | null
          anexo1_vereda?: string | null
          anexo2_consecutivo?: string | null
          anterior_mapa_riesgo?: string | null
          archivo_resolucion?: string | null
          autor?: string | null
          autoridad_sanitaria?: string | null
          batch_id?: string | null
          bocatoma_descartadas?: string | null
          bocatoma_especiales?: string | null
          bocatoma_fecha?: string | null
          bocatoma_fisica?: string | null
          bocatoma_micro?: string | null
          bocatoma_quimica?: string | null
          carac_especial?: string | null
          carac_fisica?: string | null
          carac_microbiologica?: string | null
          carac_quimica?: string | null
          caracteristica_seguimiento?: string | null
          cargo?: string | null
          cp_observaciones?: string | null
          created_at?: string | null
          dependencia?: string | null
          entidad?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_entidades?: string | null
          fecha_expedicion?: string | null
          fecha_inspeccion_ocular?: string | null
          fecha_publicacion?: string | null
          fecha_reunion_entidades?: string | null
          frecuencia_as?: string | null
          frecuencia_pp?: string | null
          fuente_captacion?: string | null
          fuente_info?: string | null
          georeferenciacion?: string | null
          id_mapa?: string | null
          id_staging?: never
          inspeccion_ocular?: string | null
          medidas_sanitarias?: string | null
          minimo_muestras_as?: string | null
          minimo_muestras_pp?: string | null
          nit?: string | null
          nombre_documento?: string | null
          numero_resolucion?: string | null
          pc_departamento?: string | null
          pc_municipio?: string | null
          pc_vereda?: string | null
          processed?: boolean | null
          red_descartadas?: string | null
          red_especiales?: string | null
          red_fecha?: string | null
          red_fisica?: string | null
          red_micro?: string | null
          red_observaciones?: string | null
          red_quimica?: string | null
          riesgo_actividad?: string | null
          riesgo_cumple?: string | null
          riesgo_entidad?: string | null
          riesgo_evidencia?: string | null
          riesgo_fecha?: string | null
          seguimiento_consecutivo?: string | null
          seguridad_fecha?: string | null
          seguridad_medida?: string | null
          seguridad_observacion?: string | null
          si_acta?: string | null
          si_archivo?: string | null
          si_fecha?: string | null
          tipo_captacion?: string | null
          tipo_documento?: string | null
          tipo_inspeccion_ocular?: string | null
        }
        Update: {
          actividad_contaminante?: string | null
          anexo1_departamento?: string | null
          anexo1_municipio?: string | null
          anexo1_vereda?: string | null
          anexo2_consecutivo?: string | null
          anterior_mapa_riesgo?: string | null
          archivo_resolucion?: string | null
          autor?: string | null
          autoridad_sanitaria?: string | null
          batch_id?: string | null
          bocatoma_descartadas?: string | null
          bocatoma_especiales?: string | null
          bocatoma_fecha?: string | null
          bocatoma_fisica?: string | null
          bocatoma_micro?: string | null
          bocatoma_quimica?: string | null
          carac_especial?: string | null
          carac_fisica?: string | null
          carac_microbiologica?: string | null
          carac_quimica?: string | null
          caracteristica_seguimiento?: string | null
          cargo?: string | null
          cp_observaciones?: string | null
          created_at?: string | null
          dependencia?: string | null
          entidad?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          fecha_entidades?: string | null
          fecha_expedicion?: string | null
          fecha_inspeccion_ocular?: string | null
          fecha_publicacion?: string | null
          fecha_reunion_entidades?: string | null
          frecuencia_as?: string | null
          frecuencia_pp?: string | null
          fuente_captacion?: string | null
          fuente_info?: string | null
          georeferenciacion?: string | null
          id_mapa?: string | null
          id_staging?: never
          inspeccion_ocular?: string | null
          medidas_sanitarias?: string | null
          minimo_muestras_as?: string | null
          minimo_muestras_pp?: string | null
          nit?: string | null
          nombre_documento?: string | null
          numero_resolucion?: string | null
          pc_departamento?: string | null
          pc_municipio?: string | null
          pc_vereda?: string | null
          processed?: boolean | null
          red_descartadas?: string | null
          red_especiales?: string | null
          red_fecha?: string | null
          red_fisica?: string | null
          red_micro?: string | null
          red_observaciones?: string | null
          red_quimica?: string | null
          riesgo_actividad?: string | null
          riesgo_cumple?: string | null
          riesgo_entidad?: string | null
          riesgo_evidencia?: string | null
          riesgo_fecha?: string | null
          seguimiento_consecutivo?: string | null
          seguridad_fecha?: string | null
          seguridad_medida?: string | null
          seguridad_observacion?: string | null
          si_acta?: string | null
          si_archivo?: string | null
          si_fecha?: string | null
          tipo_captacion?: string | null
          tipo_documento?: string | null
          tipo_inspeccion_ocular?: string | null
        }
        Relationships: []
      }
      muestra: {
        Row: {
          analisis_solicitados: string | null
          coagulante: string | null
          codigo_laboratorio: string | null
          contramuestra_pp: string | null
          desinfectante: string | null
          fecha_analisis_lab: string | null
          fecha_recepcion_lab: string | null
          fecha_toma: string | null
          id_laboratorio: number | null
          id_muestra: number
          id_muestreo: number | null
          id_prestador: number | null
          id_solicitante: number | null
          irca: number | null
          irca_basico: number | null
          irca_especial: number | null
          muestra_no: string
          nivel_riesgo: string | null
          nota: string | null
          observaciones: string | null
          resultados_para: string | null
          tipo_muestra: string | null
        }
        Insert: {
          analisis_solicitados?: string | null
          coagulante?: string | null
          codigo_laboratorio?: string | null
          contramuestra_pp?: string | null
          desinfectante?: string | null
          fecha_analisis_lab?: string | null
          fecha_recepcion_lab?: string | null
          fecha_toma?: string | null
          id_laboratorio?: number | null
          id_muestra?: number
          id_muestreo?: number | null
          id_prestador?: number | null
          id_solicitante?: number | null
          irca?: number | null
          irca_basico?: number | null
          irca_especial?: number | null
          muestra_no: string
          nivel_riesgo?: string | null
          nota?: string | null
          observaciones?: string | null
          resultados_para?: string | null
          tipo_muestra?: string | null
        }
        Update: {
          analisis_solicitados?: string | null
          coagulante?: string | null
          codigo_laboratorio?: string | null
          contramuestra_pp?: string | null
          desinfectante?: string | null
          fecha_analisis_lab?: string | null
          fecha_recepcion_lab?: string | null
          fecha_toma?: string | null
          id_laboratorio?: number | null
          id_muestra?: number
          id_muestreo?: number | null
          id_prestador?: number | null
          id_solicitante?: number | null
          irca?: number | null
          irca_basico?: number | null
          irca_especial?: number | null
          muestra_no?: string
          nivel_riesgo?: string | null
          nota?: string | null
          observaciones?: string | null
          resultados_para?: string | null
          tipo_muestra?: string | null
        }
        Relationships: [
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
          },
          {
            foreignKeyName: "muestra_id_prestador_fkey"
            columns: ["id_prestador"]
            isOneToOne: false
            referencedRelation: "prestador"
            referencedColumns: ["id_prestador"]
          },
        ]
      }
      muestra_staging: {
        Row: {
          analisis_solicitados: string | null
          batch_id: string | null
          caracteristica: string | null
          coagulante: string | null
          codigo: string | null
          codigo_laboratorio: string | null
          contramuestra_pp: string | null
          created_at: string | null
          departamento: string | null
          descripcion: string | null
          desinfectante: string | null
          diagnostico: string | null
          direccion: string | null
          fecha_analisis_lab: string | null
          fecha_recepcion_lab: string | null
          fecha_toma: string | null
          id_muestreo: string | null
          id_staging: number
          irca: string | null
          irca_basico: string | null
          irca_especial: string | null
          latitud: string | null
          longitud: string | null
          metodo: string | null
          muestra_no: string | null
          municipio: string | null
          nit: string | null
          nivel_riesgo: string | null
          nombre: string | null
          nota: string | null
          observaciones: string | null
          processed: boolean | null
          resultado: string | null
          resultados_para: string | null
          tipo_analisis: string | null
          tipo_muestra: string | null
          unidades: string | null
          valores_aceptados: string | null
          vereda: string | null
        }
        Insert: {
          analisis_solicitados?: string | null
          batch_id?: string | null
          caracteristica?: string | null
          coagulante?: string | null
          codigo?: string | null
          codigo_laboratorio?: string | null
          contramuestra_pp?: string | null
          created_at?: string | null
          departamento?: string | null
          descripcion?: string | null
          desinfectante?: string | null
          diagnostico?: string | null
          direccion?: string | null
          fecha_analisis_lab?: string | null
          fecha_recepcion_lab?: string | null
          fecha_toma?: string | null
          id_muestreo?: string | null
          id_staging?: number
          irca?: string | null
          irca_basico?: string | null
          irca_especial?: string | null
          latitud?: string | null
          longitud?: string | null
          metodo?: string | null
          muestra_no?: string | null
          municipio?: string | null
          nit?: string | null
          nivel_riesgo?: string | null
          nombre?: string | null
          nota?: string | null
          observaciones?: string | null
          processed?: boolean | null
          resultado?: string | null
          resultados_para?: string | null
          tipo_analisis?: string | null
          tipo_muestra?: string | null
          unidades?: string | null
          valores_aceptados?: string | null
          vereda?: string | null
        }
        Update: {
          analisis_solicitados?: string | null
          batch_id?: string | null
          caracteristica?: string | null
          coagulante?: string | null
          codigo?: string | null
          codigo_laboratorio?: string | null
          contramuestra_pp?: string | null
          created_at?: string | null
          departamento?: string | null
          descripcion?: string | null
          desinfectante?: string | null
          diagnostico?: string | null
          direccion?: string | null
          fecha_analisis_lab?: string | null
          fecha_recepcion_lab?: string | null
          fecha_toma?: string | null
          id_muestreo?: string | null
          id_staging?: number
          irca?: string | null
          irca_basico?: string | null
          irca_especial?: string | null
          latitud?: string | null
          longitud?: string | null
          metodo?: string | null
          muestra_no?: string | null
          municipio?: string | null
          nit?: string | null
          nivel_riesgo?: string | null
          nombre?: string | null
          nota?: string | null
          observaciones?: string | null
          processed?: boolean | null
          resultado?: string | null
          resultados_para?: string | null
          tipo_analisis?: string | null
          tipo_muestra?: string | null
          unidades?: string | null
          valores_aceptados?: string | null
          vereda?: string | null
        }
        Relationships: []
      }
      prestador: {
        Row: {
          codigo_anterior: number | null
          codigo_sistema: number | null
          direccion: string | null
          id_autoridad_sanitaria: string | null
          id_prestador: number
          id_ubicacion: number | null
          indice_ocupacion: number | null
          nit: string | null
          nombre: string | null
          nombre_sistema: string | null
          poblacion_atendida: number | null
          suscriptores_rurales: number | null
          suscriptores_urbanos: number | null
          telefono: string | null
          total_poblacion_atendida: number | null
        }
        Insert: {
          codigo_anterior?: number | null
          codigo_sistema?: number | null
          direccion?: string | null
          id_autoridad_sanitaria?: string | null
          id_prestador: number
          id_ubicacion?: number | null
          indice_ocupacion?: number | null
          nit?: string | null
          nombre?: string | null
          nombre_sistema?: string | null
          poblacion_atendida?: number | null
          suscriptores_rurales?: number | null
          suscriptores_urbanos?: number | null
          telefono?: string | null
          total_poblacion_atendida?: number | null
        }
        Update: {
          codigo_anterior?: number | null
          codigo_sistema?: number | null
          direccion?: string | null
          id_autoridad_sanitaria?: string | null
          id_prestador?: number
          id_ubicacion?: number | null
          indice_ocupacion?: number | null
          nit?: string | null
          nombre?: string | null
          nombre_sistema?: string | null
          poblacion_atendida?: number | null
          suscriptores_rurales?: number | null
          suscriptores_urbanos?: number | null
          telefono?: string | null
          total_poblacion_atendida?: number | null
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
      punto_captacion: {
        Row: {
          departamento: string | null
          fuente_captacion: string | null
          georeferenciacion: string | null
          id_punto_captacion: number
          latitud: number | null
          longitud: number | null
          municipio: string | null
          tipo_captacion: string
          vereda: string | null
        }
        Insert: {
          departamento?: string | null
          fuente_captacion?: string | null
          georeferenciacion?: string | null
          id_punto_captacion?: number
          latitud?: number | null
          longitud?: number | null
          municipio?: string | null
          tipo_captacion: string
          vereda?: string | null
        }
        Update: {
          departamento?: string | null
          fuente_captacion?: string | null
          georeferenciacion?: string | null
          id_punto_captacion?: number
          latitud?: number | null
          longitud?: number | null
          municipio?: string | null
          tipo_captacion?: string
          vereda?: string | null
        }
        Relationships: []
      }
      punto_muestreo: {
        Row: {
          codigo: string | null
          departamento: string | null
          descripcion: string | null
          direccion: string | null
          id_muestreo: number
          latitud: string | null
          longitud: string | null
          municipio: string | null
          nombre: string | null
          vereda: string | null
        }
        Insert: {
          codigo?: string | null
          departamento?: string | null
          descripcion?: string | null
          direccion?: string | null
          id_muestreo?: number
          latitud?: string | null
          longitud?: string | null
          municipio?: string | null
          nombre?: string | null
          vereda?: string | null
        }
        Update: {
          codigo?: string | null
          departamento?: string | null
          descripcion?: string | null
          direccion?: string | null
          id_muestreo?: number
          latitud?: string | null
          longitud?: string | null
          municipio?: string | null
          nombre?: string | null
          vereda?: string | null
        }
        Relationships: []
      }
      red: {
        Row: {
          caract_especiales: string | null
          caract_fisicas: string | null
          caract_microbiologicas: string | null
          caract_quimicas: string | null
          descartadas: string | null
          fecha: string | null
          id_red: number
          id_reporte2: number | null
          medidas_sanitarias: string | null
          observaciones: string | null
        }
        Insert: {
          caract_especiales?: string | null
          caract_fisicas?: string | null
          caract_microbiologicas?: string | null
          caract_quimicas?: string | null
          descartadas?: string | null
          fecha?: string | null
          id_red?: number
          id_reporte2?: number | null
          medidas_sanitarias?: string | null
          observaciones?: string | null
        }
        Update: {
          caract_especiales?: string | null
          caract_fisicas?: string | null
          caract_microbiologicas?: string | null
          caract_quimicas?: string | null
          descartadas?: string | null
          fecha?: string | null
          id_red?: number
          id_reporte2?: number | null
          medidas_sanitarias?: string | null
          observaciones?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "red_id_reporte2_fkey"
            columns: ["id_reporte2"]
            isOneToOne: false
            referencedRelation: "anexo2"
            referencedColumns: ["id_reporte2"]
          },
        ]
      }
      representante: {
        Row: {
          cargo: string | null
          email: string | null
          id_prestador: number | null
          id_representante: number
          nombre: string
        }
        Insert: {
          cargo?: string | null
          email?: string | null
          id_prestador?: number | null
          id_representante?: number
          nombre: string
        }
        Update: {
          cargo?: string | null
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
      resolucion: {
        Row: {
          archivo_resolucion: string | null
          fecha_expedicion: string | null
          id_reporte2: number | null
          id_resolucion: number
          numero_resolucion: string | null
        }
        Insert: {
          archivo_resolucion?: string | null
          fecha_expedicion?: string | null
          id_reporte2?: number | null
          id_resolucion?: number
          numero_resolucion?: string | null
        }
        Update: {
          archivo_resolucion?: string | null
          fecha_expedicion?: string | null
          id_reporte2?: number | null
          id_resolucion?: number
          numero_resolucion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resolucion_id_reporte2_fkey"
            columns: ["id_reporte2"]
            isOneToOne: false
            referencedRelation: "anexo2"
            referencedColumns: ["id_reporte2"]
          },
        ]
      }
      riesgo: {
        Row: {
          actividad: string | null
          cumple: string | null
          entidad: string | null
          evidencia: string | null
          fecha: string | null
          id_reporte3: number | null
          id_riesgo: number
        }
        Insert: {
          actividad?: string | null
          cumple?: string | null
          entidad?: string | null
          evidencia?: string | null
          fecha?: string | null
          id_reporte3?: number | null
          id_riesgo?: number
        }
        Update: {
          actividad?: string | null
          cumple?: string | null
          entidad?: string | null
          evidencia?: string | null
          fecha?: string | null
          id_reporte3?: number | null
          id_riesgo?: number
        }
        Relationships: [
          {
            foreignKeyName: "riesgo_id_reporte3_fkey"
            columns: ["id_reporte3"]
            isOneToOne: false
            referencedRelation: "seguimiento"
            referencedColumns: ["id_reporte3"]
          },
        ]
      }
      seguimiento: {
        Row: {
          consecutivo_mapa_riesgo: string | null
          fecha_actualizacion: string | null
          fecha_creacion: string | null
          id_mapa: number | null
          id_reporte3: number
        }
        Insert: {
          consecutivo_mapa_riesgo?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id_mapa?: number | null
          id_reporte3?: number
        }
        Update: {
          consecutivo_mapa_riesgo?: string | null
          fecha_actualizacion?: string | null
          fecha_creacion?: string | null
          id_mapa?: number | null
          id_reporte3?: number
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_id_mapa_fkey"
            columns: ["id_mapa"]
            isOneToOne: false
            referencedRelation: "mapa_riesgo"
            referencedColumns: ["id_mapa"]
          },
        ]
      }
      seguimiento_caracteristica: {
        Row: {
          caracteristica_seguimiento: string | null
          frecuencia_as: string | null
          frecuencia_pp: string | null
          id_caracteristica: number
          id_reporte3: number | null
          minimo_muestras_as: string | null
          minimo_muestras_pp: string | null
        }
        Insert: {
          caracteristica_seguimiento?: string | null
          frecuencia_as?: string | null
          frecuencia_pp?: string | null
          id_caracteristica?: number
          id_reporte3?: number | null
          minimo_muestras_as?: string | null
          minimo_muestras_pp?: string | null
        }
        Update: {
          caracteristica_seguimiento?: string | null
          frecuencia_as?: string | null
          frecuencia_pp?: string | null
          id_caracteristica?: number
          id_reporte3?: number | null
          minimo_muestras_as?: string | null
          minimo_muestras_pp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_caracteristica_id_reporte3_fkey"
            columns: ["id_reporte3"]
            isOneToOne: false
            referencedRelation: "seguimiento"
            referencedColumns: ["id_reporte3"]
          },
        ]
      }
      seguimiento_inspeccion: {
        Row: {
          acta: string | null
          fecha_acta: string | null
          id_inspeccion: number
          id_reporte3: number | null
          nombre_archivo: string | null
        }
        Insert: {
          acta?: string | null
          fecha_acta?: string | null
          id_inspeccion?: number
          id_reporte3?: number | null
          nombre_archivo?: string | null
        }
        Update: {
          acta?: string | null
          fecha_acta?: string | null
          id_inspeccion?: number
          id_reporte3?: number | null
          nombre_archivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_inspeccion_id_reporte3_fkey"
            columns: ["id_reporte3"]
            isOneToOne: false
            referencedRelation: "seguimiento"
            referencedColumns: ["id_reporte3"]
          },
        ]
      }
      seguridad: {
        Row: {
          fecha: string | null
          id_reporte3: number | null
          id_seguridad: number
          medida: string | null
          observacion: string | null
        }
        Insert: {
          fecha?: string | null
          id_reporte3?: number | null
          id_seguridad?: number
          medida?: string | null
          observacion?: string | null
        }
        Update: {
          fecha?: string | null
          id_reporte3?: number | null
          id_seguridad?: number
          medida?: string | null
          observacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguridad_id_reporte3_fkey"
            columns: ["id_reporte3"]
            isOneToOne: false
            referencedRelation: "seguimiento"
            referencedColumns: ["id_reporte3"]
          },
        ]
      }
      solicitante: {
        Row: {
          estado: string | null
          id_solicitante: number
          id_ubicacion_sol: number | null
          nombre: string
        }
        Insert: {
          estado?: string | null
          id_solicitante?: number
          id_ubicacion_sol?: number | null
          nombre: string
        }
        Update: {
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
          departamento: string
          id_ubicacion: number
          municipio: string
          vereda: string | null
        }
        Insert: {
          departamento: string
          id_ubicacion?: number
          municipio: string
          vereda?: string | null
        }
        Update: {
          departamento?: string
          id_ubicacion?: number
          municipio?: string
          vereda?: string | null
        }
        Relationships: []
      }
      ubicacion_laboratorio: {
        Row: {
          departamento: string
          direccion: string | null
          id_ubicacion_lab: number
          municipio: string
        }
        Insert: {
          departamento: string
          direccion?: string | null
          id_ubicacion_lab?: number
          municipio: string
        }
        Update: {
          departamento?: string
          direccion?: string | null
          id_ubicacion_lab?: number
          municipio?: string
        }
        Relationships: []
      }
      ubicacion_solicitante: {
        Row: {
          departamento: string
          id_ubicacion_sol: number
          municipio: string
        }
        Insert: {
          departamento: string
          id_ubicacion_sol?: number
          municipio: string
        }
        Update: {
          departamento?: string
          id_ubicacion_sol?: number
          municipio?: string
        }
        Relationships: []
      }
      ubicacion_tecnico: {
        Row: {
          departamento: string
          direccion: string | null
          id_ubicacion_tec: number
          municipio: string
        }
        Insert: {
          departamento: string
          direccion?: string | null
          id_ubicacion_tec?: number
          municipio: string
        }
        Update: {
          departamento?: string
          direccion?: string | null
          id_ubicacion_tec?: number
          municipio?: string
        }
        Relationships: []
      }
    }
    Views: {
      inspeccion_staging_nits_duplicados: {
        Row: {
          nit: string | null
          total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_user_account: {
        Args: { p_user_id: string }
        Returns: Json
      }
      actualizar_lat_long: { Args: never; Returns: undefined }
      confirmar_carga_mapas: { Args: { p_payload: Json }; Returns: Json }
      dashboard_irca_por_municipio: {
        Args: never
        Returns: {
          name: string
          promedio: number
        }[]
      }
      dashboard_prestadores_por_departamento: {
        Args: never
        Returns: {
          name: string
          value: number
        }[]
      }
      dashboard_top_municipios: {
        Args: { p_limit?: number }
        Returns: {
          name: string
          value: number
        }[]
      }
      dashboard_kpis_resumen: {
        Args: { p_anio?: number; p_municipio?: string }
        Returns: {
          scope: string
          muestras_total: number
          inspecciones_total: number
          mapas_total: number
          irca_promedio: number
          iraba_promedio: number
        }[]
      }
      dashboard_kpis_por_municipio: {
        Args: { p_anio?: number }
        Returns: {
          municipio: string
          muestras_total: number
          inspecciones_total: number
          mapas_total: number
          irca_promedio: number
          iraba_promedio: number
        }[]
      }
      dashboard_kpis_tendencia_mensual: {
        Args: { p_anio?: number; p_municipio?: string }
        Returns: {
          mes: number
          muestras_total: number
          inspecciones_total: number
          mapas_total: number
        }[]
      }
      dashboard_kpis_anios_disponibles: {
        Args: Record<PropertyKey, never>
        Returns: {
          anio: number
        }[]
      }
      limpiar_y_convertir_coord: {
        Args: { coord_text: string }
        Returns: number
      }
      procesar_inspeccion_staging_batch_chunk: {
        Args: { p_batch: string; p_limit: number }
        Returns: Json
      }
      procesar_mapa_riesgo_staging_batch_chunk: {
        Args: { p_batch: string; p_limit: number }
        Returns: Json
      }
      procesar_muestra_staging_batch_chunk: {
        Args: { p_batch: string; p_limit: number }
        Returns: Json
      }
      recrear_politicas_tabla: {
        Args: { tabla_nombre: string }
        Returns: undefined
      }
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
