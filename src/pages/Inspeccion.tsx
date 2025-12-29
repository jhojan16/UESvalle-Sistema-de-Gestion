import { 
    Card, Chip, Divider, LinearProgress, Typography, 
    Box, List, ListItemButton, Paper, Grid, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { supabase } from '@/integrations/supabase/client';
import React, { useEffect, useState, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// TIPOS para los datos de Supabase
type InspeccionBase = {
    id_inspeccion: number;
    id_inspeccion_sivicap: number | null;  // Cambiado de string a number
    fecha_inspeccion: string | null;
    autoridad_inspeccion: string | null;
    fecha_visita_anterior: string | null;
    nombre_visita_anterior: string | null;
    copia_visita_anterior: string | null;
    concepto: string | null;
    plazo_ejecucion_inspeccion: string | null;
    plan_mejoramiento: string | null;
    habitantes_municipio: number | null;
    viviendas: number | null;
    viviendas_urbano: number | null;
    iraba_inspeccion: number | null;
    indice_tratamiento: number | null;
    indice_continuidad: number | null;
    bps: number | null;
    estado: string | null;
    id_prestador: number | null;
};

type PrestadorBase = {
    id_prestador: number;
    nit: string | null;
    nombre: string | null;
    direccion: string | null;
    telefono: string | null;
    nombre_sistema: string | null;
    ubicacion?: {
        departamento: string | null;
        municipio: string | null;
        vereda: string | null;
    } | null;
};

type MapaRiesgoBase = {
    id_mapa: number;
    id_prestador: number | null;
    punto_captacion?: {
        tipo_captacion: string | null;
        fuente_captacion: string | null;
        latitud: number | null;
        longitud: number | null;
    } | null;
};

type MuestraBase = {
    id_muestra: number;
    muestra_no: string | null;
    fecha_toma: string | null;
    irca: number | null;
    nivel_riesgo: string | null;
    id_prestador: number | null;
    punto_muestreo?: {
        nombre: string | null;
        codigo: string | null;
    } | null;
};

// Tipo completo para la inspección
export type InspeccionCompleta = InspeccionBase & {
    prestador?: PrestadorBase | null;
    mapas_riesgo?: MapaRiesgoBase[];
    muestras?: MuestraBase[];
};

// Componentes Auxiliares
const DetailItem: React.FC<{ label: string, value: string | number | null }> = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#4a5568' }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
            {value ?? 'N/A'}
        </Typography>
    </Box>
);

const BlueChip: React.FC<{ label: string, variant?: 'outlined' | 'filled' }> = ({ label, variant = 'outlined' }) => (
    <Chip 
        label={label} 
        variant={variant}
        sx={{ 
            borderColor: '#3182ce',
            color: variant === 'filled' ? 'white' : '#3182ce',
            bgcolor: variant === 'filled' ? '#3182ce' : 'transparent',
            fontWeight: 500 
        }}
    />
);

// Función auxiliar para convertir cualquier valor a string de búsqueda
const toSearchString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.toLowerCase();
    if (typeof value === 'number') return value.toString().toLowerCase();
    if (typeof value === 'boolean') return value.toString().toLowerCase();
    return String(value).toLowerCase();
};

