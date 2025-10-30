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

type Laboratorio = {
    id_laboratorio: number;
    nombre: string;
    estado: string | null;
    telefono: string | null;
    email: string | null;
    id_ubicacion_lab: number | null;
    ubicacion_laboratorio?: {
        municipio: string | null;
        direccion: string | null;
    } | null;
};

export default function Laboratorios() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Laboratorio | null>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        estado: '',
        telefono: '',
        email: '',
        id_ubicacion_lab: '',
    });

    const queryClient = useQueryClient();

    // ✅ Obtener laboratorios desde Supabase
    const { data: laboratorios, isLoading } = useQuery({
        queryKey: ['laboratorios', search],
        queryFn: async () => {
            let query = supabase.from('laboratorio').select(`
            id_laboratorio,
            nombre,
            estado,
            telefono,
            email,
            id_ubicacion_lab,
            ubicacion_laboratorio (
            municipio,
            direccion
            )
        `).order('nombre');

            if (search) {
                query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Laboratorio[];
        },
    });

    // ✅ Crear laboratorio
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { error } = await supabase.from('laboratorio').insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['laboratorios'] });
            toast.success('Laboratorio creado exitosamente');
            setDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al crear laboratorio', { description: error.message });
        },
    });

    // ✅ Actualizar laboratorio
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
            const { error } = await supabase
                .from('laboratorio')
                .update(data)
                .eq('id_laboratorio', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['laboratorios'] });
            toast.success('Laboratorio actualizado exitosamente');
            setDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al actualizar laboratorio', { description: error.message });
        },
    });

    // ✅ Eliminar laboratorio
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('laboratorio').delete().eq('id_laboratorio', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['laboratorios'] });
            toast.success('Laboratorio eliminado exitosamente');
        },
        onError: (error) => {
            toast.error('Error al eliminar laboratorio', { description: error.message });
        },
    });

    // ✅ Funciones auxiliares
    const resetForm = () => {
        setFormData({
            nombre: '',
            estado: '',
            telefono: '',
            email: '',
            id_ubicacion_lab: '',
        });
        setEditingLab(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLab) {
            updateMutation.mutate({ id: editingLab.id_laboratorio, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (lab: Laboratorio) => {
        setEditingLab(lab);
        setFormData({
            nombre: lab.nombre,
            estado: lab.estado || '',
            telefono: lab.telefono || '',
            email: lab.email || '',
            id_ubicacion_lab: lab.id_ubicacion_lab?.toString() || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este laboratorio?')) {
            deleteMutation.mutate(id);
        }
    };

    // ✅ Columnas de la tabla
    const columns: GridColDef[] = [
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200 },
        { field: 'estado', headerName: 'Estado', width: 150 },
        { field: 'telefono', headerName: 'Teléfono', width: 150 },
        { field: 'email', headerName: 'Email', width: 220 },
        {
            field: 'ubicacion',
            headerName: 'Ubicación',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => {
                const ubicacion = params.row?.ubicacion_laboratorio;
                if (!ubicacion) return 'Sin ubicación';
                return `${ubicacion.municipio}, ${ubicacion.direccion}`;
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
                    onClick={() => handleDelete(params.row.id_laboratorio)}
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
                        Laboratorios
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión de laboratorios registrados
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setDialogOpen(true)}
                >
                    Nuevo Laboratorio
                </Button>
            </Box>

            {/* ✅ Tabla */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre, email o teléfono..."
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
                        rows={laboratorios || []}
                        columns={columns}
                        loading={isLoading}
                        getRowId={(row) => row.id_laboratorio}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        disableRowSelectionOnClick
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
                <DialogTitle>{editingLab ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}</DialogTitle>
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
                                label="Teléfono"
                                fullWidth
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                label="Ubicación"
                                fullWidth
                                value={
                                    editingLab?.ubicacion_laboratorio
                                        ? `${editingLab.ubicacion_laboratorio.direccion ?? ''}`
                                        : 'Sin ubicación'
                                }
                                margin="normal"
                                
                            />

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
                            {editingLab ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
