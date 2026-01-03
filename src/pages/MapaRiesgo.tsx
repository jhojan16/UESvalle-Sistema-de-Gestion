import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../integrations/supabase/client";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import { Box, LinearProgress, Typography } from "@mui/material";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Tipos para las consultas de Supabase
type MapasRiesgoBase = {
    id_mapa: number;
    id_prestador: number | null;
    id_punto_captacion: number | null;
    prestador: {
        nit: string | null;
        nombre: string | null;
        direccion: string | null;
        telefono: string | null;
        codigo_sistema: number | null;
        nombre_sistema: string | null;
        ubicacion: {
            departamento: string | null;
            municipio: string | null;
            vereda: string | null;
        } | null;
    } | null;
    punto_captacion: {
        tipo_captacion: string | null;
        fuente_captacion: string | null;
        georeferenciacion: string | null;
        departamento: string | null;
        municipio: string | null;
        vereda: string | null;
        latitud: number | null;
        longitud: number | null;
    } | null;
};

type AnexoData = {
    id_reporte1: number;
    inspeccion_ocular: string | null;
    tipo_inspeccion_ocular: string | null;
    fecha_inspeccion_ocular: string | null;
    fecha_entidades: string | null;
    departamento: string | null;
    municipio: string | null;
    vereda: string | null;
    autoridad_sanitaria: string | null;
    fecha_reunion_entidades: string | null;
    id_mapa: number;
};

type Anexo2Data = {
    id_reporte2: number;
    consecutivo_mapa_riesgo: string | null;
    anterior_mapa_riesgo: string | null;
    id_mapa: number;
};

type EntidadParticipanteData = {
    id_entidad: number;
    entidad: string | null;
    dependencia: string | null;
    cargo: string | null;
    id_reporte1: number;
};

type CaracteristicaPriorizadaData = {
    id_caracteristica: number;
    actividad_contaminante: string | null;
    caract_fisica: string | null;
    caract_quimica: string | null;
    caract_microbiologica: string | null;
    caract_especial: string | null;
    observaciones: string | null;
    id_reporte1: number;
};

type DocumentoFuenteData = {
    id_documento: number;
    fuente_info: string | null;
    nombre_documento: string | null;
    tipo_documento: string | null;
    autor: string | null;
    fecha_publicacion: string | null;
    id_reporte1: number;
};

type SeguimientoData = {
    id_reporte3: number;
    consecutivo_mapa_riesgo: string | null;
    fecha_creacion: string | null;
    fecha_actualizacion: string | null;
    id_mapa: number;
};

type BocatomaData = {
    id_bocatoma: number;
    fecha: string | null;
    caract_fisica: string | null;
    caract_quimica: string | null;
    caract_microbiologicas: string | null;
    caract_especiales: string | null;
    descartadas: string | null;
    id_reporte2: number;
};

type RedData = {
    id_red: number;
    fecha: string | null;
    caract_fisicas: string | null;
    caract_quimicas: string | null;
    caract_microbiologicas: string | null;
    caract_especiales: string | null;
    descartadas: string | null;
    medidas_sanitarias: string | null;
    observaciones: string | null;
    id_reporte2: number;
};

type ResolucionData = {
    id_resolucion: number;
    numero_resolucion: string | null;
    fecha_expedicion: string | null;
    archivo_resolucion: string | null;
    id_reporte2: number;
};

