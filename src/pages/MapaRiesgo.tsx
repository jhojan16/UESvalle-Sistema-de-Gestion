import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../integrations/supabase/client"; // <-- tu cliente
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Tipo de datos de tu tabla
type PuntoCaptacion = {
    id_punto_captacion: number;
    tipo_captacion: string | null;
    latitud: number;
    longitud: number;
};

// Fix a los íconos de Leaflet en Vite (importante)
//delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function MapaPuntosCaptacion() {
    const [puntos, setPuntos] = useState<PuntoCaptacion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPuntos = async () => {
            const { data, error } = await supabase
                .from("punto_captacion")
                .select("*");

            if (error) {
                console.error("Error cargando puntos:", error);
            } else {
                setPuntos(data);
            }
            setLoading(false);
        };

        fetchPuntos();
    }, []);

    if (loading) return <p className="text-center py-4">Cargando mapa…</p>;

    return (
        <div className="w-full h-[80vh] rounded-xl overflow-hidden shadow-lg">
            <MapContainer
                center={[4.5709, -74.2973]} // centro en Colombia
                zoom={7}
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
                            key={p.id_punto_captacion}
                            position={[p.latitud!, p.longitud!]}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <p><b>ID:</b> {p.id_punto_captacion}</p>
                                    <p><b>Tipo:</b> {p.tipo_captacion ?? "N/A"}</p>
                                    <p><b>Lat:</b> {p.latitud}</p>
                                    <p><b>Lon:</b> {p.longitud}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

            </MapContainer>
        </div>
    );
}
