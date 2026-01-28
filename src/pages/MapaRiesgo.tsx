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
            <div className="w-3/5 rounded-xl overflow-hidden shadow-lg">
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
            <div className="w-3/5 bg-white p-6 rounded-xl shadow-lg overflow-y-auto">

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

                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Anexo 1 ({selectedMapa.anexo?.length || 0})
                                </summary>

                                <div className="p-3 space-y-6">
                                    {selectedMapa.anexo && selectedMapa.anexo.length > 0 ? (
                                        selectedMapa.anexo.map((a2) => (
                                            <div key={a2.id_reporte1} className="border-b pb-6 last:border-0 space-y-6">
                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Entidad Participante ({a2.entidad_participante?.length || 0})
                                                    </h6>

                                                    {a2.entidad_participante?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Entidad</th>
                                                                        <th className="px-3 py-2 font-semibold">Dependencia</th>
                                                                        <th className="px-3 py-2 font-semibold">Cargo</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.entidad_participante.map((b) => (
                                                                        <tr key={b.id_entidad} className="text-gray-800">
                                                                            <td className="px-3 py-2 whitespace-nowrap">{b.entidad ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.dependencia ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.cargo ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Documentos ({a2.documento_fuente?.length || 0})
                                                    </h6>

                                                    {a2.documento_fuente?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Fuente</th>
                                                                        <th className="px-3 py-2 font-semibold">Nombre</th>
                                                                        <th className="px-3 py-2 font-semibold">Tipo</th>
                                                                        <th className="px-3 py-2 font-semibold">Autor</th>
                                                                        <th className="px-3 py-2 font-semibold">Fecha publicación</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.documento_fuente.map((r) => (
                                                                        <tr key={r.id_documento} className="text-gray-800">
                                                                            <td className="px-3 py-2">{r.fuente_info ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.nombre_documento ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{r.tipo_documento ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.autor ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{r.fecha_publicacion ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Características ({a2.caracteristica_priorizada?.length || 0})
                                                    </h6>

                                                    {a2.caracteristica_priorizada?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Actividad contaminante</th>
                                                                        <th className="px-3 py-2 font-semibold">Especial</th>
                                                                        <th className="px-3 py-2 font-semibold">Física</th>
                                                                        <th className="px-3 py-2 font-semibold">Microbiológica</th>
                                                                        <th className="px-3 py-2 font-semibold">Química</th>
                                                                        <th className="px-3 py-2 font-semibold">Observaciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.caracteristica_priorizada.map((re) => (
                                                                        <tr key={re.id_caracteristica} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2">{re.actividad_contaminante ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.carac_especial ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.carac_fisica ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.carac_microbiologica ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.carac_quimica ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.observaciones ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center text-sm">Sin datos técnicos</p>
                                    )}
                                </div>
                            </details>




                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Anexo 2 ({selectedMapa.anexo2?.length || 0})
                                </summary>

                                <div className="p-3 space-y-6">
                                    {selectedMapa.anexo2 && selectedMapa.anexo2.length > 0 ? (
                                        selectedMapa.anexo2.map((a2) => (
                                            <div key={a2.id_reporte2} className="border-b pb-6 last:border-0 space-y-6">
                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Bocatomas ({a2.bocatoma?.length || 0})
                                                    </h6>

                                                    {a2.bocatoma?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Fecha</th>
                                                                        <th className="px-3 py-2 font-semibold">Especiales</th>
                                                                        <th className="px-3 py-2 font-semibold">Físicas</th>
                                                                        <th className="px-3 py-2 font-semibold">Microbiológicas</th>
                                                                        <th className="px-3 py-2 font-semibold">Química</th>
                                                                        <th className="px-3 py-2 font-semibold">Descartadas</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.bocatoma.map((b) => (
                                                                        <tr key={b.id_bocatoma} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2 whitespace-nowrap">{b.fecha ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.caract_especiales ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.caract_fisica ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.caract_microbiologicas ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.caract_quimica ?? "-"}</td>
                                                                            <td className="px-3 py-2">{b.descartadas ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Redes de Distribución ({a2.red?.length || 0})
                                                    </h6>

                                                    {a2.red?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Fecha</th>
                                                                        <th className="px-3 py-2 font-semibold">Especiales</th>
                                                                        <th className="px-3 py-2 font-semibold">Físicas</th>
                                                                        <th className="px-3 py-2 font-semibold">Microbiológicas</th>
                                                                        <th className="px-3 py-2 font-semibold">Química</th>
                                                                        <th className="px-3 py-2 font-semibold">Descartadas</th>
                                                                        <th className="px-3 py-2 font-semibold">Medida sanitaria</th>
                                                                        <th className="px-3 py-2 font-semibold">Observaciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.red.map((r) => (
                                                                        <tr key={r.id_red} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2 whitespace-nowrap">{r.fecha ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.caract_especiales ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.caract_fisicas ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.caract_microbiologicas ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.caract_quimicas ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.descartadas ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.medidas_sanitarias ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.observaciones ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Resolución ({a2.resolucion?.length || 0})
                                                    </h6>

                                                    {a2.resolucion?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Número</th>
                                                                        <th className="px-3 py-2 font-semibold">Fecha expedición</th>
                                                                        <th className="px-3 py-2 font-semibold">Archivo</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.resolucion.map((re) => (
                                                                        <tr key={re.id_resolucion} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2 whitespace-nowrap">{re.numero_resolucion ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{re.fecha_expedicion ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.archivo_resolucion ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center text-sm">Sin datos técnicos</p>
                                    )}
                                </div>
                            </details>

                            <details className="bg-gray-50 rounded-lg overflow-hidden">
                                <summary className="p-3 bg-gray-100 font-semibold cursor-pointer hover:bg-gray-200">
                                    Información Técnica Seguimiento ({selectedMapa.seguimiento?.length || 0})
                                </summary>

                                <div className="p-3 space-y-6">
                                    {selectedMapa.seguimiento && selectedMapa.seguimiento.length > 0 ? (
                                        selectedMapa.seguimiento.map((a2) => (
                                            <div key={a2.id_reporte3} className="border-b pb-6 last:border-0 space-y-6">
                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Características ({a2.seguimiento_caracteristica?.length || 0})
                                                    </h6>

                                                    {a2.seguimiento_caracteristica?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Característica</th>
                                                                        <th className="px-3 py-2 font-semibold">Frecuencia PP</th>
                                                                        <th className="px-3 py-2 font-semibold">Frecuencia AS</th>
                                                                        <th className="px-3 py-2 font-semibold">Mín. muestras PP</th>
                                                                        <th className="px-3 py-2 font-semibold">Mín. muestras AS</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.seguimiento_caracteristica.map((b) => (
                                                                        <tr key={b.id_caracteristica} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2">{b.caracteristica_seguimiento ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{b.frecuencia_pp ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{b.frecuencia_as ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{b.minimo_muestras_pp ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{b.minimo_muestras_as ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Inspección ({a2.seguimiento_inspeccion?.length || 0})
                                                    </h6>

                                                    {a2.seguimiento_inspeccion?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Nombre archivo</th>
                                                                        <th className="px-3 py-2 font-semibold">Acta</th>
                                                                        <th className="px-3 py-2 font-semibold">Fecha acta</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.seguimiento_inspeccion.map((r) => (
                                                                        <tr key={r.id_inspeccion} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2">{r.nombre_archivo ?? "-"}</td>
                                                                            <td className="px-3 py-2">{r.acta ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{r.fecha_acta ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Seguridad ({a2.seguridad?.length || 0})
                                                    </h6>

                                                    {a2.seguridad?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Medida</th>
                                                                        <th className="px-3 py-2 font-semibold">Fecha</th>
                                                                        <th className="px-3 py-2 font-semibold">Observación</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.seguridad.map((re) => (
                                                                        <tr key={re.id_seguridad} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2">{re.medida ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{re.fecha ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.observacion ?? "-"}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <h6 className="font-bold text-xs text-gray-700">
                                                        Riesgo ({a2.riesgo?.length || 0})
                                                    </h6>

                                                    {a2.riesgo?.length ? (
                                                        <div className="overflow-x-auto bg-white border rounded">
                                                            <table className="min-w-full text-xs">
                                                                <thead className="bg-gray-50">
                                                                    <tr className="text-left text-gray-700">
                                                                        <th className="px-3 py-2 font-semibold">Entidad</th>
                                                                        <th className="px-3 py-2 font-semibold">Evidencia</th>
                                                                        <th className="px-3 py-2 font-semibold">Fecha</th>
                                                                        <th className="px-3 py-2 font-semibold">Cumple</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y">
                                                                    {a2.riesgo.map((re) => (
                                                                        <tr key={`${re.actividad ?? ""}-${re.fecha ?? ""}`} className="text-gray-800 align-top">
                                                                            <td className="px-3 py-2">{re.entidad ?? "-"}</td>
                                                                            <td className="px-3 py-2">{re.evidencia ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">{re.fecha ?? "-"}</td>
                                                                            <td className="px-3 py-2 whitespace-nowrap">
                                                                                {re.cumple ?? "-"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm">Sin datos</p>
                                                    )}
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