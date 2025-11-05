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
  IconButton,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Prestador = {
  id_prestador: number;
  nombre: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  id_sspd: string | null;
  id_autoridad_sanitaria: string | null;
};

export default function Prestadores() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrestador, setEditingPrestador] = useState<Prestador | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    id_sspd: '',
    id_autoridad_sanitaria: '',
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: prestadores, isLoading } = useQuery({
    queryKey: ['prestadores', search],
    queryFn: async () => {
      let query = supabase.from('prestador').select('*').order('nombre');

      if (search) {
        query = query.or(`nombre.ilike.%${search}%,nit.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Prestador[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('prestador').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador creado exitosamente');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Error al crear prestador', {
        description: error.message
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('prestador')
        .update(data)
        .eq('id_prestador', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador actualizado exitosamente');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Error al actualizar prestador', {
        description: error.message
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('prestador')
        .delete()
        .eq('id_prestador', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar prestador', {
        description: error.message
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      nit: '',
      direccion: '',
      telefono: '',
      id_sspd: '',
      id_autoridad_sanitaria: '',
    });
    setEditingPrestador(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrestador) {
      updateMutation.mutate({ id: editingPrestador.id_prestador, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (prestador: Prestador) => {
    setEditingPrestador(prestador);
    setFormData({
      nombre: prestador.nombre,
      nit: prestador.nit || '',
      direccion: prestador.direccion || '',
      telefono: prestador.telefono || '',
      id_sspd: prestador.id_sspd || '',
      id_autoridad_sanitaria: prestador.id_autoridad_sanitaria || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este prestador?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 0.5 },
    { field: 'nit', headerName: 'NIT', flex: 0.3 },
    { field: 'telefono', headerName: 'Teléfono', flex: 0.3 },
    { field: 'id_sspd', headerName: 'ID SSPD', flex: 0.3 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.3,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Eye size={18} />}
          label="Ver Detalle"
          onClick={() => navigate(`/prestadores/${params.row.id_prestador}`)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<Edit size={18} />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Trash2 size={18} />}
          label="Eliminar"
          onClick={() => handleDelete(params.row.id_prestador)}
        />,
      ],
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Prestadores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de prestadores de servicios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setDialogOpen(true)}
        >
          Nuevo Prestador
        </Button>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o NIT..."
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
        <Box >
          <DataGrid
            rows={prestadores || []}
            columns={columns}
            loading={isLoading}
            getRowId={(row) => row.id_prestador}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            disableRowSelectionOnClick
            disableColumnResize
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              }
            }}
          />
        </Box>
      </Paper>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPrestador ? 'Editar Prestador' : 'Nuevo Prestador'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <TextField
                label="Nombre"
                fullWidth
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                margin="normal"
              />
              <TextField
                label="NIT"
                fullWidth
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
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
                label="ID SSPD"
                fullWidth
                value={formData.id_sspd}
                onChange={(e) => setFormData({ ...formData, id_sspd: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Dirección"
                fullWidth
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                margin="normal"
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                label="ID Autoridad Sanitaria"
                fullWidth
                value={formData.id_autoridad_sanitaria}
                onChange={(e) => setFormData({ ...formData, id_autoridad_sanitaria: e.target.value })}
                margin="normal"
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained">
              {editingPrestador ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
