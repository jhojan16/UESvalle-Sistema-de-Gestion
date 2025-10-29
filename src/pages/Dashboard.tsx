import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress
} from '@mui/material';
import { Users, FlaskConical, FileText, Building2 } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [prestadores, muestreos, reportes, laboratorios] = await Promise.all([
        supabase.from('prestador').select('*', { count: 'exact', head: true }),
        supabase.from('muestreo').select('*', { count: 'exact', head: true }),
        supabase.from('reportes').select('*', { count: 'exact', head: true }),
        supabase.from('laboratorio').select('*', { count: 'exact', head: true }),
      ]);

      return {
        prestadores: prestadores.count || 0,
        muestreos: muestreos.count || 0,
        reportes: reportes.count || 0,
        laboratorios: laboratorios.count || 0,
      };
    },
  });

  const cards = [
    {
      title: 'Prestadores',
      value: stats?.prestadores || 0,
      icon: Users,
      color: '#3b82f6',
    },
    {
      title: 'Muestreos',
      value: stats?.muestreos || 0,
      icon: FlaskConical,
      color: '#10b981',
    },
    {
      title: 'Reportes',
      value: stats?.reportes || 0,
      icon: FileText,
      color: '#f59e0b',
    },
    {
      title: 'Laboratorios',
      value: stats?.laboratorios || 0,
      icon: Building2,
      color: '#6b7280',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vista general del sistema
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card key={card.title}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <IconComponent size={20} color={card.color} />
                </Box>
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {card.value}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Bienvenido a UES Valle
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistema de gestión administrativa para la supervisión y control de prestadores de
            servicios de acueducto y alcantarillado en el Valle del Cauca.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
