import { 
    Card, Chip, Divider, LinearProgress, Typography, 
    Box, List, ListItemButton, Paper, Grid, TextField 
} from '@mui/material';
import { supabase } from '@/integrations/supabase/client';
import React, { useEffect, useState, useMemo } from 'react';

// TIPOS
// types/Inspeccion.ts (Sin cambios)
export type Inspeccion = {
    id_inspeccion: number;
    id_inspeccion_sivicap: string | null;
    fecha_inspeccion: string | null;
    autoridad_inspeccion: string | null;
    concepto: string | null; 
    plazo_ejecucion_inspeccion: string | null;
    plan_mejoramiento: string | null;
    iraba_inspeccion: number | null;
    indice_tratamiento: number | null;
    indice_continuidad: number | null;
    bps: number | null;
    estado: string | null;
    id_prestador: number | null;
};

// Componentes Auxiliares (sin cambios en su estructura, solo incluidos para referencia)
const DetailItem: React.FC<{ label: string, value: string | number | null, color?: string }> = ({ label, value, color }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
        </Typography>
        <Typography 
            variant="body1" 
            sx={{ 
                color: color, 
                fontWeight: 600 
            }}
        >
            {value ?? 'N/A'}
        </Typography>
    </Box>
);

const IndicatorItem: React.FC<{ label: string, value: number | null, unit: string, color: 'primary' | 'secondary' | 'error' }> = ({ label, value, unit, color }) => (
    <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }} color={color}>
                {value ?? 0}{unit}
            </Typography>
        </Box>
        <LinearProgress 
            variant="determinate" 
            value={value || 0} 
            color={color} 
            sx={{ height: 8, borderRadius: 5 }} 
        />
    </Box>
);

// --- VISTA DE LISTA (MEJORADA CON BÚSQUEDA Y TAMAÑO FIJO) ---

