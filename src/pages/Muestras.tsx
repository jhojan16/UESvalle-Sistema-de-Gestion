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
    Grid,
    Chip,
    Divider,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Search, Eye, X } from 'lucide-react';

type AnalisisMuestra = {
    id_analisis_muestra: number;
    tipo_analisis: string;
    caracteristica: string | null;
    metodo: string | null;
    resultado: number | null;
    unidades: string | null;
    valores_aceptados: string | null;
    diagnostico: string | null;
    id_muestra: number | null;
    muestra_no: string;
    fecha_toma: string;
    irca: number | null;
};

export default function VistaAnalisisMuestras() {
    const [search, setSearch] = useState('');
    const [selectedAnalisis, setSelectedAnalisis] = useState<AnalisisMuestra | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });

    // ✅ Consultar todos los análisis de muestras
    const { data: analisis, isLoading } = useQuery({
        queryKey: ['analisis-muestras'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('muestra')
                .select('*')
                .order('fecha_toma', { ascending: false });

            if (error) throw error;
            return data as AnalisisMuestra[];
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
                if (irca === null || irca === undefined) return '-';

                // Clasificación IRCA
                let color: 'success' | 'info' | 'warning' | 'error' = 'success';
                let nivel = 'Sin Riesgo';

                if (irca <= 5) {
                    color = 'success';
                    nivel = 'Sin Riesgo';
                } else if (irca <= 14) {
                    color = 'info';
                    nivel = 'Bajo';
                } else if (irca <= 35) {
                    color = 'warning';
                    nivel = 'Medio';
                } else {
                    color = 'error';
                    nivel = 'Alto';
                }

                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                            {irca}
                        </Typography>
                        <Chip label={nivel} color={color} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                );
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

    // ✅ Función para obtener color del diagnóstico
    const getDiagnosticoColor = (diagnostico: string | null) => {
        if (!diagnostico) return 'default';
        const lower = diagnostico.toLowerCase();
        if (lower.includes('aceptable') || lower.includes('conforme')) return 'success';
        if (lower.includes('no aceptable') || lower.includes('no conforme')) return 'error';
        return 'warning';
    };

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
                maxWidth="md"
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
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            ID Análisis
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            #{selectedAnalisis.id_analisis_muestra}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            ID Muestra
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {selectedAnalisis.id_muestra || 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Número de Muestra
                                        </Typography>
                                        <Chip
                                            label={selectedAnalisis.muestra_no || 'Sin número'}
                                            color="primary"
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Fecha de Toma
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {selectedAnalisis.fecha_toma
                                                ? new Date(selectedAnalisis.fecha_toma).toLocaleDateString('es-CO', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })
                                                : 'No especificada'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            IRCA (Índice de Riesgo)
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            {selectedAnalisis.irca !== null && selectedAnalisis.irca !== undefined ? (
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <Typography variant="h5" fontWeight="bold">
                                                        {selectedAnalisis.irca}
                                                    </Typography>
                                                    <Chip
                                                        label={
                                                            selectedAnalisis.irca <= 5
                                                                ? 'Sin Riesgo'
                                                                : selectedAnalisis.irca <= 14
                                                                    ? 'Riesgo Bajo'
                                                                    : selectedAnalisis.irca <= 35
                                                                        ? 'Riesgo Medio'
                                                                        : 'Riesgo Alto'
                                                        }
                                                        color={
                                                            selectedAnalisis.irca <= 5
                                                                ? 'success'
                                                                : selectedAnalisis.irca <= 14
                                                                    ? 'info'
                                                                    : selectedAnalisis.irca <= 35
                                                                        ? 'warning'
                                                                        : 'error'
                                                        }
                                                        size="small"
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography variant="body1">No disponible</Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Detalles del Análisis */}
                            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Detalles del Análisis
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Tipo de Análisis
                                        </Typography>
                                        <Typography variant="body1" fontWeight="medium">
                                            {selectedAnalisis.tipo_analisis}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Característica
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAnalisis.caracteristica || 'No especificada'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">
                                            Método
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAnalisis.metodo || 'No especificado'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary">
                                            Resultado
                                        </Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            {selectedAnalisis.resultado !== null
                                                ? selectedAnalisis.resultado
                                                : 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary">
                                            Unidades
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAnalisis.unidades || 'N/A'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="caption" color="text.secondary">
                                            Valores Aceptados
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedAnalisis.valores_aceptados || 'No especificado'}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Diagnóstico
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={selectedAnalisis.diagnostico || 'Sin diagnóstico'}
                                                color={getDiagnosticoColor(selectedAnalisis.diagnostico)}
                                                size="medium"
                                            />
                                        </Box>
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