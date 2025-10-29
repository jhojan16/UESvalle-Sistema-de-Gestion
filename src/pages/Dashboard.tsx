import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      color: 'text-primary',
    },
    {
      title: 'Muestreos',
      value: stats?.muestreos || 0,
      icon: FlaskConical,
      color: 'text-secondary',
    },
    {
      title: 'Reportes',
      value: stats?.reportes || 0,
      icon: FileText,
      color: 'text-accent',
    },
    {
      title: 'Laboratorios',
      value: stats?.laboratorios || 0,
      icon: Building2,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vista general del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a UES Valle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema de gestión administrativa para la supervisión y control de prestadores de
            servicios de acueducto y alcantarillado en el Valle del Cauca.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}