import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
                    seguimiento (*, riesgo(*), seguridad(*), seguimiento_inspeccion(*), seguimiento_caracteristica(*))
                `)
                    .order('id_mapa', { ascending: true });

                if (error) throw error;
                console.log(data);

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

                            {/* Información Técnica Relacionada (Desde Anexo 1) */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Anexo 1 ({selectedMapa.anexo?.length || 0})
                                </summary>
                                <div className="p-3 space-y-6">
                                    {selectedMapa.anexo && selectedMapa.anexo.length > 0 ? (
                                        selectedMapa.anexo.map((a2, idx) => (
                                            <div key={a2.id_reporte1} className="border-b pb-4 last:border-0">
                                                {/* entidad_participante */}
                                                <div className="mb-3">
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Entidad Participante ({a2.entidad_participante?.length || 0})</h6>
                                                    {a2.entidad_participante?.map(b => (
                                                        <div key={b.id_entidad} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {b.entidad}</p>
                                                            <p><b>Especiales:</b> {b.dependencia}</p>
                                                            <p><b>Fisicas:</b> {b.cargo}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* documento_fuente */}
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Documentos ({a2.documento_fuente?.length || 0})</h6>
                                                    {a2.documento_fuente?.map(r => (
                                                        <div key={r.id_documento} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {r.fuente_info}</p>
                                                            <p><b>Especiales:</b> {r.nombre_documento}</p>
                                                            <p><b>Fisicas:</b> {r.tipo_documento}</p>
                                                            <p><b>Microbiologicas:</b> {r.autor}</p>
                                                            <p><b>Quimica:</b> {r.fecha_publicacion}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* caracteristica_priorizada */}
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Caracteristicas ({a2.caracteristica_priorizada?.length || 0})</h6>
                                                    {a2.caracteristica_priorizada?.map(re => (
                                                        <div key={re.id_caracteristica} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {re.actividad_contaminante}</p>
                                                            <p><b>Especiales:</b> {re.carac_especial}</p>
                                                            <p><b>Fisicas:</b> {re.carac_fisica}</p>
                                                            <p><b>Microbiologicas:</b> {re.carac_microbiologica}</p>
                                                            <p><b>Quimica:</b> {re.carac_quimica}</p>
                                                            <p><b>Quimica:</b> {re.observaciones}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center text-sm">Sin datos técnicos</p>
                                    )}
                                </div>
                            </details>



                            {/* Información Técnica Relacionada (Desde Anexo 2) */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Anexo 2 ({selectedMapa.anexo2?.length || 0})
                                </summary>
                                <div className="p-3 space-y-6">
                                    {selectedMapa.anexo2 && selectedMapa.anexo2.length > 0 ? (
                                        selectedMapa.anexo2.map((a2, idx) => (
                                            <div key={a2.id_reporte2} className="border-b pb-4 last:border-0">
                                                {/* Bocatomas */}
                                                <div className="mb-3">
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Bocatomas ({a2.bocatoma?.length || 0})</h6>
                                                    {a2.bocatoma?.map(b => (
                                                        <div key={b.id_bocatoma} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {b.fecha}</p>
                                                            <p><b>Especiales:</b> {b.caract_especiales}</p>
                                                            <p><b>Fisicas:</b> {b.caract_fisica}</p>
                                                            <p><b>Microbiologicas:</b> {b.caract_microbiologicas}</p>
                                                            <p><b>Quimica:</b> {b.caract_quimica}</p>
                                                            <p><b>Descartadas:</b> {b.descartadas}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Redes */}
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Redes de Distribución ({a2.red?.length || 0})</h6>
                                                    {a2.red?.map(r => (
                                                        <div key={r.id_red} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {r.fecha}</p>
                                                            <p><b>Especiales:</b> {r.caract_especiales}</p>
                                                            <p><b>Fisicas:</b> {r.caract_fisicas}</p>
                                                            <p><b>Microbiologicas:</b> {r.caract_microbiologicas}</p>
                                                            <p><b>Quimica:</b> {r.caract_quimicas}</p>
                                                            <p><b>Descartadas:</b> {r.descartadas}</p>
                                                            <p><b>Medida sanitaria:</b> {r.medidas_sanitarias}</p>
                                                            <p><b>Observaciones:</b> {r.observaciones}</p>

                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Resolucion ({a2.resolucion?.length || 0})</h6>
                                                    {a2.resolucion?.map(re => (
                                                        <div key={re.id_resolucion} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {re.numero_resolucion}</p>
                                                            <p><b>Especiales:</b> {re.fecha_expedicion}</p>
                                                            <p><b>Fisicas:</b> {re.archivo_resolucion}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center text-sm">Sin datos técnicos</p>
                                    )}
                                </div>
                            </details>

                            {/* Información Técnica Relacionada (Desde seguimiento) */}
                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Seguimiento ({selectedMapa.seguimiento?.length || 0})
                                </summary>
                                <div className="p-3 space-y-6">
                                    {selectedMapa.seguimiento && selectedMapa.seguimiento.length > 0 ? (
                                        selectedMapa.seguimiento.map((a2, idx) => (
                                            <div key={a2.id_reporte3} className="border-b pb-4 last:border-0">
                                                {/* Seguimiento caracteristicas */}
                                                <div className="mb-3">
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Caracteristicas ({a2.seguimiento_caracteristica?.length || 0})</h6>
                                                    {a2.seguimiento_caracteristica?.map(b => (
                                                        <div key={b.id_caracteristica} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Caracteristicas:</b> {b.caracteristica_seguimiento}</p>
                                                            <p><b>Frecuencia pp:</b> {b.frecuencia_pp}</p>
                                                            <p><b>Frecuencia as:</b> {b.frecuencia_as}</p>
                                                            <p><b>Muestras minima pp:</b> {b.minimo_muestras_pp}</p>
                                                            <p><b>Muestras minima as:</b> {b.minimo_muestras_as}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Seguimiento inspeccion */}
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Inspección ({a2.seguimiento_inspeccion?.length || 0})</h6>
                                                    {a2.seguimiento_inspeccion?.map(r => (
                                                        <div key={r.id_inspeccion} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {r.nombre_archivo}</p>
                                                            <p><b>Especiales:</b> {r.acta}</p>
                                                            <p><b>Fisicas:</b> {r.fecha_acta}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Seguridad */}
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Seguridad ({a2.seguridad?.length || 0})</h6>
                                                    {a2.seguridad?.map(re => (
                                                        <div key={re.id_seguridad} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {re.medida}</p>
                                                            <p><b>Especiales:</b> {re.fecha}</p>
                                                            <p><b>Fisicas:</b> {re.observacion}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Riesgo */}
                                                <div>
                                                    <h6 className="font-bold text-xs text-gray-700 mb-1">Riesgo ({a2.riesgo?.length || 0})</h6>
                                                    {a2.riesgo?.map(re => (
                                                        <div key={re.actividad} className="bg-white p-2 rounded border mb-1 text-xs">
                                                            <p><b>Fecha:</b> {re.entidad}</p>
                                                            <p><b>Especiales:</b> {re.evidencia}</p>
                                                            <p><b>Fisicas:</b> {re.fecha}</p>
                                                            <p><b>Fisicas:</b> {re.cumple}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center text-sm">Sin datos técnicos</p>
                                    )}
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