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
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Prestador } from "@/integrations/supabase/index";

export default function Prestadores() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrestador, setEditingPrestador] = useState<Prestador | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    id_autoridad_sanitaria: '',
    codigo_sistema: '' as string | number,
    codigo_anterior: '' as string | number,
    nombre_sistema: '',
    // Campos de ubicación
    departamento: '',
    municipio: '',
    vereda: '',
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: prestadores, isLoading } = useQuery({
    queryKey: ['prestadores', search],
    queryFn: async () => {
      let query = supabase
        .from('prestador')
        .select('*, ubicacion(*)')
        .order('nombre');

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
      // 1. Crear Ubicación
      const { data: ubicacion, error: ubiError } = await supabase
        .from('ubicacion')
        .insert([{
          departamento: data.departamento,
          municipio: data.municipio,
          vereda: data.vereda || null
        }])
        .select()
        .single();

      if (ubiError) throw ubiError;

      // 2. Crear Prestador
      const { error: prestError } = await supabase.from('prestador').insert([{
        nombre: data.nombre,
        nit: data.nit,
        direccion: data.direccion,
        telefono: data.telefono,
        id_autoridad_sanitaria: data.id_autoridad_sanitaria,
        codigo_sistema: data.codigo_sistema ? Number(data.codigo_sistema) : null,
        codigo_anterior: data.codigo_anterior ? Number(data.codigo_anterior) : null,
        nombre_sistema: data.nombre_sistema,
        id_ubicacion: ubicacion.id_ubicacion
      }]);

      if (prestError) throw prestError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador creado exitosamente');
      setDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, id_ubicacion, data }: { id: number; id_ubicacion: number; data: typeof formData }) => {
      // 1. Actualizar Ubicación
      const { error: ubiError } = await supabase
        .from('ubicacion')
        .update({
          departamento: data.departamento,
          municipio: data.municipio,
          vereda: data.vereda || null
        })
        .eq('id_ubicacion', id_ubicacion);

      if (ubiError) throw ubiError;

      // 2. Actualizar Prestador
      const { error: prestError } = await supabase
        .from('prestador')
        .update({
          nombre: data.nombre,
          nit: data.nit,
          direccion: data.direccion,
          telefono: data.telefono,
          id_autoridad_sanitaria: data.id_autoridad_sanitaria,
          codigo_sistema: data.codigo_sistema ? Number(data.codigo_sistema) : null,
          codigo_anterior: data.codigo_anterior ? Number(data.codigo_anterior) : null,
          nombre_sistema: data.nombre_sistema,
        })
        .eq('id_prestador', id);

      if (prestError) throw prestError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador actualizado exitosamente');
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (prestador: Prestador) => {
      // Nota: Debido a las FK, eliminamos el prestador. 
      // Si la ubicación no se comparte, podrías eliminarla después.
      const { error } = await supabase
        .from('prestador')
        .delete()
        .eq('id_prestador', prestador.id_prestador);
      if (error) throw error;

      if (prestador.id_ubicacion) {
        await supabase.from('ubicacion').delete().eq('id_ubicacion', prestador.id_ubicacion);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Registro eliminado');
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      nit: '',
      direccion: '',
      telefono: '',
      id_autoridad_sanitaria: '',
      codigo_sistema: '',
      codigo_anterior: '',
      nombre_sistema: '',
      departamento: '',
      municipio: '',
      vereda: '',
    });
    setEditingPrestador(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrestador) {
      updateMutation.mutate({
        id: editingPrestador.id_prestador,
        id_ubicacion: editingPrestador.id_ubicacion!,
        data: formData
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (prestador: Prestador) => {
    setEditingPrestador(prestador);
    setFormData({
      nombre: prestador.nombre || '',
      nit: prestador.nit || '',
      direccion: prestador.direccion || '',
      telefono: prestador.telefono || '',
      id_autoridad_sanitaria: prestador.id_autoridad_sanitaria || '',
      codigo_sistema: prestador.codigo_sistema || '',
      codigo_anterior: prestador.codigo_anterior || '',
      nombre_sistema: prestador.nombre_sistema || '',
      departamento: prestador.ubicacion?.departamento || '',
      municipio: prestador.ubicacion?.municipio || '',
      vereda: prestador.ubicacion?.vereda || '',
    });
    setDialogOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'nombre', headerName: 'Nombre', flex: 0.4 },
    { field: 'nit', headerName: 'NIT', flex: 0.2 },
    {
      field: 'municipio',
      headerName: 'Municipio',
      flex: 0.2,
      valueGetter: (params, row) => row.ubicacion?.municipio
    },
    { field: 'nombre_sistema', headerName: 'Sistema', flex: 0.3 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.2,
      getActions: (params) => [
        <GridActionsCellItem
          key={`view-${String(params.row.id_prestador)}`}
          icon={<Eye size={18} />}
          label="Ver Detalle"
          onClick={() => navigate(`/prestadores/${params.row.id_prestador}`)}
        />,
        <GridActionsCellItem
          key={`edit-${String(params.row.id_prestador)}`}
          icon={<Edit size={18} />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key={`delete-${String(params.row.id_prestador)}`}
          icon={<Trash2 size={18} />}
          label="Eliminar"
          onClick={() => {
            if (confirm('¿Eliminar prestador y su ubicación?')) {
              deleteMutation.mutate(params.row);
            }
          }}
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
            Gestión de prestadores y su ubicación geográfica
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => { resetForm(); setDialogOpen(true); }}
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
        <DataGrid
          rows={prestadores || []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id_prestador}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); resetForm(); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPrestador ? 'Editar Prestador' : 'Nuevo Prestador'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography variant="subtitle2" color="primary" gutterBottom>Información General</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
              <TextField label="Nombre del Prestador" fullWidth required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              <TextField label="NIT" fullWidth value={formData.nit} onChange={(e) => setFormData({ ...formData, nit: e.target.value })} />
              <TextField label="Nombre del Sistema" fullWidth value={formData.nombre_sistema} onChange={(e) => setFormData({ ...formData, nombre_sistema: e.target.value })} />
              <TextField label="ID Autoridad Sanitaria" fullWidth value={formData.id_autoridad_sanitaria} onChange={(e) => setFormData({ ...formData, id_autoridad_sanitaria: e.target.value })} />
              <TextField label="Código Sistema" type="number" fullWidth value={formData.codigo_sistema} onChange={(e) => setFormData({ ...formData, codigo_sistema: e.target.value })} />
              <TextField label="Código Anterior" type="number" fullWidth value={formData.codigo_anterior} onChange={(e) => setFormData({ ...formData, codigo_anterior: e.target.value })} />
              <TextField label="Teléfono" fullWidth value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
              <TextField label="Dirección" fullWidth value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
            </Box>

            <Typography variant="subtitle2" color="primary" gutterBottom>Ubicación (Obligatoria)</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <TextField label="Departamento" required fullWidth value={formData.departamento} onChange={(e) => setFormData({ ...formData, departamento: e.target.value })} />
              <TextField label="Municipio" required fullWidth value={formData.municipio} onChange={(e) => setFormData({ ...formData, municipio: e.target.value })} />
              <TextField label="Vereda" fullWidth value={formData.vereda} onChange={(e) => setFormData({ ...formData, vereda: e.target.value })} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setDialogOpen(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingPrestador ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
