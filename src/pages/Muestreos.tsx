import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box, Button, TextField, Typography, Paper, InputAdornment, 
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Muestreos() {
    const [search, setSearch] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25, // Aumentamos el tamaño por defecto
    });

    // ✅ Query optimizada con paginación del lado del servidor
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['muestreos', search, paginationModel.page, paginationModel.pageSize],
        queryFn: async () => {
            const from = paginationModel.page * paginationModel.pageSize;
            const to = from + paginationModel.pageSize - 1;

            let query = supabase
                .from('muestreo')
                .select(`
                    id_muestreo,
                    codigo,
                    nombre,
                    descripcion,
                    id_prestador,
                    id_laboratorio,
                    id_solicitante,
                    prestador(nit, nombre),
                    laboratorio(nombre),
                    solicitante(nombre)
                `, { count: 'exact' })
                .order('id_muestreo', { ascending: false })
                .range(from, to);

            if (search) {
                query = query.or(`codigo.ilike.%${search}%,nombre.ilike.%${search}%,descripcion.ilike.%${search}%`);
            }

            const { data, count, error } = await query;
            if (error) {
                console.error('Error en query:', error);
                throw error;
            }

            return { data, count };
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false, // No recargar al cambiar de ventana
    });

    const muestreos = data?.data || [];
    const totalRows = data?.count || 0;

    // ✅ Columnas optimizadas
    const columns: GridColDef[] = [
        { 
            field: 'codigo', 
            headerName: 'Código', 
            flex: 0.6,
            minWidth: 100
        },
        { 
            field: 'nombre', 
            headerName: 'Nombre', 
            flex: 1,
            minWidth: 150
        },
        { 
            field: 'descripcion', 
            headerName: 'Descripción', 
            flex: 1.2,
            minWidth: 200
        },
        {
            field: 'prestador',
            headerName: 'NIT Prestador',
            flex: 0.8,
            minWidth: 120,
            renderCell: (params) => params.row?.prestador?.nit || 'Sin NIT',
        },
        {
            field: 'nombre_prestador',
            headerName: 'Prestador',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => params.row?.prestador?.nombre || 'Sin prestador',
        },
        {
            field: 'laboratorio',
            headerName: 'Laboratorio',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => params.row?.laboratorio?.nombre || 'Sin laboratorio',
        },
        {
            field: 'solicitante',
            headerName: 'Solicitante',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => params.row?.solicitante?.nombre || 'Sin solicitante',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Acciones',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Edit size={18} />}
                    label="Editar"
                    onClick={() => console.log('editar', params.row)}
                />,
                <GridActionsCellItem
                    icon={<Trash2 size={18} />}
                    label="Eliminar"
                    onClick={() => {
                        if (confirm('¿Está seguro de eliminar este muestreo?')) {
                            console.log('eliminar', params.row.id_muestreo);
                        }
                    }}
                />,
            ],
        },
    ];

    return (
        <Box>
            {/* ✅ Encabezado */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                        Muestreos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión de {totalRows.toLocaleString()} registros de muestreo
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Plus size={20} />}>
                    Nuevo Muestreo
                </Button>
            </Box>

            {/* ✅ Filtros */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por código, nombre o descripción..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPaginationModel({ ...paginationModel, page: 0 }); // Reset a página 1
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                {/* ✅ Tabla con paginación del servidor */}
                <Box sx={{ height: 'auto', width: '100%' }}>
                    <DataGrid
                        rows={muestreos}
                        columns={columns}
                        loading={isLoading}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={(newModel) => {
                            console.log('Cambio de paginación:', newModel);
                            setPaginationModel(newModel);
                        }}
                        rowCount={totalRows}
                        getRowId={(row) => row.id_muestreo}
                        pageSizeOptions={[10, 25, 50, 100, 200]}
                        autoHeight
                        disableRowSelectionOnClick
                        disableColumnFilter
                        density="comfortable"
                        sx={{
                            width: '100%',
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
                            '& .MuiDataGrid-virtualScroller': { 
                                overflowX: 'auto'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                        localeText={{
                            noRowsLabel: 'No se encontraron muestreos',
                            MuiTablePagination: {
                                labelDisplayedRows: ({ from, to, count }) =>
                                    `${from}-${to} de ${count !== -1 ? count.toLocaleString() : `más de ${to}`}`,
                                labelRowsPerPage: 'Filas por página:',
                            },
                        }}
                    />
                </Box>

                {/* ✅ Información adicional */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Página {paginationModel.page + 1} de {Math.ceil(totalRows / paginationModel.pageSize)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {isFetching ? 'Actualizando...' : 'Datos actualizados'}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}