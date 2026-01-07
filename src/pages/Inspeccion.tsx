import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box, Typography, Paper, TextField, InputAdornment,
    CircularProgress, Divider, List, ListItemButton, 
    ListItemText, Chip
} from '@mui/material';
import {Grid} from '@mui/material';
import { Search, ClipboardCheck, Landmark, ChevronRight, Calendar, User } from 'lucide-react';
import { InspeccionBase } from '@/integrations/supabase/index';

// --- COMPONENTES AUXILIARES PARA DETALLES ---

const InfoField = ({ label, value, md = 6 }: { label: string, value: any, md?: number }) => (
    <Grid size={{ xs: 12, md }}>
        <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value ?? '---'}
            </Typography>
        </Box>
    </Grid>
);

const DetailSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => (
    <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            {Icon && <Icon size={18} style={{ color: '#1976d2' }} />}
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                {title}
            </Typography>
        </Box>
        <Grid container spacing={1}>
            {children}
        </Grid>
        <Divider sx={{ mt: 2 }} />
    </Box>
);

export default function VistaInspeccionesMasterDetail() {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // --- CONSULTA ---
    const { data: inspecciones, isLoading } = useQuery({
        queryKey: ['inspecciones'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inspeccion')
                .select(`*, Prestador:prestador (*)`)
                .order('fecha_inspeccion', { ascending: false });
            if (error) throw error;
            return data as InspeccionBase[];
        },
    });

    // --- FILTRADO ---
    const filteredData = useMemo(() => {
        if (!search.trim() || !inspecciones) return inspecciones || [];
        const s = search.toLowerCase();
        return inspecciones.filter((item) => (
            item.Prestador?.nombre?.toLowerCase().includes(s) ||
            item.id_inspeccion_sivicap?.toString().includes(s)
        ));
    }, [inspecciones, search]);

    // Registro seleccionado actualmente
    const current = useMemo(() => 
        inspecciones?.find(i => i.id_inspeccion === selectedId) || null
    , [selectedId, inspecciones]);

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight="900">Inspecciones Sanitarias</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexGrow: 1, gap: 0, overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 4, bgcolor: '#fff' }}>
                
                {/* --- LADO IZQUIERDO: LISTA FIJA (350px) --- */}
                <Box sx={{ width: 380, minWidth: 380, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0', bgcolor: '#fcfcfc' }}>
                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por prestador..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                                sx: { borderRadius: 3, bgcolor: '#fff' }
                            }}
                        />
                    </Box>
                    
                    <Divider />

                    <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>
                        ) : filteredData.map((ins) => (
                            <ListItemButton 
                                key={ins.id_inspeccion}
                                selected={selectedId === ins.id_inspeccion}
                                onClick={() => setSelectedId(ins.id_inspeccion as number)}
                                sx={{
                                    py: 2,
                                    px: 2,
                                    borderBottom: '1px solid #f0f0f0',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    '&.Mui-selected': {
                                        borderLeft: '4px solid #1976d2',
                                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                                    <Typography variant="caption" fontWeight="bold" color="primary">
                                        SIVICAP #{ins.id_inspeccion_sivicap}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {ins.fecha_inspeccion}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="700" noWrap sx={{ width: '100%' }}>
                                    {ins.Prestador?.nombre || 'Sin Nombre'}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                    <Chip label={`IRABA: ${ins.iraba_inspeccion}%`} size="small" sx={{ fontSize: '10px', height: 20 }} color={Number(ins.iraba_inspeccion) > 5 ? "error" : "success"} variant="outlined" />
                                    <Chip label={ins.concepto || 'Pendiente'} size="small" sx={{ fontSize: '10px', height: 20 }} variant="outlined" />
                                </Box>
                            </ListItemButton>
                        ))}
                    </List>
                </Box>

                {/* --- LADO DERECHO: DETALLE FIJO --- */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                    {current ? (
                        <Box sx={{ p: 4, maxWidth: 1000, margin: '0 auto' }}>
                            {/* Header del detalle */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="overline" color="text.secondary">Informe Detallado de Inspección</Typography>
                                <Typography variant="h3" fontWeight="800" gutterBottom>{current.Prestador?.nombre}</Typography>
                                <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Calendar size={16} /> <Typography variant="body2">{current.fecha_inspeccion}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <User size={16} /> <Typography variant="body2">{current.autoridad_inspeccion}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            <DetailSection title="Resultado de la Visita" icon={ClipboardCheck}>
                                <InfoField label="Concepto Técnico" value={current.concepto} md={6} />
                                <InfoField label="Estado Registro" value={current.estado} md={6} />
                                <InfoField label="Plazo de Ejecución" value={current.plazo_ejecucion_inspeccion} md={12} />
                            </DetailSection>

                            <DetailSection title="Indicadores de Calidad y Continuidad" icon={Landmark}>
                                <InfoField label="IRABA (Riesgo)" value={`${current.iraba_inspeccion}%`} md={3} />
                                <InfoField label="Índice BPS" value={current.bps} md={3} />
                                <InfoField label="Índice Continuidad" value={current.indice_continuidad} md={3} />
                                <InfoField label="Índice Tratamiento" value={current.indice_tratamiento} md={3} />
                            </DetailSection>

                            <DetailSection title="Datos de Cobertura">
                                <InfoField label="Viviendas Totales" value={current.viviendas} md={4} />
                                <InfoField label="Viviendas en Zona Urbana" value={current.viviendas_urbano} md={4} />
                                <InfoField label="Población Municipio" value={current.habitantes_municipio} md={4} />
                            </DetailSection>

                            <DetailSection title="Información del Prestador Relacionado">
                                <InfoField label="NIT" value={current.Prestador?.nit} md={4} />
                                <InfoField label="Código del Sistema" value={current.Prestador?.codigo_sistema} md={4} />
                                <InfoField label="Nombre del Sistema" value={current.Prestador?.nombre_sistema} md={4} />
                                <InfoField label="Dirección de Oficina" value={current.Prestador?.direccion} md={12} />
                            </DetailSection>
                        </Box>
                    ) : (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 5, textAlign: 'center', color: 'text.disabled' }}>
                            <ChevronRight size={64} strokeWidth={1} />
                            <Typography variant="h5">No hay inspección seleccionada</Typography>
                            <Typography variant="body1">Selecciona un registro del panel izquierdo para visualizar la información técnica completa.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}