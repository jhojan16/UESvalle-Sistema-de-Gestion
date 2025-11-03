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
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    } from '@mui/material';
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
        direccion: '',
    });

    const queryClient = useQueryClient();

    // ✅ Obtener laboratorios desde Supabase
    const { data: laboratorios, isLoading } = useQuery({
        queryKey: ['laboratorios', search],
        queryFn: async () => {
        let query = supabase
            .from('laboratorio')
            .select(`
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
            `)
            .order('nombre');

        if (search) {
            query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Laboratorio[];
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

    const resetForm = () => {
        setFormData({
        nombre: '',
        estado: '',
        telefono: '',
        email: '',
        direccion: '',
        });
        setEditingLab(null);
    };

    const handleEdit = (lab: Laboratorio) => {
        setEditingLab(lab);
        setFormData({
        nombre: lab.nombre,
        estado: lab.estado || '',
        telefono: lab.telefono || '',
        email: lab.email || '',
        direccion: lab.ubicacion_laboratorio?.direccion || '',
        });
        setDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de eliminar este laboratorio?')) {
        deleteMutation.mutate(id);
        }
    };

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
            <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setDialogOpen(true)}>
            Nuevo Laboratorio
            </Button>
        </Box>

        {/* ✅ Buscador */}
        <Paper sx={{ p: 3, mb: 4 }}>
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
        </Paper>

        {/* ✅ Grid de Tarjetas */}
        <Grid container spacing={3}>
            {isLoading ? (
            <Typography>Cargando laboratorios...</Typography>
            ) : laboratorios && laboratorios.length > 0 ? (
            laboratorios.map((lab) => (
                <Grid item xs={12} sm={6} md={4} key={lab.id_laboratorio}>
                <Card
                    sx={{
                        borderRadius: 3,
                        boxShadow: 1,
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                        transition: 'all 0.2s ease-in-out',
                        height: '100%',
                    }}
                >
                    <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom >
                        {lab.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Estado: {lab.estado || 'No definido'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Teléfono: {lab.telefono || 'Sin teléfono'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Email: {lab.email || 'Sin email'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Ubicación: {lab.ubicacion_laboratorio?.municipio || 'Sin municipio'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Dirección: {lab.ubicacion_laboratorio?.direccion || 'Sin dirección'}
                    </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton color="primary" onClick={() => handleEdit(lab)}>
                        <Edit size={18} />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(lab.id_laboratorio)}>
                        <Trash2 size={18} />
                    </IconButton>
                    </CardActions>
                </Card>
                </Grid>
            ))
            ) : (
            <Typography>No hay laboratorios registrados.</Typography>
            )}
        </Grid>

        {/* ✅ Modal de Edición / Creación */}
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
            <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                <TextField
                label="Nombre"
                fullWidth
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
                <TextField
                label="Estado"
                fullWidth
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                />
                <TextField
                label="Teléfono"
                fullWidth
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
                <TextField
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <TextField
                label="Dirección"
                fullWidth
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                disabled={!editingLab}
                helperText={!editingLab ? 'Solo editable al actualizar' : ''}
                sx={{ gridColumn: '1 / -1' }}
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
        </Dialog>
        </Box>
    );
    }
