import { useEffect, useMemo, useState } from 'react';
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
import { Edit, Search, ShieldCheck, Trash2, User, Users } from 'lucide-react';
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

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ProfileRow | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('usuario');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<ProfileRow | null>(null);

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
      const { error: updateError } = await supabase.rpc('admin_update_user_role', {
        p_user_id: userId,
        p_role: role,
      });

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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error: deleteError } = await supabase.rpc('admin_delete_user_account', {
        p_user_id: userId,
      });
      if (deleteError) throw deleteError;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] });
      toast.success('Cuenta eliminada correctamente');
      setDeleteDialogOpen(false);
      setDeletingProfile(null);
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : 'Error inesperado';
      toast.error('No se pudo eliminar la cuenta', {
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

  useEffect(() => {
    if (!searchInput.trim() && search) {
      setSearch('');
    }
  }, [searchInput, search]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const openDeleteDialog = (profile: ProfileRow) => {
    setDeletingProfile(profile);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = () => {
    if (!deletingProfile) return;
    deleteUserMutation.mutate(deletingProfile.id);
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
          key={`edit-${String(params.row.id)}`}
          icon={<Edit size={18} />}
          label="Cambiar rol"
          onClick={() => openRoleDialog(params.row)}
        />,
        <GridActionsCellItem
          key={`delete-${String(params.row.id)}`}
          icon={<Trash2 size={18} />}
          label="Eliminar cuenta"
          disabled={params.row.id === user?.id}
          onClick={() => openDeleteDialog(params.row)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <User size={20} />
            <Typography variant="body2" color="text.secondary">
              Usuarios estandar
            </Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            {stats.usuarios}
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 1.5,
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              sx={{ flex: '1 1 auto', minWidth: 0 }}
              placeholder="Buscar por nombre o correo..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              startIcon={<Search size={18} />}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Buscar
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearSearch}
              disabled={!searchInput && !search}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Limpiar
            </Button>
          </Box>
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteUserMutation.isPending && setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta accion eliminara el acceso del usuario al sistema.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            Usuario: {deletingProfile?.nombre || deletingProfile?.email || deletingProfile?.id}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteUserMutation.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteUser}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
