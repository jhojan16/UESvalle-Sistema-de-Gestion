import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Tabs,
    Tab,
    Card,
    CardContent,
    Chip,
    Divider,
} from '@mui/material';
import { ArrowLeft, MapPin, Phone, Building2, FileText } from 'lucide-react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

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

    // Representantes del prestador
    const { data: representantes = [] } = useQuery({
        queryKey: ['representantes', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('representante')
                .select('*')
                .eq('id_prestador', prestadorId)
                .order('nombre');

            if (error) throw error;
            return data;
        },
        enabled: !!prestadorId,
    });

    // Muestreos con laboratorio y solicitante
    const { data: muestreos = [] } = useQuery({
        queryKey: ['muestreos', prestadorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('muestreo')
                .select(`
          *,
          laboratorio (
            nombre,
            telefono,
            email
          ),
          solicitante (
            nombre,
            estado
          )
        `)
                .eq('id_prestador', prestadorId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!prestadorId,
    });

    // Reportes relacionados al prestador
    const { data: reportes = [] } = useQuery({
        queryKey: ['reportes', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('reportes')
                .select('*')
                .eq('prestador', prestador?.nombre)
                .order('fecha_creacion', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!prestador?.nombre,
    });

    if (loadingPrestador) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
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

    const representantesColumns: GridColDef[] = [
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200 },
        { field: 'cargo', headerName: 'Cargo', width: 180 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    ];

    const muestreosColumns: GridColDef[] = [
        { field: 'codigo', headerName: 'Código', width: 150 },
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200 },
        {
            field: 'laboratorio',
            headerName: 'Laboratorio',
            width: 200,
            renderCell: (params: any) => params.row.laboratorio?.nombre || 'N/A'
        },
        {
            field: 'solicitante',
            headerName: 'Solicitante',
            width: 200,
            renderCell: (params: any) => params.row.solicitante?.nombre || 'N/A'
        },
        {
            field: 'created_at',
            headerName: 'Fecha',
            width: 150,
            renderCell: (params: any) => new Date(params.row.created_at).toLocaleDateString()
        },
    ];

    const reportesColumns: GridColDef[] = [
        { field: 'codigo', headerName: 'Código', width: 150 },
        { field: 'punto', headerName: 'Punto', flex: 1, minWidth: 150 },
        { field: 'municipio', headerName: 'Municipio', width: 150 },
        { field: 'departamento', headerName: 'Departamento', width: 150 },
        {
            field: 'estado',
            headerName: 'Estado',
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'completado' ? 'success' : 'warning'}
                    size="small"
                />
            )
        },
        { field: 'fecha_creacion', headerName: 'Fecha', width: 150 },
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

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mt: 2 }}>
                    <Box>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Información General
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Building2 size={18} />
                                        <Typography variant="body2" color="text.secondary">NIT:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.nit || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Phone size={18} />
                                        <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.telefono || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <FileText size={18} />
                                        <Typography variant="body2" color="text.secondary">ID SSPD:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.id_sspd || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <FileText size={18} />
                                        <Typography variant="body2" color="text.secondary">ID Autoridad Sanitaria:</Typography>
                                        <Typography variant="body2" fontWeight="medium">{prestador.id_autoridad_sanitaria || 'N/A'}</Typography>
                                    </Box>
                                    {prestador.nombre_sistema && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Building2 size={18} />
                                            <Typography variant="body2" color="text.secondary">Sistema:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{prestador.nombre_sistema}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Ubicación
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <MapPin size={18} />
                                        <Typography variant="body2" color="text.secondary">Departamento:</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {prestador.ubicacion?.departamento || 'N/A'}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <MapPin size={18} />
                                        <Typography variant="body2" color="text.secondary">Municipio:</Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {prestador.ubicacion?.municipio || 'N/A'}
                                        </Typography>
                                    </Box>
                                    {prestador.ubicacion?.vereda && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <MapPin size={18} />
                                            <Typography variant="body2" color="text.secondary">Vereda:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{prestador.ubicacion.vereda}</Typography>
                                        </Box>
                                    )}
                                    {prestador.direccion && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <MapPin size={18} />
                                            <Typography variant="body2" color="text.secondary">Dirección:</Typography>
                                            <Typography variant="body2" fontWeight="medium">{prestador.direccion}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Paper>

            {/* Tabs con información relacionada */}
            <Paper sx={{ p: 3 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label={`Representantes (${representantes.length})`} />
                    <Tab label={`Muestreos (${muestreos.length})`} />
                    <Tab label={`Reportes (${reportes.length})`} />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={representantes}
                            columns={representantesColumns}
                            getRowId={(row) => row.id_representante}
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
                            getRowId={(row) => row.id_muestreo}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            disableRowSelectionOnClick
                        />
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={reportes}
                            columns={reportesColumns}
                            getRowId={(row) => row.id}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            disableRowSelectionOnClick
                        />
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
}
