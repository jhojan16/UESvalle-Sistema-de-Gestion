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

type Tecnico = {
    id_tecnico: number;
    identificacion: number | null;
    nombre: string;
    telefono: string | null;
    profesion: string | null;
    email: string | null;
    id_ubicacion_tec: number | null;
    id_laboratorio: number | null;
};

export default function Tecnicos() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
    const [formData, setFormData] = useState({
        identificacion: '',
        nombre: '',
        telefono: '',
        profesion: '',
        email: '',
        id_ubicacion_tec: '',
        id_laboratorio: '',
    });

    const queryClient = useQueryClient();

    // ✅ Obtener técnicos desde Supabase
    const { data: tecnicos, isLoading } = useQuery({
        queryKey: ['tecnicos', search],
        queryFn: async () => {
            let query = supabase.from('tecnico').select('*').order('nombre');

            if (search) {
                query = query.or(`nombre.ilike.%${search}%,profesion.ilike.%${search}%,email.ilike.%${search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Tecnico[];
        },
    });

    // ✅ Crear técnico
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { error } = await supabase.from('tecnico').insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tecnicos'] });
            toast.success('Técnico creado exitosamente');
            setDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al crear técnico', { description: error.message });
        },
    });

    // ✅ Actualizar técnico
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
            const { error } = await supabase
                .from('tecnico')
                .update(data)
                .eq('id_tecnico', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tecnicos'] });
            toast.success('Técnico actualizado exitosamente');
            setDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error('Error al actualizar técnico', { description: error.message });
        },
    });

    // ✅ Eliminar técnico
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('tecnico').delete().eq('id_tecnico', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tecnicos'] });
            toast.success('Técnico eliminado exitosamente');
        },
        onError: (error) => {
            toast.error('Error al eliminar técnico', { description: error.message });
        },
    });

    const resetForm = () => {
        setFormData({
            identificacion: '',
            nombre: '',
            telefono: '',
            profesion: '',
            email: '',
            id_ubicacion_tec: '',
            id_laboratorio: '',
        });
        setEditingTecnico(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTecnico) {
            updateMutation.mutate({ id: editingTecnico.id_tecnico, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (tecnico: Tecnico) => {
        setEditingTecnico(tecnico);
        setFormData({
            identificacion: tecnico.identificacion?.toString() || '',
            nombre: tecnico.nombre,
            telefono: tecnico.telefono || '',
            profesion: tecnico.profesion || '',
            email: tecnico.email || '',
            id_ubicacion_tec: tecnico.id_ubicacion_tec?.toString() || '',
            id_laboratorio: tecnico.id_laboratorio?.toString() || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este técnico?')) {
            deleteMutation.mutate(id);
        }
    };

    const columns: GridColDef[] = [
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 200 },
        { field: 'identificacion', headerName: 'Identificación', width: 150 },
        { field: 'profesion', headerName: 'Profesión', width: 180 },
        { field: 'email', headerName: 'Email', width: 220 },
        { field: 'telefono', headerName: 'Teléfono', width: 150 },
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
                    onClick={() => handleDelete(params.row.id_tecnico)}
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
                        Técnicos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestión de técnicos de laboratorio
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setDialogOpen(true)}
                >
                    Nuevo Técnico
                </Button>
            </Box>

            {/* ✅ Tabla */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Buscar por nombre, profesión o email..."
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
                        rows={tecnicos || []}
                        columns={columns}
                        loading={isLoading}
                        getRowId={(row) => row.id_tecnico}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        disableRowSelectionOnClick
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
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
                <DialogTitle>{editingTecnico ? 'Editar Técnico' : 'Nuevo Técnico'}</DialogTitle>
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
                                label="Identificación"
                                fullWidth
                                value={formData.identificacion}
                                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                label="Profesión"
                                fullWidth
                                value={formData.profesion}
                                onChange={(e) => setFormData({ ...formData, profesion: e.target.value })}
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
                                sx={{ gridColumn: '1 / -1' }}
                            />
                            <TextField
                                label="ID Laboratorio"
                                fullWidth
                                value={formData.id_laboratorio}
                                onChange={(e) => setFormData({ ...formData, id_laboratorio: e.target.value })}
                                margin="normal"
                            />
                            <TextField
                                label="ID Ubicación"
                                fullWidth
                                value={formData.id_ubicacion_tec}
                                onChange={(e) => setFormData({ ...formData, id_ubicacion_tec: e.target.value })}
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
                            {editingTecnico ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
