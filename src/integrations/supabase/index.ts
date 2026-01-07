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
    anexo: Anexo[];
    anexo2: Anexo2[];
    entidad_participante: EntidadParticipante[];
    caracteristica_priorizada: CaracteristicaPriorizada[];
    documento_fuente: DocumentoFuente[];
    seguimiento: Seguimiento[];
    bocatoma: Bocatoma[];
    red: Red[];
    resolucion: Resolucion[];
}

export interface MuestraCompleta extends MuestraBase {
    prestador: Prestador | null;
    // Definimos los campos específicos que traes de laboratorio en tu .select()
    laboratorio: Pick<Laboratorio, 'nombre' | 'estado' | 'telefono'> | null;
}

export interface Solicitante extends SolicitanteBase {
    Ubicacion_solicitante: Pick<Ubicacion_solicitante, 'departamento' | 'municipio'> | null;
}