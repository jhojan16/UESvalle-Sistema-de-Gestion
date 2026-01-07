import { Database } from '@/integrations/supabase/types';

// Tipos base extraídos directamente de la base de datos
export type MapaRiesgo = Database['public']['Tables']['mapa_riesgo']['Row'];
export type PrestadorBase = Database['public']['Tables']['prestador']['Row'];
export type Ubicacion = Database['public']['Tables']['ubicacion']['Row'];
export type Anexo = Database['public']['Tables']['anexo']['Row'];
export type Anexo2 = Database['public']['Tables']['anexo2']['Row'];
export type EntidadParticipante = Database['public']['Tables']['entidad_participante']['Row'];
export type CaracteristicaPriorizada = Database['public']['Tables']['caracteristica_priorizada']['Row'];
export type DocumentoFuente = Database['public']['Tables']['documento_fuente']['Row'];
export type Seguimiento = Database['public']['Tables']['seguimiento']['Row'];
export type Bocatoma = Database['public']['Tables']['bocatoma']['Row'];
export type Red = Database['public']['Tables']['red']['Row'];
export type Resolucion = Database['public']['Tables']['resolucion']['Row'];
export type PuntoCaptacion = Database['public']['Tables']['punto_captacion']['Row'];
export type MuestraBase = Database['public']['Tables']['muestra']['Row'];
export type Laboratorio = Database['public']['Tables']['laboratorio']['Row'];
export type TecnicoBase = Database['public']['Tables']['tecnico']['Row'];
export type UbicacionTecnico = Database['public']['Tables']['ubicacion_tecnico']['Row'];
export type SolicitanteBase = Database['public']['Tables']['solicitante']['Row'];
export type Ubicacion_solicitante = Database['public']['Tables']['ubicacion_solicitante']['Row'];
export type punto_muestreo = Database['public']['Tables']['punto_muestreo']['Row'];
export type analisis_muestra = Database['public']['Tables']['analisis_muestra']['Row'];
export type inspeccion = Database['public']['Tables']['inspeccion']['Row'];
export type riesgo = Database['public']['Tables']['riesgo']['Row'];
export type seguridad = Database['public']['Tables']['seguridad']['Row'];
export type seguimiento_inspeccion = Database['public']['Tables']['seguimiento_inspeccion']['Row'];
export type seguimiento_caracteristica = Database['public']['Tables']['seguimiento_caracteristica']['Row'];

/**
 * Para tu tipo "MapaRiesgoCompleto" (el que tiene los joins),
 * lo definimos combinando los tipos de arriba:
 */
export interface Tecnico extends TecnicoBase {
    UbicacionTecnico: UbicacionTecnico | null;
}


export interface Prestador extends PrestadorBase {
    ubicacion: Ubicacion | null;
    Laboratorio: Laboratorio | null;  
}

export interface MapaRiesgoCompleto extends MapaRiesgo {
    prestador: Prestador | null;
    punto_captacion: PuntoCaptacion | null;
    anexo: (Anexo & {
        entidad_participante: EntidadParticipante[];
        caracteristica_priorizada: CaracteristicaPriorizada[];
        documento_fuente: DocumentoFuente[];
    })[];

    // Las relaciones del Anexo 2
    anexo2: (Anexo2 & {
        bocatoma: Bocatoma[];
        red: Red[];
        resolucion: Resolucion[];
    })[];

    seguimiento: (Seguimiento& {
        riesgo: riesgo[];
        seguridad: seguridad[];
        seguimiento_inspeccion: seguimiento_inspeccion[];
        seguimiento_caracteristica: seguimiento_caracteristica[]
    })[];
}

export interface MuestraCompleta extends MuestraBase {
    prestador: Prestador | null;
    // Definimos los campos específicos que traes de laboratorio en tu .select()
    laboratorio: Pick<Laboratorio, 'nombre' | 'estado' | 'telefono'> | null;
    punto_muestreo: punto_muestreo | null;
    analisis_muestra: analisis_muestra[];
}

export interface Solicitante extends SolicitanteBase {
    Ubicacion_solicitante: Pick<Ubicacion_solicitante, 'departamento' | 'municipio'> | null;
}

export interface InspeccionBase extends inspeccion {
    Prestador: Prestador | null;
}