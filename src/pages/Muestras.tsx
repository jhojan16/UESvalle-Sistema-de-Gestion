import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Chip,
    Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Search, Eye, X } from 'lucide-react';
import { useParams } from 'react-router-dom';

type muestra = {
    id_muestra: number
    muestra_no: string
    contramuestra_pp: string | null
    fecha_toma: string | null
    fecha_recepcion_lab: string | null
    fecha_analisis_lab: string | null
    desinfectante: string | null
    coagulante: string | null
    analisis_solicitados: string | null
    resultados_para: string | null
    observaciones: string | null
    nota: string | null
    irca_basico: number | null
    irca_especial: number | null
    irca: number | null
    nivel_riesgo: string | null
    id_muestreo: number | null
    codigo_laboratorio: string | null
    tipo_muestra: string | null
    nombre: string | null
    prestador?: prestador | null;
    laboratorio?: laboratorio | null
};

type prestador = {
    nit: string | null
    nombre: string | null
    telefono: string | null
    direccion: string | null
    codigo_sistema: string | null
    nombre_sistema: string | null
    codigo_anterior: string | null
}

type laboratorio = {
    nombre: string | null
    estado: string | null
    telefono: string | null
}

export default function VistaAnalisisMuestras() {
    const { id } = useParams<{ id: string }>();
    const [search, setSearch] = useState('');
    const [selectedAnalisis, setSelectedAnalisis] = useState<muestra | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });

    const muestraId = id ? parseInt(id) : 0;

    // ✅ Consultar todos los análisis de muestras
    const { data: analisis, isLoading } = useQuery({
        queryKey: ['muestras'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('muestra')
                .select(`
                    *,
                    prestador(*),
                    laboratorio (
                    nombre, estado, telefono)`)
                .order('fecha_toma', { ascending: false });
            console.log(data);
            if (error) throw error;
            return data as muestra[];
            

        },
        
        
        staleTime: 5 * 60 * 1000, // Cache por 5 minutos
        refetchOnWindowFocus: false,
    });

    // ✅ Filtrado optimizado con useMemo
    const filteredData = useMemo(() => {
        if (!search.trim() || !analisis) return analisis || [];

        const searchLower = search.toLowerCase();
        return analisis.filter((item) => {
            return (
                item.muestra_no?.toLowerCase().includes(searchLower) ||
                item.fecha_toma?.toLowerCase().includes(searchLower) ||
                item.irca?.toString().includes(searchLower)
            );
        });
    }, [analisis, search]);

    // ✅ Columnas de la tabla
    const columns: GridColDef[] = [
        {
            field: 'muestra_no',
            headerName: 'Nº Muestra',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Chip
                    label={params.value || 'Sin número'}
                    color="primary"
                    size="small"
                    variant="outlined"
                />
            ),
        },
        {
            field: 'fecha_toma',
            headerName: 'Fecha Toma',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                if (!params.value) return '-';
                const date = new Date(params.value);
                return date.toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            },
        },
        {
            field: 'irca',
            headerName: 'IRCA',
            flex: 0.5,
            minWidth: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const irca = params.value;
                return irca
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Acciones',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Eye size={18} />}
                    label="Ver Detalles"
                    onClick={() => {
                        setSelectedAnalisis(params.row);
                        setDialogOpen(true);
                    }}
                />,
            ],
        },
    ];

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    Análisis de Muestras
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gestión y consulta de análisis de calidad del agua
                </Typography>
            </Box>

            {/* Búsqueda */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por Nº Muestra, Fecha o IRCA..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} />
                            </InputAdornment>
                        ),
                    }}
                    helperText={`${filteredData.length} registros encontrados`}
                />
            </Paper>

            {/* Tabla de muestras */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <DataGrid
                        rows={filteredData}
                        columns={columns}
                        loading={isLoading}
                        getRowId={(row) => row.id_muestra}
                        paginationMode="client"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[25, 50, 100, 200]}
                        disableRowSelectionOnClick
                        rowHeight={70}
                        sx={{
                            height: '100%',
                            minHeight: 600,
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            },
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-cell:focus-within': {
                                outline: 'none',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'action.hover',
                                fontWeight: 'bold',
                                borderBottom: '2px solid',
                                borderColor: 'divider',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            },
                        }}
                    />
                </Box>
            </Paper>

            {/* Dialog de detalles */}
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedAnalisis(null);
                }}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Detalles del Análisis
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Muestra: {selectedAnalisis?.muestra_no || 'Sin número'}
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => {
                                setDialogOpen(false);
                                setSelectedAnalisis(null);
                            }}
                        >
                            <X />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    {selectedAnalisis ? (
                        <Box>
                            {/* Información Principal */}
                            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Información General
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2}>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            ID Muestra
                                        </Typography>
                                        <Typography >
                                            {selectedAnalisis.id_muestra ?? 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Número de Muestra
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.muestra_no ?? 'Sin número'}
                                        </Typography>

                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Contramuestra
                                        </Typography>
                                        <Typography >
                                            {selectedAnalisis.contramuestra_pp ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            IRCA (Índice de Riesgo)
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.irca}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            IRCA basico
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.irca_basico ?? "No especificado"}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            IRCA especial
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.irca_especial ?? 'No especificado'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Fecha toma
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAnalisis.fecha_toma ?? 'No especificado'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Fecha recepción
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.fecha_recepcion_lab ?? "No especificado"}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Fecha analisis
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.fecha_analisis_lab ?? 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Coagulante
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.coagulante ?? 'No especificado'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Resultados para
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.resultados_para ?? 'No especificado'}
                                        </Typography>
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Tipo
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.tipo_muestra ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Desinfectante
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.desinfectante ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Código laboratorio
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.codigo_laboratorio ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Analisis Solicitados
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.analisis_solicitados ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Observaciones
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.observaciones ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 12 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nota
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis.nota ?? 'No especificado'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Detalles del Análisis */}
                            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Prestador
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={10}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nombre
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.prestador?.nombre ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            NIT
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.prestador?.nit ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Dirección
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.prestador?.direccion ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nombre Sistema
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.prestador?.nombre_sistema ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Código sistema
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.prestador?.codigo_sistema ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Detalles del laboratorio */}
                            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Prestador
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={10}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Nombre
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.laboratorio?.nombre ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Estado
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.laboratorio?.estado ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Telefono
                                        </Typography>
                                        <Typography>
                                            {selectedAnalisis?.laboratorio?.telefono ?? "No registrado"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}