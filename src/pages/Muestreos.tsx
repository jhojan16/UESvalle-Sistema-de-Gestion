import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box, Button, TextField, Typography, Paper, InputAdornment
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Muestreos() {
    const [search, setSearch] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    // ✅ Query con joins y paginación
    const { data, isLoading } = useQuery({
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
                .order('id_muestreo', { ascending: true })
                .range(from, to);

            if (search) {
                query = query.or(`codigo.ilike.%${search}%,nombre.ilike.%${search}%`);
            }

            const { data, count, error } = await query;
            if (error) throw error;

            return { data, count };
        },
    });

    const muestreos = data?.data || [];
    const totalRows = data?.count || 0;

    // ✅ Columnas con valores relacionados
    const columns: GridColDef[] = [
        { field: 'codigo', headerName: 'Código', flex:0.5 },
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
        { field: 'descripcion', headerName: 'Descripción', flex: 1},

        {
            field: 'prestador',
            headerName: 'NIT Prestador',
            flex: 1,
            renderCell: (params) => {
                const prestador = params.row?.prestador;
                return prestador?.nit || 'Sin NIT';
            },
        },
        {
            field: 'nombre_prestador',
            headerName: 'Nombre Prestador',
            flex: 1,
            renderCell: (params) => {
                const prestador = params.row?.prestador;
                return prestador?.nombre || 'Sin prestador';
            },
        },
        {
            field: 'laboratorio',
            headerName: 'Laboratorio',
            flex: 1,
            renderCell: (params) => {
                const lab = params.row?.laboratorio;
                return lab?.nombre || 'Sin laboratorio';
            },
        },
        {
            field: 'solicitante',
            headerName: 'Solicitante',
            flex: 1,
            renderCell: (params) => {
                const sol = params.row?.solicitante;
                return sol?.nombre || 'Sin solicitante';
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Acciones',
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<Edit size={18} />}
                    label="Editar"
                    onClick={() => console.log('editar', params.row)}
                />,
                <GridActionsCellItem
                    icon={<Trash2 size={18} />}
                    label="Eliminar"
                    onClick={() => console.log('eliminar', params.row.id_muestreo)}
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
                        Gestión de registros de muestreo
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Plus size={20} />}>
                    Nuevo Muestreo
                </Button>
            </Box>

            {/* ✅ Tabla */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por código o nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box sx={{ height: 'auto', width: '100%' }}>
                    <DataGrid
                        rows={muestreos}
                        columns={columns}
                        loading={isLoading}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        rowCount={totalRows}
                        getRowId={(row) => row.id_muestreo}
                        pageSizeOptions={[10, 50, 100]}
                        autoHeight 
                        disableRowSelectionOnClick
                        sx={{
                            width: '100%',
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden !important' },
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}
