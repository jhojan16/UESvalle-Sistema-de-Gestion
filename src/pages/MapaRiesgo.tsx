import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../integrations/supabase/client";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png"; // No usado actualmente

// Tipo de dato para el resultado FINAL aplanado
type PuntoCaptacionPlano = {
    id_mapa: number;
    tipo_captacion: string | null;
    latitud: number | null;
    longitud: number | null;
    // Opcional: añade más datos si los traes con el `select *`
    // id_prestador: number | null;
    // id_punto_captacion: number | null;
};

// Fix a los íconos de Leaflet en Vite
// delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    // shadowUrl: markerShadow,
});

export default function MapaPuntosCaptacion() {
    const [puntos, setPuntos] = useState<PuntoCaptacionPlano[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 1. NUEVO ESTADO: Guarda la información del punto seleccionado
    const [selectedPunto, setSelectedPunto] = useState<PuntoCaptacionPlano | null>(null);

    useEffect(() => {
        const fetchPuntos = async () => {
            // Se usa `*` para traer 'id_prestador' y 'id_punto_captacion' de 'mapa_riesgo'
            const { data, error } = await supabase
                .from("mapa_riesgo")
                .select(`*, punto_captacion (tipo_captacion, latitud, longitud)`);

            if (error) {
                console.error("Error cargando puntos:", error);
            } else {
                const puntosAplanados: PuntoCaptacionPlano[] = data.map((item: any) => ({
                    // Propiedades directas de 'mapa_riesgo'
                    id_mapa: item.id_mapa,
                    // id_prestador: item.id_prestador, // si quieres traer más info
                    
                    // Propiedades anidadas de 'punto_captacion'
                    tipo_captacion: item.punto_captacion?.tipo_captacion ?? null,
                    latitud: item.punto_captacion?.latitud ?? null,
                    longitud: item.punto_captacion?.longitud ?? null,
                }));
                setPuntos(puntosAplanados);
            }
            setLoading(false);
        };

        fetchPuntos();
    }, []);

    // 2. NUEVA FUNCIÓN: Maneja el clic en el marcador
    const handleMarkerClick = (punto: PuntoCaptacionPlano) => {
        setSelectedPunto(punto);
    };

    if (loading) return <p className="text-center py-4">Cargando mapa…</p>;

    return (
        <div className="flex flex-row w-full h-[95vh] gap-4">
            
            {/* MAPA (Lado izquierdo) */}
            <div className="w-2/3 rounded-xl overflow-hidden shadow-lg">
                <MapContainer
                    center={[4.090, -76.191]} // Centro inicial en Tuluá
                    zoom={8}
                    className="w-full h-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© OpenStreetMap contributors"
                    />

                    {puntos
                        .filter(p => p.latitud !== null && p.longitud !== null)
                        .map((p) => (
                            <Marker
                                key={p.id_mapa}
                                position={[p.latitud!, p.longitud!]}
                                // 4. AÑADIR EL EVENTO DE CLIC
                                eventHandlers={{
                                    click: () => handleMarkerClick(p),
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p><b>Mapa de Riesgo #</b> {p.id_mapa ?? "N/A"}</p>
                                        <p><b>Tipo:</b> {p.tipo_captacion ?? "N/A"}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                </MapContainer>
            </div>

            {/* 3. CARD DE DETALLES (Lado derecho) */}
            <div className="w-1/3 bg-white p-6 rounded-xl shadow-lg overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Detalles del Mapa de Riesgo</h3>
                
                {selectedPunto ? (
                    <div className="space-y-3">
                        <p className="text-lg font-semibold text-blue-600">
                            Mapa de Riesgo # {selectedPunto.id_mapa}
                        </p>
                        
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-gray-700">Tipo de Captación:</p>
                            <p className="text-gray-900">{selectedPunto.tipo_captacion ?? 'No especificado'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-gray-700">Coordenadas:</p>
                            <p className="text-gray-900">
                                Latitud: {selectedPunto.latitud}
                            </p>
                            <p className="text-gray-900">
                                Longitud: {selectedPunto.longitud}
                            </p>
                        </div>
                        
                        {/* Puedes añadir más información aquí */}
                        <p className="mt-4 text-sm text-gray-500">
                            *Aquí podrías cargar más detalles del prestador o municipio usando el id_prestador o id_punto_captacion si los hubieras traído.
                        </p>
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