import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import { Building2, CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const PASSWORD_POLICY = {
  minLength: 8,
  hasLowercase: /[a-z]/,
  hasUppercase: /[A-Z]/,
  hasNumber: /\d/,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Login() {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  const [nombre, setNombre] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = useMemo(
    () => [
      {
        label: `Minimo ${PASSWORD_POLICY.minLength} caracteres`,
        met: signUpPassword.length >= PASSWORD_POLICY.minLength,
      },
      {
        label: 'Al menos 1 letra mayuscula',
        met: PASSWORD_POLICY.hasUppercase.test(signUpPassword),
      },
      {
        label: 'Al menos 1 letra minuscula',
        met: PASSWORD_POLICY.hasLowercase.test(signUpPassword),
      },
      {
        label: 'Al menos 1 numero',
        met: PASSWORD_POLICY.hasNumber.test(signUpPassword),
      },
    ],
    [signUpPassword]
  );

  const fulfilledRequirements = passwordRequirements.filter((rule) => rule.met).length;
  const passwordStrength = (fulfilledRequirements / passwordRequirements.length) * 100;
  const allPasswordRequirementsMet = fulfilledRequirements === passwordRequirements.length;
  const passwordsMatch =
    signUpConfirmPassword.length > 0 && signUpPassword === signUpConfirmPassword;

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(signInEmail, signInPassword);
    if (error) {
      toast.error('Error al iniciar sesion', {
        description: error.message,
      });
    } else {
      toast.success('Bienvenido a UES Valle');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!allPasswordRequirementsMet) {
      toast.error('Verifica los requisitos de la contraseña');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const { error } = await signUp(signUpEmail, signUpPassword, nombre);
    if (error) {
      toast.error('Error al registrarse', {
        description: error.message,
      });
    } else {
      toast.success('Cuenta creada exitosamente');
    }
    setLoading(false);
  };

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
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  mb: 2,
                }}
              >
                <Building2 size={40} />
              </Avatar>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                UES Valle
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema de Gestion Administrativa
              </Typography>
            </Box>

            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="Iniciar Sesion" />
              <Tab label="Registrarse" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box
                component="form"
                onSubmit={handleSignIn}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Correo Electronico"
                  type="email"
                  fullWidth
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
                <TextField
                  label="Contraseña"
                  type={showSignInPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowSignInPassword((prev) => !prev)}
                          aria-label={
                            showSignInPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                          }
                        >
                          {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                  {loading ? 'Iniciando...' : 'Iniciar Sesion'}
                </Button>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => navigate('/reset-password')}
                  sx={{ alignSelf: 'center' }}
                >
                  Olvidaste tu contraseña?
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box
                component="form"
                onSubmit={handleSignUp}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="Nombre Completo"
                  type="text"
                  fullWidth
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan Perez"
                />
                <TextField
                  label="Correo Electronico"
                  type="email"
                  fullWidth
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
                <TextField
                  label="Contraseña"
                  type={showSignUpPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowSignUpPassword((prev) => !prev)}
                          aria-label={
                            showSignUpPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                          }
                        >
                          {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirmar contraseña"
                  type={showSignUpConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  error={signUpConfirmPassword.length > 0 && !passwordsMatch}
                  helperText={
                    signUpConfirmPassword.length > 0 && !passwordsMatch
                      ? 'Las contraseñas no coinciden'
                      : ' '
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowSignUpConfirmPassword((prev) => !prev)}
                          aria-label={
                            showSignUpConfirmPassword
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
                        >
                          {showSignUpConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: -0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Requisitos de contraseña
                    </Typography>
                    <Typography
                      variant="caption"
                      color={allPasswordRequirementsMet ? 'success.main' : 'text.secondary'}
                    >
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={
                    loading ||
                    !nombre.trim() ||
                    !signUpEmail.trim() ||
                    !signUpPassword ||
                    !signUpConfirmPassword ||
                    !allPasswordRequirementsMet ||
                    !passwordsMatch
                  }
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
              </Box>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
