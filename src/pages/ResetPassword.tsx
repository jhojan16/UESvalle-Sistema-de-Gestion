import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  Typography,
  TextField,
} from '@mui/material';
import { CheckCircle2, Circle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLoader } from '@/components/AppLoader';

const PASSWORD_POLICY = {
  minLength: 8,
  hasLowercase: /[a-z]/,
  hasUppercase: /[A-Z]/,
  hasNumber: /\d/,
};

export default function ResetPassword() {
  const navigate = useNavigate();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = useMemo(
    () => [
      {
        label: `Minimo ${PASSWORD_POLICY.minLength} caracteres`,
        met: newPassword.length >= PASSWORD_POLICY.minLength,
      },
      {
        label: 'Al menos 1 letra mayuscula',
        met: PASSWORD_POLICY.hasUppercase.test(newPassword),
      },
      {
        label: 'Al menos 1 letra minuscula',
        met: PASSWORD_POLICY.hasLowercase.test(newPassword),
      },
      {
        label: 'Al menos 1 numero',
        met: PASSWORD_POLICY.hasNumber.test(newPassword),
      },
    ],
    [newPassword]
  );

  const completed = requirements.filter((r) => r.met).length;
  const strength = (completed / requirements.length) * 100;
  const allRequirementsMet = completed === requirements.length;
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setHasSession(!!session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      toast.error('La nueva contraseña es obligatoria');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!allRequirementsMet) {
      toast.error('verifica los requisitos de la contraseña');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error('No se pudo restablecer la contraseña', {
        description: 'verifica los requisitos de la contraseña',
      });
      setSaving(false);
      return;
    }

    await supabase.auth.signOut();
    toast.success('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
    navigate('/login', { replace: true });
  };

  if (checkingSession) {
    return <AppLoader fullScreen message="Validando enlace de recuperación..." />;
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'grid',
                  placeItems: 'center',
                  mb: 2,
                }}
              >
                <KeyRound size={30} color="white" />
              </Box>
              <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
                Restablecer contraseña
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Define tu nueva contraseña para continuar en la plataforma.
              </Typography>
            </Box>

            {!hasSession ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                El enlace de recuperación no es válido o expiró. Solicita uno nuevo desde inicio de sesión.
              </Alert>
            ) : null}

            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Nueva contraseña"
                type={showNewPassword ? 'text' : 'password'}
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={saving || !hasSession}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={saving || !hasSession}
                error={confirmPassword.length > 0 && !passwordsMatch}
                helperText={
                  confirmPassword.length > 0 && !passwordsMatch
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

              <Box sx={{ mt: -0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Requisitos de contraseña
                  </Typography>
                  <Typography variant="caption" color={allRequirementsMet ? 'success.main' : 'text.secondary'}>
                    {completed}/{requirements.length} cumplidos
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={strength}
                  color={allRequirementsMet ? 'success' : 'primary'}
                  sx={{ height: 8, borderRadius: 999, mb: 1.25 }}
                />

                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {requirements.map((rule) => (
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

              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="outlined" onClick={() => navigate('/login')} disabled={saving}>
                  Volver
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpdatePassword}
                  disabled={
                    saving ||
                    !hasSession ||
                    !newPassword ||
                    !confirmPassword ||
                    !allRequirementsMet ||
                    !passwordsMatch
                  }
                >
                  {saving ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
