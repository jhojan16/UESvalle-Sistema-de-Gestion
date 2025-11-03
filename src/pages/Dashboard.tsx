import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import { Users, FlaskConical, FileText, Building2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Paleta de colores para los gráficos
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#6366f1', '#a855f7', '#d946ef', '#0ea5e9', '#22c55e'
];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [prestadores, muestreos, reportes, laboratorios] = await Promise.all([
        supabase.from('prestador').select('*', { count: 'exact', head: true }),
        supabase.from('muestreo').select('*', { count: 'exact', head: true }),
        supabase.from('reporte').select('*', { count: 'exact', head: true }),
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

  // Consulta para ubicaciones de prestadores
  const { data: ubicacionesData, isLoading: isLoadingUbicaciones } = useQuery({
    queryKey: ['prestadores-ubicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prestador')
        .select(`
          id_prestador,
          nombre,
          ubicacion:id_ubicacion (
            departamento,
            municipio
          )
        `);

      if (error) throw error;

      // Agrupar por departamento
      const porDepartamento: Record<string, number> = {};
      const porMunicipio: Record<string, number> = {};

      data?.forEach((prestador: any) => {
        const ubicacion = prestador.ubicacion;
        if (ubicacion) {
          // Contar por departamento
          const dept = ubicacion.departamento || 'Sin departamento';
          porDepartamento[dept] = (porDepartamento[dept] || 0) + 1;

          // Contar por municipio
          const mun = ubicacion.municipio || 'Sin municipio';
          porMunicipio[mun] = (porMunicipio[mun] || 0) + 1;
        } else {
          porDepartamento['Sin ubicación'] = (porDepartamento['Sin ubicación'] || 0) + 1;
          porMunicipio['Sin ubicación'] = (porMunicipio['Sin ubicación'] || 0) + 1;
        }
      });

      // Convertir a array para los gráficos
      const departamentos = Object.entries(porDepartamento)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Top 10 municipios
      const municipios = Object.entries(porMunicipio)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      return { departamentos, municipios };
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

  // Componente personalizado para el label del gráfico
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    if (percent < 0.05) return null; // No mostrar labels muy pequeños

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {payload[0].value} prestadores ({((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%)
          </Typography>
        </Paper>
      );
    }
    return null;
  };

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

      {/* Tarjetas de estadísticas */}

      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4
      }}>

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
                    {card.value.toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      

      {/* Gráficos de distribución geográfica */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Tarjeta de bienvenida */}
        <Card
          sx={{ width: '100%' }}>
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
        
        {/* Gráfico por Departamento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                Prestadores por Departamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Distribución geográfica a nivel departamental
              </Typography>

              {isLoadingUbicaciones ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : ubicacionesData?.departamentos && ubicacionesData.departamentos.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={ubicacionesData.departamentos.map(item => ({
                        ...item,
                        total: ubicacionesData.departamentos.reduce((sum, d) => sum + d.value, 0)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ubicacionesData.departamentos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
                  No hay datos de ubicación disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>


        {/* Gráfico por Municipio (Top 10) */}
        <Grid item xs={100} md={6} >
          <Card >
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                Top 10 Municipios
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Municipios con mayor cantidad de prestadores
              </Typography>

              {isLoadingUbicaciones ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : ubicacionesData?.municipios && ubicacionesData.municipios.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={ubicacionesData.municipios.map(item => ({
                        ...item,
                        total: ubicacionesData.municipios.reduce((sum, m) => sum + m.value, 0)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ubicacionesData.municipios.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={150}
                      formatter={(value, entry: any) => `${value} (${entry.payload.value})`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
                  No hay datos de municipios disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        
      </Grid>


    </Box>
  );
}