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
import { Tecnico } from '@/integrations/supabase/index.ts'

export default function Tecnicos() {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const confirmDelete = (id: number) => {
        setIdToDelete(id);
        setDeleteDialogOpen(true);
    };
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


    // Obtener ubicaciones para el selector
    const { data: ubicaciones } = useQuery({
        queryKey: ['ubicaciones-tec-selector'],
        queryFn: async () => {
            const { data, error } = await supabase.from('ubicacion_tecnico').select('*').order('municipio');
            if (error) throw error;
            return data;
        },
    });

    // Obtener laboratorios para el selector
    const { data: laboratorios } = useQuery({
        queryKey: ['laboratorios-selector'],
        queryFn: async () => {
            const { data, error } = await supabase.from('laboratorio').select('id_laboratorio, nombre').order('nombre');
            if (error) throw error;
            return data;
        },
    });

    const { data: tecnicos, isLoading } = useQuery({
        queryKey: ['tecnicos', search],
        queryFn: async () => {
            // Traemos el técnico y los nombres de sus relaciones en una sola petición
            let query = supabase
                .from('tecnico')
                .select(`
                *,
                laboratorio ( nombre ),
                ubicacion_tecnico ( municipio, departamento )
            `)
                .order('nombre');

            if (search) {
                query = query.or(`nombre.ilike.%${search}%,profesion.ilike.%${search}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
    });

    const preparePayload = (data: typeof formData) => ({
        ...data,
        identificacion: data.identificacion ? parseInt(data.identificacion) : null,
        id_ubicacion_tec: data.id_ubicacion_tec ? parseInt(data.id_ubicacion_tec) : null,
        id_laboratorio: data.id_laboratorio ? parseInt(data.id_laboratorio) : null,
    });

    // ✅ Crear
    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const { error } = await supabase.from('tecnico').insert([preparePayload(data)]);
            if (error) throw error;
        },
        onSuccess: () => handleSuccess('Técnico creado'),
    });

    // ✅ Actualizar
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
            const { error } = await supabase.from('tecnico').update(preparePayload(data)).eq('id_tecnico', id);
            if (error) throw error;
        },
        onSuccess: () => handleSuccess('Técnico actualizado'),
    });

    // Función auxiliar para no repetir el cierre de modales
    const handleSuccess = (message: string) => {
        queryClient.invalidateQueries({ queryKey: ['tecnicos'] });
        toast.success(message);
        setDialogOpen(false);
        resetForm();
    };

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
                    onClick={() => confirmDelete(params.row.id_tecnico)}
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
                        disableColumnResize
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none',
                            },
                        }}
                    />
                </Box>
            </Paper>

            {/* ✅ Diálogo */}
            <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); resetForm(); }} maxWidth="md" fullWidth>
                <DialogTitle>{editingTecnico ? 'Editar Técnico' : 'Nuevo Técnico'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <TextField label="Nombre Completo" required fullWidth value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />

                            <TextField label="Identificación (C.C)" type="number" fullWidth value={formData.identificacion}
                                onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })} />

                            <TextField label="Profesión" fullWidth value={formData.profesion}
                                onChange={(e) => setFormData({ ...formData, profesion: e.target.value })} />

                            <TextField label="Teléfono" fullWidth value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />

                            <TextField label="Email" type="email" fullWidth sx={{ gridColumn: '1 / -1' }} value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

                            {/* SELECTOR DE LABORATORIO */}
                            <TextField select label="Laboratorio" fullWidth required SelectProps={{ native: true }}
                                value={formData.id_laboratorio} onChange={(e) => setFormData({ ...formData, id_laboratorio: e.target.value })}>
                                <option value=""></option>
                                {laboratorios?.map((lab) => (
                                    <option key={lab.id_laboratorio} value={lab.id_laboratorio}>{lab.nombre}</option>
                                ))}
                            </TextField>

                            {/* SELECTOR DE UBICACIÓN */}
                            <TextField select label="Ubicación" fullWidth required SelectProps={{ native: true }}
                                value={formData.id_ubicacion_tec} onChange={(e) => setFormData({ ...formData, id_ubicacion_tec: e.target.value })}>
                                <option value=""></option>
                                {ubicaciones?.map((u) => (
                                    <option key={u.id_ubicacion_tec} value={u.id_ubicacion_tec}>{u.municipio} - {u.departamento}</option>
                                ))}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
                            {editingTecnico ? 'Guardar Cambios' : 'Crear Técnico'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* --- DIÁLOGO DE ELIMINACIÓN --- */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>¿Confirmar eliminación?</DialogTitle>
                <DialogContent>
                    <Typography>Esta acción no se puede deshacer. El técnico será removido permanentemente del sistema.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={() => {
                        if (idToDelete) deleteMutation.mutate(idToDelete);
                        setDeleteDialogOpen(false);
                    }}>Eliminar permanentemente</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
