import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../integrations/supabase/client";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import { Box, LinearProgress, Typography } from "@mui/material";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapaRiesgoCompleto } from '@/integrations/supabase/index';

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
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMapasRiesgo = async () => {
            try {
                // 1. Una sola consulta puede traer casi todo gracias a las relaciones de Supabase
                const { data, error } = await supabase
                    .from("mapa_riesgo")
                    .select(`
                    *,
                    prestador (*, ubicacion (*)),
                    punto_captacion (*),
                    anexo (*, entidad_participante (*), caracteristica_priorizada (*), documento_fuente (*)),
                    anexo2 (*, bocatoma (*), red (*), resolucion (*)),
                    seguimiento (*)
                `)
                    .order('id_mapa', { ascending: true });

                if (error) throw error;

                setPuntos(data as unknown as MapaRiesgoCompleto[]);

            } catch (error) {
                console.error("Error cargando mapas de riesgo:", error);
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

    const puntosFiltrados = puntos.filter((p) => {
        const query = searchTerm.toLowerCase();
        return (
            p.id_mapa.toString().includes(query) ||
            p.prestador?.nombre?.toLowerCase().includes(query) ||
            p.prestador?.nit?.toLowerCase().includes(query) ||
            p.punto_captacion?.municipio?.toLowerCase().includes(query)
        );
    });

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

                    {puntosFiltrados
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

                <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full p-2 mb-4 border rounded"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

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
                                    Anexos ({selectedMapa.anexo?.length || 0})
                                </summary>
                                <div className="p-3 space-y-4">
                                    {selectedMapa.anexo?.length > 0 ? (
                                        selectedMapa.anexo.map((anexo, idx) => (
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
                                    Anexos 2 ({selectedMapa.anexo2?.length || 0})
                                </summary>
                                <div className="p-3 space-y-4">
                                    {selectedMapa.anexo2 && selectedMapa.anexo2.length > 0 ? (
                                        selectedMapa.anexo2.map((anexo2, idx) => (
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
                                    Seguimientos ({selectedMapa.seguimiento?.length || 0})
                                </summary>
                                <div className="p-3 space-y-4">
                                    {selectedMapa.seguimiento && selectedMapa.seguimiento.length > 0 ? (
                                        selectedMapa.seguimiento.map((seguimiento) => (
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
                                    Entidades Participantes ({selectedMapa.entidad_participante?.length || 0})
                                </summary>
                                <div className="p-3">
                                    {selectedMapa.entidad_participante && selectedMapa.entidad_participante.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedMapa.entidad_participante.map((entidad) => (
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
                                    Características Priorizadas ({selectedMapa.caracteristica_priorizada?.length || 0})
                                </summary>
                                <div className="p-3">
                                    {selectedMapa.caracteristica_priorizada && selectedMapa.caracteristica_priorizada.length > 0 ? (
                                        <ul className="space-y-3">
                                            {selectedMapa.caracteristica_priorizada.map((caract) => (
                                                <li key={caract.id_caracteristica} className="bg-white p-3 rounded border">
                                                    <p className="font-medium">{caract.actividad_contaminante || 'N/A'}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                                                        <p><span className="font-medium">Física:</span> {caract.carac_fisica || 'N/A'}</p>
                                                        <p><span className="font-medium">Química:</span> {caract.carac_quimica || 'N/A'}</p>
                                                        <p><span className="font-medium">Microbiológica:</span> {caract.carac_microbiologica || 'N/A'}</p>
                                                        <p><span className="font-medium">Especial:</span> {caract.carac_especial || 'N/A'}</p>
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
                                    Documentos Fuente ({selectedMapa.documento_fuente?.length || 0})
                                </summary>
                                <div className="p-3">
                                    {selectedMapa.documento_fuente && selectedMapa.documento_fuente.length > 0 ? (
                                        <ul className="space-y-2">
                                            {selectedMapa.documento_fuente.map((doc) => (
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
                                        <h6 className="font-medium text-sm mb-2">Bocatomas ({selectedMapa.bocatoma?.length || 0})</h6>
                                        {selectedMapa.bocatoma && selectedMapa.bocatoma.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedMapa.bocatoma.map(bocatoma => (
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
                                        <h6 className="font-medium text-sm mb-2">Redes ({selectedMapa.red?.length || 0})</h6>
                                        {selectedMapa.red && selectedMapa.red.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedMapa.red.map(red => (
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
                                        <h6 className="font-medium text-sm mb-2">Resoluciones ({selectedMapa.resolucion?.length || 0})</h6>
                                        {selectedMapa.resolucion && selectedMapa.resolucion.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedMapa.resolucion.map(resolucion => (
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