import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { Users, FlaskConical, FileText, Building2, BarChart3, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

type DashboardIrcaRow = {
  name: string | null;
  promedio: number | string | null;
};

type DashboardCountRow = {
  name: string | null;
  value: number | string | null;
};

type KpiResumenRow = {
  scope: string | null;
  muestras_total: number | string | null;
  inspecciones_total: number | string | null;
  mapas_total: number | string | null;
  irca_promedio: number | string | null;
  iraba_promedio: number | string | null;
};

type KpiMunicipioRow = {
  municipio: string | null;
  muestras_total: number | string | null;
  inspecciones_total: number | string | null;
  mapas_total: number | string | null;
  irca_promedio: number | string | null;
  iraba_promedio: number | string | null;
};

type KpiTendenciaRow = {
  mes: number | string | null;
  muestras_total: number | string | null;
  inspecciones_total: number | string | null;
  mapas_total: number | string | null;
};

type KpiYearRow = {
  anio: number | string | null;
};

const toSafeNumber = (value: number | string | null | undefined) => {
  const n = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(n as number) ? Number(n) : 0;
};

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  '#6366f1', '#a855f7', '#d946ef', '#0ea5e9', '#22c55e',
];

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

type PieTooltipPayload = {
  name?: string;
  value?: number;
  payload?: {
    total?: number;
  };
};

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('ALL');

  const yearParam = selectedYear === 'ALL' ? undefined : selectedYear;
  const municipioParam = selectedMunicipio === 'ALL' ? undefined : selectedMunicipio;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [prestadores, muestreos, reportes, laboratorios, inspeccion] = await Promise.all([
        supabase.from('prestador').select('*', { count: 'exact', head: true }),
        supabase.from('muestra').select('*', { count: 'exact', head: true }),
        supabase.from('mapa_riesgo').select('*', { count: 'exact', head: true }),
        supabase.from('laboratorio').select('*', { count: 'exact', head: true }),
        supabase.from('inspeccion').select('*', { count: 'exact', head: true }),
      ]);

      return {
        prestadores: prestadores.count || 0,
        muestreos: muestreos.count || 0,
        reportes: reportes.count || 0,
        laboratorios: laboratorios.count || 0,
        inspeccion: inspeccion.count || 0,
      };
    },
  });

  const { data: ircaData, isLoading: isLoadingIrca } = useQuery({
    queryKey: ['irca-promedio-region'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_irca_por_municipio');
      if (error) throw error;

      return ((data ?? []) as DashboardIrcaRow[]).map((row) => ({
        name: row.name || 'No definido',
        promedio: Number(toSafeNumber(row.promedio).toFixed(2)),
      }));
    },
  });

  const { data: ubicacionesData, isLoading: isLoadingUbicaciones } = useQuery({
    queryKey: ['prestadores-ubicaciones'],
    queryFn: async () => {
      const [{ data: departamentosRaw, error: depErr }, { data: municipiosRaw, error: munErr }] = await Promise.all([
        supabase.rpc('dashboard_prestadores_por_departamento'),
        supabase.rpc('dashboard_top_municipios', { p_limit: 10 }),
      ]);

      if (depErr) throw depErr;
      if (munErr) throw munErr;

      const departamentos = ((departamentosRaw ?? []) as DashboardCountRow[]).map((row) => ({
        name: row.name || 'Sin ubicacion',
        value: toSafeNumber(row.value),
      }));

      const municipios = ((municipiosRaw ?? []) as DashboardCountRow[]).map((row) => ({
        name: row.name || 'Sin ubicacion',
        value: toSafeNumber(row.value),
      }));

      return { departamentos, municipios };
    },
  });

  const { data: kpisByMunicipio, isLoading: isLoadingKpisByMunicipio } = useQuery({
    queryKey: ['dashboard-kpis-por-municipio', yearParam],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_kpis_por_municipio', {
        p_anio: yearParam,
      });

      if (error) throw error;

      return ((data ?? []) as KpiMunicipioRow[]).map((row) => ({
        municipio: row.municipio || 'SIN_MUNICIPIO',
        muestras_total: toSafeNumber(row.muestras_total),
        inspecciones_total: toSafeNumber(row.inspecciones_total),
        mapas_total: toSafeNumber(row.mapas_total),
        irca_promedio: Number(toSafeNumber(row.irca_promedio).toFixed(2)),
        iraba_promedio: Number(toSafeNumber(row.iraba_promedio).toFixed(2)),
      }));
    },
  });

  const { data: availableYears } = useQuery({
    queryKey: ['dashboard-kpis-anios'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_kpis_anios_disponibles');
      if (error) {
        console.error('No se pudo obtener anios disponibles para KPI:', error.message);
        return [];
      }

      const years = ((data ?? []) as KpiYearRow[])
        .map((row) => toSafeNumber(row.anio))
        .filter((year) => year > 0);

      return Array.from(new Set(years)).sort((a, b) => b - a);
    },
  });

  const municipioOptions = useMemo(() => {
    const values = (kpisByMunicipio ?? [])
      .map((row) => row.municipio)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => a.localeCompare(b));

    return values;
  }, [kpisByMunicipio]);

  useEffect(() => {
    if (selectedMunicipio === 'ALL') return;
    if (!municipioOptions.includes(selectedMunicipio)) {
      setSelectedMunicipio('ALL');
    }
  }, [municipioOptions, selectedMunicipio]);

  const { data: kpiResumen, isLoading: isLoadingKpiResumen } = useQuery({
    queryKey: ['dashboard-kpis-resumen', yearParam, municipioParam],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_kpis_resumen', {
        p_anio: yearParam,
        p_municipio: municipioParam,
      });

      if (error) throw error;

      const row = ((data ?? []) as KpiResumenRow[])[0];
      return {
        muestras_total: toSafeNumber(row?.muestras_total),
        inspecciones_total: toSafeNumber(row?.inspecciones_total),
        mapas_total: toSafeNumber(row?.mapas_total),
        irca_promedio: Number(toSafeNumber(row?.irca_promedio).toFixed(2)),
        iraba_promedio: Number(toSafeNumber(row?.iraba_promedio).toFixed(2)),
      };
    },
  });

  const trendYear =
    selectedYear === 'ALL'
      ? (availableYears && availableYears.length > 0 ? availableYears[0] : currentYear)
      : selectedYear;

  const { data: kpiTrend, isLoading: isLoadingKpiTrend } = useQuery({
    queryKey: ['dashboard-kpis-tendencia', trendYear, municipioParam],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('dashboard_kpis_tendencia_mensual', {
        p_anio: trendYear,
        p_municipio: municipioParam,
      });

      if (error) throw error;

      return ((data ?? []) as KpiTendenciaRow[]).map((row) => {
        const mes = toSafeNumber(row.mes);
        return {
          mes,
          label: MONTH_NAMES[mes - 1] || `M${mes}`,
          muestras_total: toSafeNumber(row.muestras_total),
          inspecciones_total: toSafeNumber(row.inspecciones_total),
          mapas_total: toSafeNumber(row.mapas_total),
        };
      });
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
      title: 'Muestras',
      value: stats?.muestreos || 0,
      icon: FlaskConical,
      color: '#10b981',
    },
    {
      title: 'Mapa de riesgo',
      value: stats?.reportes || 0,
      icon: FileText,
      color: '#f59e0b',
    },
    {
      title: 'Inspecciones',
      value: stats?.inspeccion || 0,
      icon: Building2,
      color: '#6b7280',
    },
  ];

  const kpiCards = [
    {
      title: 'Muestras (filtro)',
      value: kpiResumen?.muestras_total ?? 0,
      color: '#10b981',
    },
    {
      title: 'Inspecciones (filtro)',
      value: kpiResumen?.inspecciones_total ?? 0,
      color: '#6b7280',
    },
    {
      title: 'Mapas de riesgo (filtro)',
      value: kpiResumen?.mapas_total ?? 0,
      color: '#f59e0b',
    },
    {
      title: 'IRCA promedio',
      value: kpiResumen?.irca_promedio ?? 0,
      color: '#3b82f6',
      suffix: '%',
    },
    {
      title: 'IRABA promedio',
      value: kpiResumen?.iraba_promedio ?? 0,
      color: '#8b5cf6',
    },
  ];

  const renderCustomLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: PieLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    if (percent < 0.05) return null;

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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: PieTooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const value = item.value ?? 0;
      const total = item.payload?.total ?? 0;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

      return (
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight="bold">
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {value} prestadores ({percentage}%)
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
            <Filter size={18} />
            <Typography variant="h6" fontWeight="bold">
              Filtros KPI
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '220px 320px auto' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel id="kpi-year-label">Anio</InputLabel>
              <Select
                labelId="kpi-year-label"
                value={selectedYear}
                label="Anio"
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedYear(value === 'ALL' ? 'ALL' : Number(value));
                }}
              >
                <MenuItem value="ALL">General (todos)</MenuItem>
                {(availableYears && availableYears.length > 0
                  ? availableYears
                  : [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4]
                ).map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="kpi-municipio-label">Municipio</InputLabel>
              <Select
                labelId="kpi-municipio-label"
                value={selectedMunicipio}
                label="Municipio"
                onChange={(event) => setSelectedMunicipio(event.target.value)}
              >
                <MenuItem value="ALL">General (todos)</MenuItem>
                {municipioOptions.map((municipio) => (
                  <MenuItem key={municipio} value={municipio}>
                    {municipio}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setSelectedYear('ALL');
                setSelectedMunicipio('ALL');
              }}
            >
              Restablecer
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        {kpiCards.map((card) => (
          <Card key={card.title}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {card.title}
              </Typography>
              {isLoadingKpiResumen ? (
                <Box sx={{ mt: 1.5 }}>
                  <CircularProgress size={18} />
                </Box>
              ) : (
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }} color={card.color}>
                  {toSafeNumber(card.value).toLocaleString()}
                  {card.suffix || ''}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BarChart3 size={18} />
                <Typography variant="h6" fontWeight="bold">
                  KPI por municipio
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comparativo de muestras, inspecciones y mapas de riesgo (anio seleccionado)
              </Typography>

              {isLoadingKpisByMunicipio ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={(kpisByMunicipio ?? []).slice(0, 12)} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="municipio" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="muestras_total" name="Muestras" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inspecciones_total" name="Inspecciones" fill="#6b7280" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mapas_total" name="Mapas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tendencia mensual ({trendYear})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Evolucion mensual para el filtro actual
              </Typography>

              {isLoadingKpiTrend ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={kpiTrend ?? []} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="muestras_total" name="Muestras" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="inspecciones_total" name="Inspecciones" stroke="#6b7280" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="mapas_total" name="Mapas" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom>
              Bienvenido a UES Valle
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de gestion administrativa para la supervision y control de prestadores de
              servicios de acueducto y alcantarillado en el Valle del Cauca.
            </Typography>
          </CardContent>
        </Card>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                Prestadores por Departamento
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Distribucion geografica a nivel departamental
              </Typography>

              {isLoadingUbicaciones ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : ubicacionesData?.departamentos && ubicacionesData.departamentos.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={ubicacionesData.departamentos.map((item) => ({
                        ...item,
                        total: ubicacionesData.departamentos.reduce((sum, d) => sum + d.value, 0),
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
                      formatter={(value, entry: { payload?: { value?: number } }) =>
                        `${value} (${entry.payload?.value ?? 0})`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
                  No hay datos de ubicacion disponibles
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
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
                      data={ubicacionesData.municipios.map((item) => ({
                        ...item,
                        total: ubicacionesData.municipios.reduce((sum, m) => sum + m.value, 0),
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
                      formatter={(value, entry: { payload?: { value?: number } }) =>
                        `${value} (${entry.payload?.value ?? 0})`
                      }
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

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                Promedio de IRCA por Municipio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Nivel de riesgo promedio detectado en las muestras (0-100)
              </Typography>

              {isLoadingIrca ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={ircaData} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [`${value}%`, 'IRCA Promedio']} cursor={{ fill: '#f3f4f6' }} />
                    <Bar
                      dataKey="promedio"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      label={{ position: 'right', formatter: (v: number | string) => `${v}%`, fontSize: 12 }}
                    >
                      {ircaData?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.promedio > 35 ? '#ef4444' : entry.promedio > 14 ? '#f59e0b' : '#10b981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
