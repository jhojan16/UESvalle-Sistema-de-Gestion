import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
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
    setLoading(true);
    const { error } = await signUp(email, password, nombre);
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
              <Box component="form" onSubmit={handleSignIn} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Correo Electronico"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
                <TextField
                  label="Contraseña"
                  type={showSignInPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowSignInPassword((prev) => !prev)}
                          aria-label={showSignInPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Iniciando...' : 'Iniciar Sesion'}
                </Button>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => navigate('/reset-password')}
                  sx={{ alignSelf: 'center' }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleSignUp} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                />
                <TextField
                  label="Contraseña"
                  type={showSignUpPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  inputProps={{ minLength: 6 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowSignUpPassword((prev) => !prev)}
                          aria-label={showSignUpPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
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

