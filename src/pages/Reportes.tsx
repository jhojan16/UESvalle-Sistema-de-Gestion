    import { useState } from 'react';
    import { useQuery } from '@tanstack/react-query';
    import { supabase } from '@/integrations/supabase/client';
    import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    } from '@mui/material';
    import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    } from 'recharts';

    const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
    '#6366f1', '#a855f7', '#d946ef', '#0ea5e9', '#22c55e'
    ];

    export default function ReportesPorEstado() {
    const [selectedEstado, setSelectedEstado] = useState('Todos');

    // 🔹 Consultar reportes desde Supabase
    const { data: reportes, isLoading } = useQuery({
        queryKey: ['reportes-estado'],
        queryFn: async () => {
        const { data, error } = await supabase
            .from('reporte')
            .select('id_reporte, codigo, estado, fecha_creacion, prestador ( nombre )');
        if (error) throw error;
        return data;
        },
    });

    if (isLoading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
        </Box>
        );
    }

    // 🔹 Agrupar por estado
    const agrupados: Record<string, any[]> = {};
    reportes?.forEach((rep) => {
        const estado = rep.estado || 'Sin estado';
        if (!agrupados[estado]) agrupados[estado] = [];
        agrupados[estado].push(rep);
    });

    // 🔹 Datos para el gráfico
    const dataPie = Object.entries(agrupados).map(([name, arr]) => ({
        name,
        value: arr.length,
    }));

    const total = dataPie.reduce((acc, item) => acc + item.value, 0);

    // 🔹 Tooltip personalizado
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
        const { name, value } = payload[0];
        const percent = ((value / total) * 100).toFixed(1);
        return (
            <Paper sx={{ p: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" fontWeight="bold">
                {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {value} reportes ({percent}%)
            </Typography>
            </Paper>
        );
        }
        return null;
    };

    // 🔹 Filtrar por estado seleccionado
    const estados = ['Todos', ...Object.keys(agrupados)];
    const estadosAMostrar =
        selectedEstado === 'Todos'
        ? Object.entries(agrupados)
        : Object.entries(agrupados).filter(([estado]) => estado === selectedEstado);

    return (
        <Card sx={{ width: '100%', mx: 'auto', mt: 4 }}>
        <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
            Distribución de reportes por estado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cantidad total de reportes clasificados según su estado actual.
            </Typography>

            {dataPie.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
                No hay reportes registrados
            </Typography>
            ) : (
            <>
                {/* 🔸 Gráfico */}
                <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={dataPie}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${((value / total) * 100).toFixed(1)}%)`}
                    >
                        {dataPie.map((entry, index) => (
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
                </Box>

                {/* 🔸 Filtro de estados */}
                <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
                <InputLabel>Filtrar por estado</InputLabel>
                <Select
                    value={selectedEstado}
                    label="Filtrar por estado"
                    onChange={(e) => setSelectedEstado(e.target.value)}
                >
                    {estados.map((estado) => (
                    <MenuItem key={estado} value={estado}>
                        {estado}
                    </MenuItem>
                    ))}
                </Select>
                </FormControl>

                {/* 🔸 Lista filtrada */}
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                {selectedEstado === 'Todos' ? 'Listado de reportes por estado' : `Reportes en estado: ${selectedEstado}`}
                </Typography>

                {estadosAMostrar.map(([estado, items], idx) => (
                <Paper
                    key={estado}
                    sx={{
                    mb: 2,
                    p: 2,
                    borderLeft: `5px solid ${COLORS[idx % COLORS.length]}`,
                    bgcolor: 'background.default',
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    {estado} ({items.length})
                    </Typography>

                    <List dense>
                    {items.map((rep) => (
                        <ListItem key={rep.id_reporte} disablePadding>
                        <ListItemText
                            primary={`Código: ${rep.codigo}`}
                            secondary={
                                <>
                                Fecha: {rep.fecha_creacion || 'Sin fecha'} <br />
                                Prestador: {rep.prestador?.nombre || 'Sin nombre'}
                                </>
                            }
                        />
                        </ListItem>
                    ))}
                    </List>
                </Paper>
                ))}
            </>
            )}
        </CardContent>
        </Card>
    );
    }
