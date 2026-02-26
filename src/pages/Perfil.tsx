import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle2, Circle, Eye, EyeOff, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AppLoader } from '@/components/AppLoader';

interface ProfileRow {
  id: string;
  nombre: string | null;
  email: string | null;
  rol: string | null;
  created_at: string | null;
  updated_at: string | null;
}

type ProfileForm = {
  nombre: string;
  email: string;
};

const PASSWORD_POLICY = {
  minLength: 8,
  hasLowercase: /[a-z]/,
  hasUppercase: /[A-Z]/,
  hasNumber: /\d/,
};

const isSamePasswordError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    message.includes('new password should be different') ||
    message.includes('must be different from the old password') ||
    message.includes('same password')
  );
};

export default function Perfil() {
  const qc = useQueryClient();
  const { user, loading: loadingAuth } = useAuth();

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRequirements = useMemo(
    () => [
      {
        label: `Minimo ${PASSWORD_POLICY.minLength} caracteres`,
        met: passwordData.newPassword.length >= PASSWORD_POLICY.minLength,
      },
      {
        label: 'Al menos 1 letra mayuscula',
        met: PASSWORD_POLICY.hasUppercase.test(passwordData.newPassword),
      },
      {
        label: 'Al menos 1 letra minuscula',
        met: PASSWORD_POLICY.hasLowercase.test(passwordData.newPassword),
      },
      {
        label: 'Al menos 1 numero',
        met: PASSWORD_POLICY.hasNumber.test(passwordData.newPassword),
      },
    ],
    [passwordData.newPassword]
  );

  const fulfilledRequirements = passwordRequirements.filter((rule) => rule.met).length;
  const passwordStrength = (fulfilledRequirements / passwordRequirements.length) * 100;
  const allPasswordRequirementsMet = fulfilledRequirements === passwordRequirements.length;
  const passwordsMatch =
    passwordData.confirmPassword.length > 0 &&
    passwordData.newPassword === passwordData.confirmPassword;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['perfil', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return data as ProfileRow | null;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const initialForm = useMemo<ProfileForm>(() => {
    return {
      nombre: profile?.nombre ?? String(user?.user_metadata?.nombre ?? '').trim(),
      email: profile?.email ?? String(user?.email ?? '').trim(),
    };
  }, [profile, user?.email, user?.user_metadata?.nombre]);

  const [formData, setFormData] = useState<ProfileForm>(initialForm);

  useEffect(() => {
    setFormData(initialForm);
  }, [initialForm]);

  const hasChanges = useMemo(() => {
    return (
      formData.nombre.trim() !== initialForm.nombre.trim() ||
      formData.email.trim() !== initialForm.email.trim()
    );
  }, [formData, initialForm]);

  const saveMutation = useMutation({
    mutationFn: async (payload: ProfileForm) => {
      if (!user?.id) throw new Error('No hay usuario autenticado.');

      const cleanEmail = payload.email.trim();
      const cleanNombre = payload.nombre.trim();

      const { error: upsertError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          nombre: cleanNombre || null,
          email: cleanEmail || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (upsertError) throw upsertError;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['perfil', user?.id] });
      toast.success('Perfil actualizado correctamente');
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error ? mutationError.message : 'Error inesperado';
      toast.error('No se pudo actualizar el perfil', {
        description: message,
      });
    },
  });

  const handleSave = () => {
    if (!formData.email.trim()) {
      toast.error('El correo es obligatorio');
      return;
    }

    saveMutation.mutate(formData);
  };

  const passwordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updatePasswordError) throw updatePasswordError;
    },
    onSuccess: () => {
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      toast.success('Contraseña actualizada correctamente');
    },
    onError: (mutationError: unknown) => {
      if (isSamePasswordError(mutationError)) {
        toast.error('No se puede usar la misma contraseña');
        return;
      }

      toast.error('No se pudo actualizar la contraseña', {
        description: 'verifica los requisitos de la contraseña',
      });
    },
  });

  const handlePasswordChange = () => {
    if (!passwordData.newPassword) {
      toast.error('La nueva contraseña es obligatoria');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!allPasswordRequirementsMet) {
      toast.error('verifica los requisitos de la contraseña');
      return;
    }

    passwordMutation.mutate(passwordData.newPassword);
  };

  if (loadingAuth || isLoading) {
    return <AppLoader message="Cargando perfil..." minHeight={420} />;
  }

  if (!user) {
    return (
      <Alert severity="error">
        No se encontro una sesion activa para cargar el perfil.
      </Alert>
    );
  }

  const role = profile?.rol || 'Sin rol asignado';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta y actualiza tu informacion personal.
        </Typography>
      </Box>

      {error ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No se pudo leer el registro de perfil. Puedes guardar para crear o actualizar tu perfil.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Paper sx={{ p: 3, height: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 2,
              height: '100%',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
              }}
            >
              <UserCircle2 size={36} />
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight="bold">
                {formData.nombre.trim() || 'Usuario'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {user.email}
              </Typography>
            </Box>

            <Chip label={role} color="primary" variant="outlined" />

            <Divider sx={{ width: '80%' }} />

            <Box>
              <Typography variant="caption" color="text.secondary">
                ID de usuario
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {user.id}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Informacion de perfil
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Los cambios se guardan en la tabla profiles.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              disabled={saveMutation.isPending}
            />

            <TextField
              label="Correo"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={saveMutation.isPending}
            />

            <TextField label="Rol" fullWidth value={role} disabled />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setFormData(initialForm)}
              disabled={saveMutation.isPending || !hasChanges}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saveMutation.isPending || !hasChanges}
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Cambiar contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Esta accion actualiza la contraseña de tu cuenta en autenticacion.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Nueva contraseña"
              type={showNewPassword ? 'text' : 'password'}
              fullWidth
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              disabled={passwordMutation.isPending}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              disabled={passwordMutation.isPending}
              error={passwordData.confirmPassword.length > 0 && !passwordsMatch}
              helperText={
                passwordData.confirmPassword.length > 0 && !passwordsMatch
                  ? 'Las contraseñas no coinciden'
                  : ' '
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Requisitos de contraseña
              </Typography>
              <Typography variant="caption" color={allPasswordRequirementsMet ? 'success.main' : 'text.secondary'}>
                {fulfilledRequirements}/{passwordRequirements.length} cumplidos
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              color={allPasswordRequirementsMet ? 'success' : 'primary'}
              sx={{ height: 8, borderRadius: 999, mb: 1.25 }}
            />
            <Box sx={{ display: 'grid', gap: 0.75 }}>
              {passwordRequirements.map((rule) => (
                <Box
                  key={rule.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: rule.met ? 'success.main' : 'text.secondary',
                  }}
                >
                  {rule.met ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  <Typography variant="caption">{rule.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={
                passwordMutation.isPending ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                !allPasswordRequirementsMet ||
                !passwordsMatch
              }
            >
              {passwordMutation.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}


