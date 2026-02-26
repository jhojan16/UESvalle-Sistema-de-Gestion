import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Edit, Search, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/AppLoader';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'usuario' | 'administrador';

interface ProfileRow {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'usuario', label: 'Usuario' },
  { value: 'administrador', label: 'Administrador' },
];

export default function AdminUsuarios() {
  const queryClient = useQueryClient();
  const { user, refreshRole } = useAuth();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('usuario');

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['admin-usuarios', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id,nombre,email,rol')
        .order('nombre', { ascending: true });

      if (search.trim()) {
        const escapedSearch = search.trim().replace(/,/g, '');
        query = query.or(`nombre.ilike.%${escapedSearch}%,email.ilike.%${escapedSearch}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      return data as ProfileRow[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ rol: role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;
    },
    onSuccess: async (_, variables) => {
      if (variables.userId === user?.id) {
        await refreshRole();
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success('Rol actualizado correctamente');
      setDialogOpen(false);
      setEditingProfile(null);
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Error inesperado';
      toast.error('No se pudo actualizar el rol', {
        description: message,
      });
    },
  });

  const rows = useMemo(() => profiles ?? [], [profiles]);

  const stats = useMemo(() => {
    const total = rows.length;
    const admins = rows.filter((row) => row.rol?.toLowerCase() === 'administrador').length;
    return {
      total,
      admins,
      usuarios: total - admins,
    };
  }, [rows]);

  const openRoleDialog = (profile: ProfileRow) => {
    setEditingProfile(profile);
    setNewRole(profile.rol?.toLowerCase() === 'administrador' ? 'administrador' : 'usuario');
    setDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!editingProfile) return;

    const currentRole = editingProfile.rol?.toLowerCase() === 'administrador' ? 'administrador' : 'usuario';
    if (currentRole === newRole) {
      setDialogOpen(false);
      return;
    }

    updateRoleMutation.mutate({ userId: editingProfile.id, role: newRole });
  };

  const columns: GridColDef[] = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 0.35,
      valueGetter: (_, row) => row.nombre || 'Sin nombre',
    },
    {
      field: 'email',
      headerName: 'Correo',
      flex: 0.4,
      valueGetter: (_, row) => row.email || 'Sin correo',
    },
    {
      field: 'rol',
      headerName: 'Rol',
      flex: 0.2,
      renderCell: (params) => {
        const isAdminRole = params.row.rol?.toLowerCase() === 'administrador';
        return (
          <Chip
            size="small"
            label={isAdminRole ? 'Administrador' : 'Usuario'}
            color={isAdminRole ? 'secondary' : 'default'}
            variant={isAdminRole ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 0.2,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit size={18} />}
          label="Cambiar rol"
          onClick={() => openRoleDialog(params.row)}
        />,
      ],
    },
  ];

  if (isLoading) {
    return <AppLoader message="Cargando usuarios..." minHeight={420} />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Administracion de usuarios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta usuarios y gestiona su rol dentro del sistema.
          </Typography>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          No se pudo cargar la informacion de usuarios. Verifica las politicas de acceso de la tabla profiles.
        </Alert>
      ) : null}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Users size={20} />
            <Typography variant="body2" color="text.secondary">
              Total usuarios
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {stats.total}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldCheck size={20} />
            <Typography variant="body2" color="text.secondary">
              Administradores
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {stats.admins}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Usuarios estandar
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {stats.usuarios}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
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
          rows={rows}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          autoHeight
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => !updateRoleMutation.isPending && setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cambiar rol</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Usuario: {editingProfile?.nombre || editingProfile?.email || editingProfile?.id}
          </Typography>

          {editingProfile?.id === user?.id ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Estas modificando tu propio rol.
            </Alert>
          ) : null}

          <TextField
            select
            fullWidth
            label="Rol"
            value={newRole}
            onChange={(event) => setNewRole(event.target.value as UserRole)}
            disabled={updateRoleMutation.isPending}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={updateRoleMutation.isPending}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveRole} disabled={updateRoleMutation.isPending}>
            {updateRoleMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