// Componente de Lista con Búsqueda CORREGIDO
const InspeccionListView: React.FC<{ 
    inspecciones: InspeccionCompleta[], 
    onSelect: (i: InspeccionCompleta) => void, 
    selectedId: number | null 
}> = ({ inspecciones, onSelect, selectedId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInspecciones = useMemo(() => {
        if (!searchTerm) return inspecciones;
        
        const searchLower = searchTerm.toLowerCase();
        
        return inspecciones.filter(inspeccion => {
            // Convertir todos los valores a strings para búsqueda
            const idInspeccionStr = toSearchString(inspeccion.id_inspeccion);
            const idSivicapStr = toSearchString(inspeccion.id_inspeccion_sivicap);
            const nitStr = toSearchString(inspeccion.prestador?.nit);
            const nombrePrestadorStr = toSearchString(inspeccion.prestador?.nombre);
            
            return (
                idInspeccionStr.includes(searchLower) ||
                idSivicapStr.includes(searchLower) ||
                nitStr.includes(searchLower) ||
                nombrePrestadorStr.includes(searchLower)
            );
        });
    }, [inspecciones, searchTerm]);

    return (
        <Paper elevation={0} sx={{ 
            p: 3, 
            height: 'calc(100vh - 100px)', 
            display: 'flex', 
            flexDirection: 'column',
            border: '1px solid #e2e8f0',
            borderRadius: 2
        }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                Listado de Inspecciones
            </Typography>
            
            {/* Barra de Búsqueda */}
            <TextField
                fullWidth
                placeholder="Buscar por ID SIVICAP, NIT o Nombre del Prestador"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: '#718096' }} />
                }}
            />
            
            {/* Lista */}
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
                                py: 2,
                                borderLeft: selectedId === inspeccion.id_inspeccion ? '4px solid #3182ce' : 'none',
                                bgcolor: selectedId === inspeccion.id_inspeccion ? '#ebf8ff' : 'transparent',
                                '&:hover': {
                                    bgcolor: '#ebf8ff'
                                }
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                        Inspección #{inspeccion.id_inspeccion}
                                    </Typography>
                                    <BlueChip label={inspeccion.concepto || 'S/C'} />
                                </Box>
                                
                                <Typography variant="body2" sx={{ color: '#4a5568', mb: 1 }}>
                                    {inspeccion.fecha_inspeccion || 'Fecha no disponible'}
                                </Typography>
                                
                                <Typography variant="body2" sx={{ color: '#4a5568', mb: 0.5 }}>
                                    <strong>Prestador:</strong> {inspeccion.prestador?.nombre || 'N/A'}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                    {inspeccion.id_inspeccion_sivicap && (
                                        <Typography variant="caption" sx={{ 
                                            bgcolor: '#e6f7ff', 
                                            px: 1, 
                                            py: 0.5, 
                                            borderRadius: 1,
                                            color: '#3182ce'
                                        }}>
                                            SIVICAP: {inspeccion.id_inspeccion_sivicap}
                                        </Typography>
                                    )}
                                    {inspeccion.prestador?.nit && (
                                        <Typography variant="caption" sx={{ 
                                            bgcolor: '#f0f9ff', 
                                            px: 1, 
                                            py: 0.5, 
                                            borderRadius: 1,
                                            color: '#2c5282'
                                        }}>
                                            NIT: {inspeccion.prestador.nit}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </ListItemButton>
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <Typography color="#718096">No se encontraron inspecciones.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );
};