const InspeccionListView: React.FC<{ 
    inspecciones: Inspeccion[], 
    onSelect: (i: Inspeccion) => void, 
    selectedId: number | null,
    height: string // Prop para controlar la altura
}> = ({ inspecciones, onSelect, selectedId, height }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Lógica de Filtrado (solo por id_inspeccion por ahora)
    const filteredInspecciones = useMemo(() => {
        if (!searchTerm) {
            return inspecciones;
        }
        const searchNumber = parseInt(searchTerm, 10);
        
        return inspecciones.filter(inspeccion => 
            String(inspeccion.id_inspeccion).includes(searchTerm) || 
            (searchNumber && inspeccion.id_inspeccion === searchNumber)
        );
    }, [inspecciones, searchTerm]);

    return (
        <Paper elevation={4} sx={{ p: 2, height: height, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Listado de Inspecciones
            </Typography>
            
            {/* Barra de Búsqueda */}
            <TextField
                fullWidth
                label="Buscar por ID de Inspección"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
            />
            
            {/* Lista Scrollable */}
            <List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
                {filteredInspecciones.length > 0 ? (
                    filteredInspecciones.map((inspeccion) => (
                        <ListItemButton
                            key={inspeccion.id_inspeccion}
                            selected={selectedId === inspeccion.id_inspeccion}
                            onClick={() => onSelect(inspeccion)}
                            sx={{
                                mb: 1,
                                borderRadius: 1,
                                py: 1.5,
                                borderLeft: selectedId === inspeccion.id_inspeccion ? '4px solid #1976d2' : 'none',
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Inspección #{inspeccion.id_inspeccion}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha: {inspeccion.fecha_inspeccion}
                                </Typography>
                                <Chip 
                                    label={inspeccion.concepto || 'Sin concepto'} 
                                    size="small" 
                                    color={inspeccion.concepto === 'FAVORABLE' ? 'success' : 'warning'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                        </ListItemButton>
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography color="text.secondary">No se encontraron inspecciones.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );
};

// --- VISTA DE DETALLE (MEJORADA CON TAMAÑO FIJO) ---

const InspeccionDetailView: React.FC<{ inspeccion: Inspeccion, height: string }> = ({ inspeccion, height }) => (
    // Se usa Paper con la altura fija y redondeo
    <Paper elevation={4} sx={{ p: 4, height: height, overflowY: 'auto', borderRadius: 2 }}> 
        <Typography variant="h4" component="h2" color="primary" sx={{ mb: 3, pb: 1, borderBottom: '1px solid #eee', fontWeight: 700 }}>
            Detalle de Inspección #{inspeccion.id_inspeccion}
        </Typography>
        
        {/* ... El contenido de la grid y plan de mejoramiento permanece igual ... */}
        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Datos Generales</Typography>
                <DetailItem label="Autoridad" value={inspeccion.autoridad_inspeccion} />
                <DetailItem label="Fecha Inspección" value={inspeccion.fecha_inspeccion} />
                <DetailItem 
                    label="Concepto Final" 
                    value={inspeccion.concepto} 
                    color={inspeccion.concepto === 'FAVORABLE' ? 'success.main' : 'error.main'} 
                />
                <DetailItem label="Plazo Ejecución" value={inspeccion.plazo_ejecucion_inspeccion} />
            </Grid>
            
            <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Indicadores Clave</Typography>
                <IndicatorItem label="IRABA" value={inspeccion.iraba_inspeccion} unit="%" color="error" />
                <IndicatorItem label="Índice Tratamiento" value={inspeccion.indice_tratamiento} unit="%" color="primary" />
                <IndicatorItem label="Índice Continuidad" value={inspeccion.indice_continuidad} unit="%" color="secondary" />
                <DetailItem label="BPS" value={inspeccion.bps} />
            </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>Plan de Mejoramiento</Typography>
        <Paper variant="outlined" sx={{ p: 2, minHeight: 100, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
                {inspeccion.plan_mejoramiento || "No se registró un plan de mejoramiento."}
            </Typography>
        </Paper>
        
        {/* Espacio para el gráfico IRABA */}
        <Box sx={{ mt: 4 }}>
            {/* Aquí se integrará el componente del gráfico de tendencia IRABA */}
            {/* Ejemplo: <IrabaHistoryChart idPrestador={inspeccion.id_prestador} /> */}
        </Box>
    </Paper>
);


// COMPONENTE PRINCIPAL
export default function InspeccionesView() {
    const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
    const [selectedInspeccion, setSelectedInspeccion] = useState<Inspeccion | null>(null);
    const [loading, setLoading] = useState(true);

    // Definimos la altura del contenido principal (ej. restando header/footer si existieran)
    const viewHeight = 'calc(100vh - 48px)'; // Ejemplo: 100vh menos 48px de padding/margen

    useEffect(() => {
        // ... Lógica de fetch ... (se mantiene igual)
        const fetchInspecciones = async () => {
            const { data, error } = await supabase
                .from("inspeccion")
                .select('*')
                .order('fecha_inspeccion', { ascending: false });

            if (error) {
                console.error("Error cargando inspecciones:", error);
            } else {
                setInspecciones(data as Inspeccion[]);
                if (data.length > 0) {
                    setSelectedInspeccion(data[0] as Inspeccion);
                }
            }
            setLoading(false);
        };

        fetchInspecciones();
    }, []);

    if (loading) return (
        <Box sx={{ p: 4, textAlign: 'center', height: viewHeight }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>Cargando inspecciones...</Typography>
        </Box>
    );

    return (
        <Box className="h-screen" sx={{ display: 'flex', p: 3, bgcolor: 'grey.50' }}>
            
            {/* Panel de Lista (Ancho 50%) */}
            <Box sx={{ width: '50%', pr: 2 }}>
                <InspeccionListView 
                    inspecciones={inspecciones} 
                    onSelect={setSelectedInspeccion} 
                    selectedId={selectedInspeccion?.id_inspeccion || null} 
                    height={viewHeight} // Altura fija
                />
            </Box>

            {/* Panel de Detalle (Ancho 50%) */}
            <Box sx={{ width: '50%', pl: 2 }}>
                {selectedInspeccion ? (
                    <InspeccionDetailView 
                        inspeccion={selectedInspeccion} 
                        height={viewHeight} // Altura fija
                    />
                ) : (
                    <Paper elevation={4} sx={{ p: 4, height: viewHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
                        <Typography variant="h6" color="text.secondary">
                            Selecciona una inspección de la lista para ver los detalles.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}