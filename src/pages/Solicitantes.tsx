import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Box,
    Button,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    InputAdornment,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Solicitante } from '@/integrations/supabase/index'

export default function Solicitantes() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSolicitante, setEditingSolicitante] = useState<Solicitante | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        estado: '',
        id_ubicacion_sol: '',
    });

    const queryClient = useQueryClient();

    const { data: ubicaciones } = useQuery({
    queryKey: ['ubicaciones-selector'],
    queryFn: async () => {
        const { data, error } = await supabase
            .from('ubicacion_solicitante')
            .select('id_ubicacion_sol, municipio, departamento')
            .order('municipio', { ascending: true });

        if (error) throw error;
        return data;
    },
});

    // ✅ Obtener solicitantes con su ubicación relacionada
    const { data: solicitantes, isLoading } = useQuery({
        queryKey: ['solicitantes', search],
        queryFn: async () => {
            let query = supabase
                .from('solicitante')
                .select(`
                id_solicitante,
                nombre,
                estado,
                id_ubicacion_sol,
                Ubicacion_solicitante:ubicacion_solicitante (
                departamento,
                municipio
                )
            `)
                .order('nombre', { ascending: true });


            if (search) {
                query = query.or(`nombre.ilike.%${search}%,estado.ilike.%${search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });


    // ✅ Crear solicitante
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const payload = {
                ...data,
                id_ubicacion_sol: data.id_ubicacion_sol ? parseInt(data.id_ubicacion_sol) : null
            };
            const { error } = await supabase.from('solicitante').insert([payload]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitantes'] });
            toast.success('Solicitante creado exitosamente');
            setDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al crear solicitante', { description: error.message });
        },
    });

    // ✅ Actualizar solicitante
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
            const payload = {
                ...data,
                id_ubicacion_sol: data.id_ubicacion_sol ? parseInt(data.id_ubicacion_sol) : null
            };
            const { error } = await supabase
                .from('solicitante')
                .update(payload)
                .eq('id_solicitante', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitantes'] });
            toast.success('Solicitante actualizado exitosamente');
            setDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al actualizar solicitante', { description: error.message });
        },
    });

    // ✅ Eliminar solicitante
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('solicitante').delete().eq('id_solicitante', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solicitantes'] });
            toast.success('Solicitante eliminado exitosamente');
        },
        onError: (error) => {
            toast.error('Error al eliminar solicitante', { description: error.message });
        },
    });

    // ✅ Funciones auxiliares
    const resetForm = () => {
        setFormData({
            nombre: '',
            estado: '',
            id_ubicacion_sol: '',
        });
        setEditingSolicitante(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSolicitante) {
            updateMutation.mutate({ id: editingSolicitante.id_solicitante, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (solicitante: Solicitante) => {
        setEditingSolicitante(solicitante);
        setFormData({
            nombre: solicitante.nombre,
            estado: solicitante.estado || '',
            id_ubicacion_sol: solicitante.id_ubicacion_sol?.toString() || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este solicitante?')) {
            deleteMutation.mutate(id);
        }
    };

    // ✅ Columnas de la tabla (con campos relacionados)
    const columns: GridColDef[] = [
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200 },
        { field: 'estado', headerName: 'Estado', width: 150 },
        {
            field: 'ubicacion',
            headerName: 'Ubicación',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => {
                const ubicacion = params.row?.Ubicacion_solicitante;
                if (!ubicacion) return 'Sin ubicación';
                return `${ubicacion.municipio}, ${ubicacion.departamento}`;
            },
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
                    onClick={() => handleEdit(params.row)}
                />,
                <GridActionsCellItem
                    icon={<Trash2 size={18} />}
                    label="Eliminar"
                    onClick={() => handleDelete(params.row.id_solicitante)}
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
                        Solicitantes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión de solicitantes registrados
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setDialogOpen(true)}
                >
                    Nuevo Solicitante
                </Button>
            </Box>

            {/* ✅ Tabla */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre o estado..."
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

                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={solicitantes || []}
                        columns={columns}
                        loading={isLoading}
                        getRowId={(row) => row.id_solicitante}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        disableRowSelectionOnClick
                        disableColumnResize
                        sx={{
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        }}
                    />
                </Box>
            </Paper>

            {/* ✅ Diálogo */}
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    resetForm();
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>{editingSolicitante ? 'Editar Solicitante' : 'Nuevo Solicitante'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Nombre"
                                fullWidth
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                label="Estado"
                                fullWidth
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                select
                                label="Ubicación"
                                fullWidth
                                required
                                value={formData.id_ubicacion_sol}
                                onChange={(e) => setFormData({ ...formData, id_ubicacion_sol: e.target.value })}
                                SelectProps={{ native: true }}
                                margin="normal"
                            >
                                <option value=""></option>
                                {/* Aquí deberías mapear tus ubicaciones desde otra query */}
                                {ubicaciones?.map((loc) => (
                                    <option key={loc.id_ubicacion_sol} value={loc.id_ubicacion_sol}>
                                        {loc.municipio} - {loc.departamento}
                                    </option>
                                ))}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => {
                                setDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained">
                            {editingSolicitante ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