// Componente de Detalle - También corregido para mostrar id_inspeccion_sivicap como número
const InspeccionDetailView: React.FC<{ inspeccion: InspeccionCompleta }> = ({ inspeccion }) => {
    return (
        <Box sx={{ height: 'calc(100vh - 100px)', overflowY: 'auto', pr: 1 }}>
            {/* Encabezado */}
            <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: '#ebf8ff',
                border: '1px solid #bee3f8',
                borderRadius: 2
            }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#2c5282' }}>
                    Inspección #{inspeccion.id_inspeccion}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    {inspeccion.id_inspeccion_sivicap && (
                        <BlueChip label={`SIVICAP: ${inspeccion.id_inspeccion_sivicap}`} variant="filled" />
                    )}
                    <BlueChip label={inspeccion.concepto || 'Sin concepto'} />
                    <BlueChip label={inspeccion.estado || 'Sin estado'} />
                </Box>
                
                <Typography variant="body1" sx={{ color: '#4a5568' }}>
                    <strong>Fecha:</strong> {inspeccion.fecha_inspeccion || 'N/A'}
                </Typography>
            </Paper>

            {/* Información Principal en Grid */}
            <Grid container spacing={3}>
                {/* Columna 1: Información de Inspección */}
                <Grid size={{ xs: 12, md:6}}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%', }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                            Información de Inspección
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Autoridad" value={inspeccion.autoridad_inspeccion} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Visita Anterior" value={inspeccion.fecha_visita_anterior} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Plazo Ejecución" value={inspeccion.plazo_ejecucion_inspeccion} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Habitantes Municipio" value={inspeccion.habitantes_municipio} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="ID SIVICAP" value={inspeccion.id_inspeccion_sivicap} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Viviendas" value={inspeccion.viviendas} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Columna 2: Indicadores */}
                <Grid size={{ xs: 12, md:6}}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%', }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                            Indicadores
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: '#4a5568' }}>IRABA</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#3182ce' }}>
                                    {inspeccion.iraba_inspeccion ?? 0}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={inspeccion.iraba_inspeccion || 0} 
                                sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    bgcolor: '#e2e8f0',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: '#3182ce'
                                    }
                                }} 
                            />
                        </Box>
                        
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Índice Tratamiento" value={inspeccion.indice_tratamiento ? `${inspeccion.indice_tratamiento}%` : null} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Índice Continuidad" value={inspeccion.indice_continuidad ? `${inspeccion.indice_continuidad}%` : null} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="BPS" value={inspeccion.bps} />
                            </Grid>
                            <Grid size={{ xs: 6}}>
                                <DetailItem label="Viviendas Urbanas" value={inspeccion.viviendas_urbano} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Prestador */}
            {inspeccion.prestador && (
                <Paper elevation={0} sx={{ p: 3, mt: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2d3748' }}>
                        Información del Prestador
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md:4}}>
                            <DetailItem label="Nombre" value={inspeccion.prestador.nombre} />
                        </Grid>
                        <Grid size={{ xs: 12, md:2}}>
                            <DetailItem label="NIT" value={inspeccion.prestador.nit} />
                        </Grid>
                        <Grid size={{ xs: 12, md:3}}>
                            <DetailItem label="Teléfono" value={inspeccion.prestador.telefono} />
                        </Grid>
                        <Grid size={{ xs: 12, md:3}}>
                            <DetailItem label="Sistema" value={inspeccion.prestador.nombre_sistema} />
                        </Grid>
                        {inspeccion.prestador.ubicacion && (
                            <>
                                <Grid size={{ xs: 6}}>
                                    <DetailItem label="Departamento" value={inspeccion.prestador.ubicacion.departamento} />
                                </Grid>
                                <Grid size={{ xs: 6}}>
                                    <DetailItem label="Municipio" value={inspeccion.prestador.ubicacion.municipio} />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </Paper>
            )}

            {/* Acordeones para información relacionada */}
            <Box sx={{ mt: 3 }}>
                {/* Plan de Mejoramiento */}
                <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>Plan de Mejoramiento</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography sx={{ color: '#4a5568', whiteSpace: 'pre-wrap' }}>
                            {inspeccion.plan_mejoramiento || "No se registró un plan de mejoramiento."}
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                {/* Información de Visita Anterior */}
                {(inspeccion.nombre_visita_anterior || inspeccion.copia_visita_anterior) && (
                    <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>Visita Anterior</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6}}>
                                    <DetailItem label="Nombre" value={inspeccion.nombre_visita_anterior} />
                                </Grid>
                                <Grid size={{ xs: 6}}>
                                    <DetailItem label="Copia Disponible" value={inspeccion.copia_visita_anterior} />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Mapas de Riesgo */}
                {inspeccion.mapas_riesgo && inspeccion.mapas_riesgo.length > 0 && (
                    <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                                Mapas de Riesgo ({inspeccion.mapas_riesgo.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f7fafc' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>ID Mapa</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Tipo Captación</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Coordenadas</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inspeccion.mapas_riesgo.map((mapa) => (
                                            <TableRow key={mapa.id_mapa}>
                                                <TableCell>{mapa.id_mapa}</TableCell>
                                                <TableCell>{mapa.punto_captacion?.tipo_captacion || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {mapa.punto_captacion?.latitud && mapa.punto_captacion?.longitud 
                                                        ? `${mapa.punto_captacion.latitud}, ${mapa.punto_captacion.longitud}`
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                )}

                {/* Muestras */}
                {inspeccion.muestras && inspeccion.muestras.length > 0 && (
                    <Accordion elevation={0} sx={{ border: '1px solid #e2e8f0', mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                                Muestras ({inspeccion.muestras.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f7fafc' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}># Muestra</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Fecha Toma</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>IRCA</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Nivel Riesgo</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Punto Muestreo</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {inspeccion.muestras.map((muestra) => (
                                            <TableRow key={muestra.id_muestra}>
                                                <TableCell>{muestra.muestra_no}</TableCell>
                                                <TableCell>{muestra.fecha_toma}</TableCell>
                                                <TableCell>
                                                    {muestra.irca ? (
                                                        <BlueChip label={`${muestra.irca}%`} />
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <BlueChip 
                                                        label={muestra.nivel_riesgo || 'N/A'} 
                                                        variant={muestra.nivel_riesgo ? 'filled' : 'outlined'}
                                                    />
                                                </TableCell>
                                                <TableCell>{muestra.punto_muestreo?.nombre || muestra.punto_muestreo?.codigo || 'N/A'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                )}
            </Box>
        </Box>
    );
};

// COMPONENTE PRINCIPAL - Mantenido igual que antes
export default function InspeccionesView() {
    const [inspecciones, setInspecciones] = useState<InspeccionCompleta[]>([]);
    const [selectedInspeccion, setSelectedInspeccion] = useState<InspeccionCompleta | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInspeccionesCompletas = async () => {
            try {
                console.log("Iniciando carga de inspecciones...");
                
                // 1. Cargar inspecciones con prestador
                const { data: inspeccionesData, error: inspeccionesError } = await supabase
                    .from("inspeccion")
                    .select(`
                        *,
                        prestador:prestador (
                            *,
                            ubicacion (*)
                        )
                    `)
                    .order('fecha_inspeccion', { ascending: false });

                if (inspeccionesError) {
                    console.error("Error cargando inspecciones:", inspeccionesError);
                    throw inspeccionesError;
                }

                console.log(`Inspecciones cargadas: ${inspeccionesData?.length || 0}`);

                if (!inspeccionesData || inspeccionesData.length === 0) {
                    setInspecciones([]);
                    setLoading(false);
                    return;
                }

                // Casting explícito del tipo
                const inspeccionesBase = inspeccionesData as unknown as Array<InspeccionBase & {
                    prestador?: PrestadorBase | null;
                }>;

                // 2. Obtener IDs de prestadores para consultas relacionadas
                const prestadorIds = inspeccionesBase
                    .map(i => i.id_prestador)
                    .filter((id): id is number => id !== null && id !== undefined);

                console.log("Prestador IDs:", prestadorIds);

                if (prestadorIds.length === 0) {
                    const inspeccionesSimples: InspeccionCompleta[] = inspeccionesBase.map(inspeccion => ({
                        ...inspeccion,
                        prestador: inspeccion.prestador || null,
                        mapas_riesgo: [],
                        muestras: []
                    }));
                    
                    setInspecciones(inspeccionesSimples);
                    if (inspeccionesSimples.length > 0) {
                        setSelectedInspeccion(inspeccionesSimples[0]);
                    }
                    setLoading(false);
                    return;
                }

                // 3. Consultar datos relacionados en paralelo
                const [
                    { data: mapasData, error: mapasError },
                    { data: muestrasData, error: muestrasError }
                ] = await Promise.all([
                    supabase
                        .from("mapa_riesgo")
                        .select(`
                            id_mapa,
                            id_prestador,
                            punto_captacion (*)
                        `)
                        .in("id_prestador", prestadorIds),
                    
                    supabase
                        .from("muestra")
                        .select(`
                            id_muestra,
                            muestra_no,
                            fecha_toma,
                            irca,
                            nivel_riesgo,
                            id_prestador,
                            punto_muestreo (nombre, codigo)
                        `)
                        .in("id_prestador", prestadorIds)
                ]);

                if (mapasError) console.error("Error mapas:", mapasError);
                if (muestrasError) console.error("Error muestras:", muestrasError);

                // Casting explícito de los datos relacionados
                const mapas = mapasData as unknown as MapaRiesgoBase[] | null;
                const muestras = muestrasData as unknown as MuestraBase[] | null;

                console.log("Mapas relacionados:", mapas?.length || 0);
                console.log("Muestras relacionadas:", muestras?.length || 0);

                // 4. Estructurar los datos
                const inspeccionesCompletas: InspeccionCompleta[] = inspeccionesBase.map(inspeccion => {
                    const mapasRelacionados = mapas?.filter(mapa => mapa.id_prestador === inspeccion.id_prestador) || [];
                    const muestrasRelacionadas = muestras?.filter(muestra => muestra.id_prestador === inspeccion.id_prestador) || [];

                    return {
                        ...inspeccion,
                        prestador: inspeccion.prestador || null,
                        mapas_riesgo: mapasRelacionados,
                        muestras: muestrasRelacionadas
                    };
                });

                console.log("Inspecciones completas procesadas:", inspeccionesCompletas.length);

                setInspecciones(inspeccionesCompletas);
                if (inspeccionesCompletas.length > 0) {
                    setSelectedInspeccion(inspeccionesCompletas[0]);
                }
            } catch (error) {
                console.error("Error cargando inspecciones:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInspeccionesCompletas();
    }, []);

    if (loading) return (
        <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
                <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0' }} />
                <Typography sx={{ mt: 2, color: '#4a5568' }}>Cargando inspecciones...</Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ 
            display: 'flex', 
            p: 3, 
            gap: 3, 
            minHeight: '100vh',
            bgcolor: '#f8fafc'
        }}>
            {/* Panel de Lista (35%) */}
            <Box sx={{ width: '35%' }}>
                <InspeccionListView 
                    inspecciones={inspecciones} 
                    onSelect={setSelectedInspeccion} 
                    selectedId={selectedInspeccion?.id_inspeccion || null} 
                />
            </Box>

            {/* Panel de Detalle (65%) */}
            <Box sx={{ width: '65%' }}>
                {selectedInspeccion ? (
                    <InspeccionDetailView inspeccion={selectedInspeccion} />
                ) : (
                    <Paper elevation={0} sx={{ 
                        p: 4, 
                        height: 'calc(100vh - 100px)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                        borderRadius: 2
                    }}>
                        <Typography variant="h6" sx={{ color: '#718096' }}>
                            Selecciona una inspección para ver los detalles
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box>
    );
}