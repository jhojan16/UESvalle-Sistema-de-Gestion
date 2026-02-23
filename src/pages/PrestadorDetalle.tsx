import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box, Button, Typography, Paper, CircularProgress, Tabs, Tab, Card, CardContent, Chip, Divider,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { AppLoader } from '@/components/AppLoader';

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
})

function Recenter({ center, zoom }: { center: [number, number]; zoom?: number }) {
    const map = useMap()
    React.useEffect(() => {
        map.setView(center, zoom ?? map.getZoom())
    }, [center, zoom])
    return null
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function PrestadorDetalle() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = React.useState(0);

    const prestadorId = id ? parseInt(id) : 0;

    // Consulta principal del prestador con ubicación
    const { data: prestador, isLoading: loadingPrestador } = useQuery({
        queryKey: ['prestador', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('prestador')
                .select(`
            *,
            ubicacion (
                departamento,
                municipio,
                vereda
            )
        `)
                .eq('id_prestador', prestadorId)
                .single();

            if (error) throw error;
            return data;
        },
    });

    const { data: representante, isLoading: loadingRepresentante } = useQuery({
        queryKey: ['representante', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('representante')
                .select(`nombre, cargo, email`)
                .eq('id_prestador', prestadorId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
    });


    // Representantes del prestador
    const { data: inspeccion = [] } = useQuery({
        queryKey: ['inspeccion', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inspeccion')
                .select('*')
                .eq('id_prestador', prestadorId)
            if (error) throw error;
            return data;
        },
        enabled: !!prestadorId,
    });

    // mapa de riesgo del prestador
    const { data: reporte = [] } = useQuery({
        queryKey: ['mapa_riesgo', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('mapa_riesgo')
                .select(`id_mapa, id_prestador,
                    punto_captacion (id_punto_captacion, tipo_captacion, fuente_captacion, municipio, latitud, longitud),
                    anexo2 (*, bocatoma (*), red (*))
                    `)
                .eq('id_prestador', prestadorId)
                .eq('anexo2.red.descartadas', 'NO')
                .eq('anexo2.bocatoma.descartadas', 'NO')
            if (error) throw error;
            return data;

        },
        enabled: !!prestadorId,
    });
    // Muestreos con laboratorio y solicitante
    const { data: muestreos = [] } = useQuery({
        queryKey: ['muestra', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('muestra')
                .select('id_muestra, muestra_no, irca, nivel_riesgo, tipo_muestra, fecha_toma, analisis_solicitados')
                .eq('id_prestador', prestadorId)

            if (error) throw error;
            return data;
        },
        enabled: !!prestadorId,
    });

    const reporteRows = React.useMemo(() => {
        return (reporte ?? []).map((r: any) => {
            const anexos = r.anexo2 ?? []
            const bocatomaCount = anexos.reduce((acc: number, a: any) => acc + ((a?.bocatoma?.length ?? 0)), 0)
            const redCount = anexos.reduce((acc: number, a: any) => acc + ((a?.red?.length ?? 0)), 0)
            return { ...r, bocatomaCount, redCount, hasExtra: bocatomaCount > 0 || redCount > 0 }
        })
    }, [reporte])

    const [selectedMapaRiesgo, setSelectedMapaRiesgo] = React.useState<any | null>(null)

    const bocatomaRows = React.useMemo(() => {
        if (!selectedMapaRiesgo?.anexo2?.length) return []
        return selectedMapaRiesgo.anexo2.flatMap((a: any) => a?.bocatoma ?? [])
    }, [selectedMapaRiesgo])

    const redRows = React.useMemo(() => {
        if (!selectedMapaRiesgo?.anexo2?.length) return []
        return selectedMapaRiesgo.anexo2.flatMap((a: any) => a?.red ?? [])
    }, [selectedMapaRiesgo])

    const puntosMapa = React.useMemo(() => {
        return (reporte ?? [])
            .map((r: any) => {
                const lat = Number(r?.punto_captacion?.latitud)
                const lon = Number(r?.punto_captacion?.longitud)
                return { ...r, _lat: lat, _lon: lon }
            })
            .filter((r: any) => Number.isFinite(r._lat) && Number.isFinite(r._lon))
    }, [reporte])

    const centerMapa = React.useMemo<[number, number]>(() => {
        if (selectedMapaRiesgo?.punto_captacion?.latitud && selectedMapaRiesgo?.punto_captacion?.longitud) {
            return [Number(selectedMapaRiesgo.punto_captacion.latitud), Number(selectedMapaRiesgo.punto_captacion.longitud)]
        }
        if (puntosMapa.length > 0) return [puntosMapa[0]._lat, puntosMapa[0]._lon]
        return [4.090, -76.191]
    }, [selectedMapaRiesgo, puntosMapa])

    const bocatomaColumns: GridColDef[] = [
        { field: 'fecha', headerName: 'Fecha', flex: 1, minWidth: 220 },
        { field: 'caract_fisica', headerName: 'Física', flex: 1, minWidth: 220 },
        { field: 'caract_quimica', headerName: 'Química', flex: 1, minWidth: 220 },
        { field: 'caract_microbiologicas', headerName: 'Microbiológica', flex: 1, minWidth: 220 },
        { field: 'caract_especiales', headerName: 'Especiales', flex: 1, minWidth: 220 },
        { field: 'descartadas', headerName: 'Descartadas', width: 130 },
    ]

    const redColumns: GridColDef[] = [
        { field: 'fecha', headerName: 'Fecha', flex: 1, minWidth: 220 },
        { field: 'caract_fisicas', headerName: 'Físicas', flex: 1, minWidth: 200 },
        { field: 'caract_quimicas', headerName: 'Químicas', flex: 1, minWidth: 200 },
        { field: 'caract_microbiologicas', headerName: 'Microbiológicas', flex: 1, minWidth: 200 },
        { field: 'caract_especiales', headerName: 'Especiales', flex: 1, minWidth: 200 },
        { field: 'medidas_sanitarias', headerName: 'Medidas sanitarias', flex: 1, minWidth: 200 },
        { field: 'observaciones', headerName: 'Observaciones', flex: 1, minWidth: 200 },
        { field: 'descartadas', headerName: 'Descartadas', width: 130 },
    ]

    if (loadingPrestador) {
        return <AppLoader message="Cargando detalle del prestador..." minHeight={400} />;
    }

    if (!prestador) {
        return (
            <Box>
                <Typography variant="h5" color="error">
                    Prestador no encontrado
                </Typography>
                <Button startIcon={<ArrowLeft />} onClick={() => navigate('/prestadores')} sx={{ mt: 2 }}>
                    Volver a Prestadores
                </Button>
            </Box>
        );
    }

    const inspeccionColumns: GridColDef[] = [
        // { field: 'id_inspeccion', headerName: 'id', flex: 1, minWidth: 200 },
        { field: 'id_inspeccion_sivicap', headerName: 'ID Inspección', flex: 1, minWidth: 200 },
        { field: 'fecha_inspeccion', headerName: 'Fecha', width: 200 },
        { field: 'concepto', headerName: 'Concepto', flex: 1, minWidth: 200 },
        { field: 'estado', headerName: 'Estado', flex: 1, minWidth: 200 },

    ];

    const muestreosColumns: GridColDef[] = [
        { field: 'muestra_no', headerName: 'Código', flex: 1, width: 100 },
        { field: 'irca', headerName: 'Irca', flex: 1, width: 100 },
        { field: 'nivel_riesgo', headerName: 'Nivel de riesgo', flex: 1, width: 200, },
        { field: 'fecha_toma', headerName: 'Fecha toma', flex: 1, width: 200, },
        { field: 'analisis_solicitados', headerName: 'Análisis solicitados', flex: 1, width: 200, },
        { field: 'tipo_muestra', headerName: 'Tipo muestra', flex: 1, width: 200, },
    ];

    const reportesColumns: GridColDef[] = [
        { field: 'id_mapa', headerName: 'Mapa de riesgo', flex: 1, width: 150 },
        {
            field: 'fuente_captacion', headerName: 'Fuente Captación', flex: 1, minWidth: 200,
            renderCell: (params) => params.row.punto_captacion?.fuente_captacion
        },
        {
            field: 'tipo_captacion', headerName: 'Tipo captación', flex: 1, width: 200,
            renderCell: (params) => params.row.punto_captacion?.tipo_captacion
        },
        {
            field: 'municipio', headerName: 'Municipio', flex: 1, width: 200,
            renderCell: (params) => params.row.punto_captacion?.municipio
        },
        {
            field: 'adicional', headerName: 'Caracteristicas', flex: 1, minWidth: 220, sortable: false, filterable: false,
            renderCell: (params) => {
                const boc = params.row.bocatomaCount ?? 0
                const red = params.row.redCount ?? 0
                const has = params.row.hasExtra
                return has ? (
                    <Chip size="small" label={`Bocatoma: ${boc} | Red: ${red}`} variant="outlined" />
                ) : (
                    <Chip size="small" label="Sin info" variant="outlined" />
                )
            }
        }

    ];



    return (
        <Box>
            <Button
                startIcon={<ArrowLeft />}
                onClick={() => navigate('/prestadores')}
                sx={{ mb: 3 }}
            >
                Volver a Prestadores
            </Button>

            {/* Información Principal */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {prestador.nombre}
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mt: 2 }}>
                    <Box>
                        <Card variant="outlined" sx={{ height: 250 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Información General
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.secondary">NIT:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.nit || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.telefono || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.secondary">ID Autoridad Sanitaria:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.id_autoridad_sanitaria || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.secondary">Sistema:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.nombre_sistema || 'N/A'}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Card variant="outlined" sx={{ height: 250 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Representante
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {loadingRepresentante ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 170 }}>
                                        <CircularProgress size={22} />
                                    </Box>
                                ) : representante ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="text.secondary">Nombre:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{representante.nombre || 'N/A'}</Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="text.secondary">Cargo:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{representante.cargo || 'N/A'}</Typography>
                                        </Box>

                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="text.secondary">Email:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{representante.email || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 170 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No hay representante registrado
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Card variant="outlined" sx={{ height: 250 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Ubicación
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.secondary">Departamento:</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {prestador.ubicacion?.departamento || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.secondary">Municipio:</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {prestador.ubicacion?.municipio || 'N/A'}
                                        </Typography>
                                    </Box>
                                    {prestador.ubicacion?.vereda && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="text.secondary">Vereda:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{prestador.ubicacion.vereda}</Typography>
                                        </Box>
                                    )}
                                    {prestador.direccion && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" color="text.secondary">Dirección:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{prestador.direccion}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
                <Box sx={{ mt: 3 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Indicadores de la población
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        No. Suscriptores Urbanos
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {prestador.suscriptores_urbanos ?? "N/A"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        No. Suscriptores Rurales
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {prestador.suscriptores_rurales ?? "N/A"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Indice de Ocupación
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {prestador.indice_ocupacion ?? "N/A"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Población atendida
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {prestador.poblacion_atendida ?? "N/A"}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Total población atendida
                                    </Typography>
                                    <Typography variant="h6" fontWeight="bold">
                                        {prestador.total_poblacion_atendida ?? "N/A"}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Paper>

            {puntosMapa.length > 0 && (
                <Paper sx={{ p: 2, mb: 3, overflow: "hidden" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Mapa de puntos de captación
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: 420, width: "100%" }}>
                        <MapContainer center={centerMapa} zoom={10} className="w-full h-full">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />
                            {puntosMapa.map((p: any) => (
                                <Marker
                                    key={p.id_mapa}
                                    position={[p._lat, p._lon]}
                                    eventHandlers={{
                                        click: () => setSelectedMapaRiesgo(p),
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p><b>Mapa de Riesgo #</b> {p.id_mapa}</p>
                                            <p><b>Tipo:</b> {p.punto_captacion?.tipo_captacion ?? "N/A"}</p>
                                            <p><b>Fuente:</b> {p.punto_captacion?.fuente_captacion ?? "N/A"}</p>
                                            <p><b>Municipio:</b> {p.punto_captacion?.municipio ?? "N/A"}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </Box>
                </Paper>
            )}

            {/* Tabs con información relacionada */}
            <Paper sx={{ p: 3 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label={`Inspección (${inspeccion.length})`} />
                    <Tab label={`Muestras (${muestreos.length})`} />
                    <Tab label={`Mapa riesgo (${reporte.length})`} />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={inspeccion}
                            columns={inspeccionColumns}
                            getRowId={(row) => row.id_inspeccion}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            disableRowSelectionOnClick
                        />
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={muestreos}
                            columns={muestreosColumns}
                            getRowId={(row) => row.id_muestra}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            disableRowSelectionOnClick
                        />
                    </Box>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={reporteRows}
                                columns={reportesColumns}
                                getRowId={(row) => row.id_mapa}
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                disableRowSelectionOnClick
                                onRowClick={(params) => setSelectedMapaRiesgo(params.row)}
                                getRowClassName={(params) => (params.row.hasExtra ? 'row-has-extra' : '')}
                                sx={{
                                    '& .row-has-extra': {
                                        bgcolor: 'rgba(53, 158, 255, 0.06)'
                                    }
                                }}
                            />
                        </Box>

                        {selectedMapaRiesgo && (
                            <Box sx={{ mt: 3 }}>

                                {bocatomaRows.length > 0 && (
                                    <Paper sx={{ p: 2.5, mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Bocatoma ({bocatomaRows.length})
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ height: 400, width: '100%' }}>
                                            <DataGrid
                                                rows={bocatomaRows}
                                                columns={bocatomaColumns}
                                                getRowId={(row) => row.id_bocatoma}
                                                pageSizeOptions={[10, 25, 50]}
                                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                                disableRowSelectionOnClick
                                            />
                                        </Box>
                                    </Paper>
                                )}

                                {redRows.length > 0 && (
                                    <Paper sx={{ p: 2.5 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Redes de Distribución
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ height: 400, width: '100%' }}>
                                            <DataGrid
                                                rows={redRows}
                                                columns={redColumns}
                                                getRowId={(row) => row.id_red}
                                                pageSizeOptions={[10, 25, 50]}
                                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                                disableRowSelectionOnClick
                                            />
                                        </Box>
                                    </Paper>
                                )}
                            </Box>
                        )}
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
}