// Tipo de dato completo
type MapaRiesgoCompleto = {
    id_mapa: number;
    id_prestador: number | null;
    id_punto_captacion: number | null;
    
    // Datos del prestador
    prestador?: {
        nit: string | null;
        nombre: string | null;
        direccion: string | null;
        telefono: string | null;
        codigo_sistema: number | null;
        nombre_sistema: string | null;
        ubicacion?: {
            departamento: string | null;
            municipio: string | null;
            vereda: string | null;
        } | null;
    } | null;
    
    // Datos del punto de captación
    punto_captacion?: {
        tipo_captacion: string | null;
        fuente_captacion: string | null;
        georeferenciacion: string | null;
        departamento: string | null;
        municipio: string | null;
        vereda: string | null;
        latitud: number | null;
        longitud: number | null;
    } | null;
    
    // Anexo (información general)
    anexos?: AnexoData[];
    
    // Anexo2
    anexos2?: Anexo2Data[];
    
    // Entidades participantes
    entidades_participantes?: EntidadParticipanteData[];
    
    // Características priorizadas
    caracteristicas_priorizadas?: CaracteristicaPriorizadaData[];
    
    // Documentos fuente
    documentos_fuente?: DocumentoFuenteData[];
    
    // Seguimiento
    seguimientos?: SeguimientoData[];
    
    // Bocatoma
    bocatomas?: BocatomaData[];
    
    // Red
    redes?: RedData[];
    
    // Resolución
    resoluciones?: ResolucionData[];
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export default function MapaPuntosCaptacion() {
    const [puntos, setPuntos] = useState<MapaRiesgoCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMapa, setSelectedMapa] = useState<MapaRiesgoCompleto | null>(null);

    useEffect(() => {
        const fetchMapasRiesgo = async () => {
            try {
                // Primero obtenemos todos los mapas de riesgo con sus relaciones directas
                const { data: mapasData, error: mapasError } = await supabase
                    .from("mapa_riesgo")
                    .select(`
                        *,
                        prestador:prestador (
                            *,
                            ubicacion (*)
                        ),
                        punto_captacion (*)
                    `)
                    .order('id_mapa', { ascending: true });

                if (mapasError) {
                    console.error("Error cargando mapas de riesgo:", mapasError);
                    return;
                }

                // Si no hay mapas, terminamos
                if (!mapasData || mapasData.length === 0) {
                    setPuntos([]);
                    setLoading(false);
                    return;
                }

                // Casting explícito del tipo de datos
                const mapasBase = mapasData as unknown as MapasRiesgoBase[];

                // Obtenemos los IDs de los mapas para consultas posteriores
                const mapaIds = mapasBase.map(mapa => mapa.id_mapa);

                // Consultamos TODAS las tablas relacionadas SIN filtrar por mapa
                // Esto traerá todos los datos y luego los filtramos
                const [
                    { data: anexosData },
                    { data: anexos2Data },
                    { data: seguimientosData },
                    { data: caracteristicasData },
                    { data: entidadesData },
                    { data: documentosData },
                    { data: bocatomasData },
                    { data: redesData },
                    { data: resolucionesData }
                ] = await Promise.all([
                    // Anexos (TODOS, luego filtramos)
                    supabase
                        .from("anexo")
                        .select("*"),
                    
                    // Anexos2 (TODOS, luego filtramos)
                    supabase
                        .from("anexo2")
                        .select("*"),
                    
                    // Seguimientos (TODOS, luego filtramos)
                    supabase
                        .from("seguimiento")
                        .select("*"),
                    
                    // Características priorizadas (TODOS)
                    supabase
                        .from("caracteristica_priorizada")
                        .select("*"),
                    
                    // Entidades participantes (TODOS)
                    supabase
                        .from("entidad_participante")
                        .select("*"),
                    
                    // Documentos fuente (TODOS)
                    supabase
                        .from("documento_fuente")
                        .select("*"),
                    
                    // Bocatomas (TODOS)
                    supabase
                        .from("bocatoma")
                        .select("*"),
                    
                    // Redes (TODOS)
                    supabase
                        .from("red")
                        .select("*"),
                    
                    // Resoluciones (TODOS)
                    supabase
                        .from("resolucion")
                        .select("*")
                ]);

                // Casting explícito de los datos relacionados
                const anexos = anexosData as unknown as AnexoData[] | null;
                const anexos2 = anexos2Data as unknown as Anexo2Data[] | null;
                const seguimientos = seguimientosData as unknown as SeguimientoData[] | null;
                const caracteristicas = caracteristicasData as unknown as CaracteristicaPriorizadaData[] | null;
                const entidades = entidadesData as unknown as EntidadParticipanteData[] | null;
                const documentos = documentosData as unknown as DocumentoFuenteData[] | null;
                const bocatomas = bocatomasData as unknown as BocatomaData[] | null;
                const redes = redesData as unknown as RedData[] | null;
                const resoluciones = resolucionesData as unknown as ResolucionData[] | null;

                // Procesamos los datos para estructurarlos por mapa
                const mapasCompletos: MapaRiesgoCompleto[] = mapasBase.map(mapa => {
                    // Filtramos los anexos para este mapa específico
                    const anexosDelMapa = anexos?.filter(anexo => anexo.id_mapa === mapa.id_mapa) || [];
                    
                    // Filtramos los anexos2 para este mapa específico
                    const anexos2DelMapa = anexos2?.filter(anexo2 => anexo2.id_mapa === mapa.id_mapa) || [];
                    
                    // Filtramos los seguimientos para este mapa específico
                    const seguimientosDelMapa = seguimientos?.filter(s => s.id_mapa === mapa.id_mapa) || [];
                    
                    // Obtenemos los IDs de los anexos relacionados (si existen)
                    const anexoIds = anexosDelMapa.map(a => a.id_reporte1);
                    const anexo2Ids = anexos2DelMapa.map(a => a.id_reporte2);
                    
                    return {
                        id_mapa: mapa.id_mapa,
                        id_prestador: mapa.id_prestador,
                        id_punto_captacion: mapa.id_punto_captacion,
                        prestador: mapa.prestador,
                        punto_captacion: mapa.punto_captacion,
                        anexos: anexosDelMapa,
                        anexos2: anexos2DelMapa,
                        seguimientos: seguimientosDelMapa,
                        
                        // Filtramos por los IDs de anexos relacionados (solo si hay anexos)
                        caracteristicas_priorizadas: anexoIds.length > 0 
                            ? caracteristicas?.filter(c => anexoIds.includes(c.id_reporte1)) || []
                            : [],
                        
                        entidades_participantes: anexoIds.length > 0
                            ? entidades?.filter(e => anexoIds.includes(e.id_reporte1)) || []
                            : [],
                        
                        documentos_fuente: anexoIds.length > 0
                            ? documentos?.filter(d => anexoIds.includes(d.id_reporte1)) || []
                            : [],
                        
                        bocatomas: anexo2Ids.length > 0
                            ? bocatomas?.filter(b => anexo2Ids.includes(b.id_reporte2)) || []
                            : [],
                        
                        redes: anexo2Ids.length > 0
                            ? redes?.filter(r => anexo2Ids.includes(r.id_reporte2)) || []
                            : [],
                        
                        resoluciones: anexo2Ids.length > 0
                            ? resoluciones?.filter(res => anexo2Ids.includes(res.id_reporte2)) || []
                            : []
                    };
                });

                setPuntos(mapasCompletos);
            } catch (error) {
                console.error("Error inesperado:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMapasRiesgo();
    }, []);

    const handleMarkerClick = (mapa: MapaRiesgoCompleto) => {
        setSelectedMapa(mapa);
    };

    if (loading) return (
        <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
                <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0' }} />
                <Typography sx={{ mt: 2, color: '#4a5568' }}>Cargando Mapas de riesgo...</Typography>
            </Box>
        </Box>
    );

    return (
        <div className="flex flex-row w-full h-[95vh] gap-4">
            {/* MAPA (Lado izquierdo) */}
            <div className="w-2/3 rounded-xl overflow-hidden shadow-lg">
                <MapContainer
                    center={[4.090, -76.191]}
                    zoom={8}
                    className="w-full h-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                    />

                    {puntos
                        .filter(p => p.punto_captacion?.latitud && p.punto_captacion?.longitud)
                        .map((p) => (
                            <Marker
                                key={p.id_mapa}
                                position={[p.punto_captacion!.latitud!, p.punto_captacion!.longitud!]}
                                eventHandlers={{
                                    click: () => handleMarkerClick(p),
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p><b>Mapa de Riesgo #</b> {p.id_mapa}</p>
                                        <p><b>Tipo:</b> {p.punto_captacion?.tipo_captacion ?? "N/A"}</p>
                                        <p><b>Prestador:</b> {p.prestador?.nombre ?? "N/A"}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>
            </div>

            {/* PANEL DE DETALLES (Lado derecho) */}
            <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Detalles del Mapa de Riesgo</h3>
                
                {selectedMapa ? (
                    <div className="space-y-6">
                        {/* Información básica */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-bold text-lg text-blue-700 mb-2">
                                Mapa de Riesgo #{selectedMapa.id_mapa}
                            </h4>
                            <p className="text-sm text-gray-600">
                                ID Prestador: {selectedMapa.id_prestador ?? 'N/A'} | 
                                ID Punto: {selectedMapa.id_punto_captacion ?? 'N/A'}
                            </p>
                        </div>

                        {/* Tabs o secciones plegables */}
                        <div className="space-y-4">
                            {/* Prestador */}
                            {selectedMapa.prestador && (
                                <details className="bg-gray-50 rounded-lg overflow-hidden" open>
                                    <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                        Información del Prestador
                                    </summary>
                                    <div className="p-3 space-y-2">
                                        <p><span className="font-medium">Nombre:</span> {selectedMapa.prestador.nombre}</p>
                                        <p><span className="font-medium">NIT:</span> {selectedMapa.prestador.nit}</p>
                                        <p><span className="font-medium">Teléfono:</span> {selectedMapa.prestador.telefono}</p>
                                        <p><span className="font-medium">Sistema:</span> {selectedMapa.prestador.nombre_sistema}</p>
                                        {selectedMapa.prestador.ubicacion && (
                                            <>
                                                <p><span className="font-medium">Ubicación:</span> {selectedMapa.prestador.ubicacion.departamento}, {selectedMapa.prestador.ubicacion.municipio}</p>
                                                <p><span className="font-medium">Vereda:</span> {selectedMapa.prestador.ubicacion.vereda}</p>
                                            </>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Punto de Captación */}
                            {selectedMapa.punto_captacion && (
                                <details className="bg-gray-50 rounded-lg overflow-hidden" open>
                                    <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                        Punto de Captación
                                    </summary>
                                    <div className="p-3 space-y-2">
                                        <p><span className="font-medium">Tipo:</span> {selectedMapa.punto_captacion.tipo_captacion}</p>
                                        <p><span className="font-medium">Fuente:</span> {selectedMapa.punto_captacion.fuente_captacion}</p>
                                        <p><span className="font-medium">Coordenadas:</span> Lat: {selectedMapa.punto_captacion.latitud}, Long: {selectedMapa.punto_captacion.longitud}</p>
                                        <p><span className="font-medium">Ubicación:</span> {selectedMapa.punto_captacion.departamento}, {selectedMapa.punto_captacion.municipio}, {selectedMapa.punto_captacion.vereda}</p>
                                    </div>
                                </details>
                            )}

                            {/* Anexos */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Anexos ({selectedMapa.anexos?.length || 0})
                                </summary>
                                <div className="p-3 space-y-4">
                                    {selectedMapa.anexos && selectedMapa.anexos.length > 0 ? (
                                        selectedMapa.anexos.map((anexo, idx) => (
                                            <div key={anexo.id_reporte1} className="border rounded p-3">
                                                <h5 className="font-medium mb-2">Anexo #{idx + 1}</h5>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">Inspección Ocular:</span> {anexo.inspeccion_ocular || 'N/A'}</p>
                                                    <p><span className="font-medium">Tipo:</span> {anexo.tipo_inspeccion_ocular || 'N/A'}</p>
                                                    <p><span className="font-medium">Fecha:</span> {anexo.fecha_inspeccion_ocular || 'N/A'}</p>
                                                    <p><span className="font-medium">Autoridad:</span> {anexo.autoridad_sanitaria || 'N/A'}</p>
                                                    <p><span className="font-medium">Fecha Reunión:</span> {anexo.fecha_reunion_entidades || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No hay anexos registrados</p>
                                    )}
                                </div>
                            </details>

                            {/* Anexos2 */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Anexos 2 ({selectedMapa.anexos2?.length || 0})
                                </summary>
                                <div className="p-3 space-y-4">
                                    {selectedMapa.anexos2 && selectedMapa.anexos2.length > 0 ? (
                                        selectedMapa.anexos2.map((anexo2, idx) => (
                                            <div key={anexo2.id_reporte2} className="border rounded p-3">
                                                <h5 className="font-medium mb-2">Anexo 2 #{idx + 1}</h5>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-medium">Consecutivo:</span> {anexo2.consecutivo_mapa_riesgo || 'N/A'}</p>
                                                    <p><span className="font-medium">Anterior:</span> {anexo2.anterior_mapa_riesgo || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No hay anexos 2 registrados</p>
                                    )}
                                </div>
                            </details>

                            {/* Seguimientos */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Seguimientos ({selectedMapa.seguimientos?.length || 0})
                                </summary>
                                <div className="p-3 space-y-4">
                                    {selectedMapa.seguimientos && selectedMapa.seguimientos.length > 0 ? (
                                        selectedMapa.seguimientos.map((seguimiento) => (
                                            <div key={seguimiento.id_reporte3} className="border rounded p-3">
                                                <h5 className="font-medium mb-2">Seguimiento #{seguimiento.id_reporte3}</h5>
                                                <p><span className="font-medium">Consecutivo:</span> {seguimiento.consecutivo_mapa_riesgo || 'N/A'}</p>
                                                <p><span className="font-medium">Creación:</span> {seguimiento.fecha_creacion || 'N/A'}</p>
                                                <p><span className="font-medium">Actualización:</span> {seguimiento.fecha_actualizacion || 'N/A'}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No hay seguimientos registrados</p>
                                    )}
                                </div>
                            </details>

                            {/* Entidades Participantes */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Entidades Participantes ({selectedMapa.entidades_participantes?.length || 0})
                                </summary>
                                <div className="p-3">
                                    {selectedMapa.entidades_participantes && selectedMapa.entidades_participantes.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedMapa.entidades_participantes.map((entidad) => (
                                                <li key={entidad.id_entidad} className="border-l-4 border-blue-500 pl-3">
                                                    <p className="font-medium">{entidad.entidad || 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">{entidad.dependencia || 'N/A'} - {entidad.cargo || 'N/A'}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No hay entidades participantes registradas</p>
                                    )}
                                </div>
                            </details>

                            {/* Características Priorizadas */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Características Priorizadas ({selectedMapa.caracteristicas_priorizadas?.length || 0})
                                </summary>
                                <div className="p-3">
                                    {selectedMapa.caracteristicas_priorizadas && selectedMapa.caracteristicas_priorizadas.length > 0 ? (
                                        <ul className="space-y-3">
                                            {selectedMapa.caracteristicas_priorizadas.map((caract) => (
                                                <li key={caract.id_caracteristica} className="bg-white p-3 rounded border">
                                                    <p className="font-medium">{caract.actividad_contaminante || 'N/A'}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                                        <p><span className="font-medium">Física:</span> {caract.caract_fisica || 'N/A'}</p>
                                                        <p><span className="font-medium">Química:</span> {caract.caract_quimica || 'N/A'}</p>
                                                        <p><span className="font-medium">Microbiológica:</span> {caract.caract_microbiologica || 'N/A'}</p>
                                                        <p><span className="font-medium">Especial:</span> {caract.caract_especial || 'N/A'}</p>
                                                    </div>
                                                    {caract.observaciones && (
                                                        <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Obs:</span> {caract.observaciones}</p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No hay características priorizadas registradas</p>
                                    )}
                                </div>
                            </details>

                            {/* Documentos Fuente */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Documentos Fuente ({selectedMapa.documentos_fuente?.length || 0})
                                </summary>
                                <div className="p-3">
                                    {selectedMapa.documentos_fuente && selectedMapa.documentos_fuente.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedMapa.documentos_fuente.map((doc) => (
                                                <li key={doc.id_documento} className="border rounded p-2">
                                                    <p className="font-medium">{doc.nombre_documento || 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">{doc.tipo_documento || 'N/A'} - {doc.fuente_info || 'N/A'}</p>
                                                    <p className="text-xs text-gray-500">Autor: {doc.autor || 'N/A'} - Fecha: {doc.fecha_publicacion || 'N/A'}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-center py-2">No hay documentos fuente registrados</p>
                                    )}
                                </div>
                            </details>

                            {/* Anexos2 y sus relaciones */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Relacionada
                                </summary>
                                <div className="p-3 space-y-4">
                                    {/* Bocatomas */}
                                    <div>
                                        <h6 className="font-medium text-sm mb-2">Bocatomas ({selectedMapa.bocatomas?.length || 0})</h6>
                                        {selectedMapa.bocatomas && selectedMapa.bocatomas.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedMapa.bocatomas.map(bocatoma => (
                                                    <li key={bocatoma.id_bocatoma} className="text-sm border-l-2 border-yellow-400 pl-2">
                                                        <p>Fecha: {bocatoma.fecha || 'N/A'}</p>
                                                        <p>Descartadas: {bocatoma.descartadas || 'N/A'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No hay bocatomas registradas</p>
                                        )}
                                    </div>

                                    {/* Redes */}
                                    <div>
                                        <h6 className="font-medium text-sm mb-2">Redes ({selectedMapa.redes?.length || 0})</h6>
                                        {selectedMapa.redes && selectedMapa.redes.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedMapa.redes.map(red => (
                                                    <li key={red.id_red} className="text-sm border-l-2 border-green-400 pl-2">
                                                        <p>Fecha: {red.fecha || 'N/A'}</p>
                                                        <p>Medidas: {red.medidas_sanitarias || 'N/A'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No hay redes registradas</p>
                                        )}
                                    </div>

                                    {/* Resoluciones */}
                                    <div>
                                        <h6 className="font-medium text-sm mb-2">Resoluciones ({selectedMapa.resoluciones?.length || 0})</h6>
                                        {selectedMapa.resoluciones && selectedMapa.resoluciones.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedMapa.resoluciones.map(resolucion => (
                                                    <li key={resolucion.id_resolucion} className="text-sm border-l-2 border-purple-400 pl-2">
                                                        <p>Número: {resolucion.numero_resolucion || 'N/A'}</p>
                                                        <p>Fecha: {resolucion.fecha_expedicion || 'N/A'}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No hay resoluciones registradas</p>
                                        )}
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <p>Haz clic en un marcador en el mapa para ver los detalles del mapa de riesgo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}