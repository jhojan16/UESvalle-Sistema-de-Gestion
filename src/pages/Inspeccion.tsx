import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Divider,
    Stack,
    Button,
    Chip,
} from "@mui/material";
import { Grid } from "@mui/material";
import { Search, Eye, X } from "lucide-react";
import { InspeccionBase } from "@/integrations/supabase/index";

type InspeccionRow = {
    id_inspeccion: number;
    id_inspeccion_sivicap: string | null;
    fecha_inspeccion: string | null;
    concepto: string | null;
    iraba_inspeccion: string | null;
    bps: string | null;
    id_prestador: number | null;
};

const InfoField = ({ label, value, md = 3 }: { label: string; value: any; md?: number }) => (
    <Grid size={{ xs: 12, md }}>
        <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.primary" sx={{ display: "block", fontWeight: 500, textTransform: "uppercase" }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ minHeight: "1.5em" }}>
                {value ?? (
                    <Typography component="span" variant="body2" color="text.secondary">
                        No registrado
                    </Typography>
                )}
            </Typography>
        </Box>
    </Grid>
);

const InfoSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: "primary.main" }}>
            {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
            {children}
        </Grid>
    </Paper>
);

const InspeccionCard = ({
    item,
    onClick,
}: {
    item: InspeccionRow;
    onClick: () => void;
}) => {
    const fecha = item.fecha_inspeccion ? new Date(item.fecha_inspeccion).toLocaleDateString("es-CO") : "-";

    return (
        <Paper
            variant="outlined"
            onClick={onClick}
            sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                transition: "transform .08s ease, box-shadow .08s ease, border-color .08s ease",
                "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 2,
                    borderColor: "primary.main",
                },
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={800} color="primary">
                        SIVICAP #{item.id_inspeccion_sivicap ?? "---"}
                    </Typography>
                    <Typography variant="h6" fontWeight={800} noWrap sx={{ mt: 0.5 }}>
                        {item.concepto ?? "Sin concepto"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Fecha: {fecha}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label={`IRABA: ${item.iraba_inspeccion ?? "-"}`} size="small" variant="outlined" />
                    <Chip label={`BPS: ${item.bps ?? "-"}`} size="small" variant="outlined" />
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "grey.50",
                        }}
                    >
                        <Eye size={18} />
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default function VistaInspeccionesCards() {
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);

    const { data: listado, isLoading: loadingListado } = useQuery({
        queryKey: ["inspecciones_listado_cards", page, pageSize],
        queryFn: async () => {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from("inspeccion")
                .select("id_inspeccion,id_inspeccion_sivicap,fecha_inspeccion,concepto,iraba_inspeccion,bps,id_prestador", { count: "exact" })
                .order("fecha_inspeccion", { ascending: false })
                .range(from, to);

            if (error) throw error;

            const rows = ((data ?? []) as any[]).map((r) => ({
                id_inspeccion: r.id_inspeccion,
                id_inspeccion_sivicap: r.id_inspeccion_sivicap ? String(r.id_inspeccion_sivicap) : null,
                fecha_inspeccion: r.fecha_inspeccion ?? null,
                concepto: r.concepto ?? null,
                iraba_inspeccion: r.iraba_inspeccion ? String(r.iraba_inspeccion) : null,
                bps: r.bps ? String(r.bps) : null,
                id_prestador: r.id_prestador ?? null,
            })) as InspeccionRow[];

            return { rows, count: count ?? 0 };
        },
        staleTime: 60 * 1000,
        keepPreviousData: true as any,
    });

    const { data: detalle, isLoading: loadingDetalle } = useQuery({
        queryKey: ["inspeccion_detalle_cards", selectedId],
        enabled: !!selectedId && dialogOpen,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inspeccion")
                .select("*, Prestador:prestador (*)")
                .eq("id_inspeccion", selectedId)
                .maybeSingle();

            if (error) throw error;
            return data as InspeccionBase | null;
        },
        staleTime: 60 * 1000,
    });

    const filteredRows = useMemo(() => {
        const rows = listado?.rows ?? [];
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const a = (r.id_inspeccion_sivicap ?? "").toLowerCase().includes(q);
            const b = (r.fecha_inspeccion ?? "").toLowerCase().includes(q);
            const c = (r.concepto ?? "").toLowerCase().includes(q);
            const d = (r.iraba_inspeccion ?? "").toLowerCase().includes(q);
            const e = (r.bps ?? "").toLowerCase().includes(q);
            return a || b || c || d || e;
        });
    }, [listado?.rows, search]);

    const total = listado?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const canPrev = page > 0;
    const canNext = page + 1 < totalPages;

    const openDetalle = (id: number) => {
        setSelectedId(id);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedId(null);
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Inspecciones Sanitarias
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Consulta y gestión de inspecciones
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar por SIVICAP, fecha, concepto, IRABA o BPS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} />
                            </InputAdornment>
                        ),
                    }}
                    helperText={`${filteredRows.length} registros en esta página`}
                />
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
                {loadingListado ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={1.5} sx={{ p: 1 }}>
                        {filteredRows.map((ins) => (
                            <InspeccionCard key={ins.id_inspeccion} item={ins} onClick={() => openDetalle(ins.id_inspeccion)} />
                        ))}
                        {filteredRows.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                                <Typography variant="h6" fontWeight={700}>Sin resultados</Typography>
                                <Typography variant="body2">Prueba con otro criterio de búsqueda.</Typography>
                            </Box>
                        ) : null}
                    </Stack>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Página {page + 1} de {totalPages} · Total: {total}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant="outlined" disabled={!canPrev || loadingListado} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                            Anterior
                        </Button>
                        <Button variant="contained" disabled={!canNext || loadingListado} onClick={() => setPage((p) => p + 1)}>
                            Siguiente
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xl" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Detalle de Inspección
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                SIVICAP: {detalle?.id_inspeccion_sivicap ?? "---"}
                            </Typography>
                        </Box>
                        <IconButton onClick={closeDialog}>
                            <X />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    {loadingDetalle ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                            <CircularProgress />
                        </Box>
                    ) : detalle ? (
                        <Box sx={{ py: 1 }}>
                            <InfoSection title="Información General">
                                <InfoField label="Fecha Inspección" value={detalle.fecha_inspeccion} md={3} />
                                <InfoField label="Autoridad" value={detalle.autoridad_inspeccion} md={3} />
                                <InfoField label="Concepto" value={detalle.concepto} md={3} />
                                <InfoField label="Estado" value={detalle.estado} md={3} />
                                <InfoField label="IRABA" value={detalle.iraba_inspeccion} md={3} />
                                <InfoField label="BPS" value={detalle.bps} md={3} />
                                <InfoField label="Índice Tratamiento" value={detalle.indice_tratamiento} md={3} />
                                <InfoField label="Índice Continuidad" value={detalle.indice_continuidad} md={3} />
                                <InfoField label="Habitantes" value={detalle.habitantes_municipio} md={3} />
                                <InfoField label="Viviendas" value={detalle.viviendas} md={3} />
                                <InfoField label="Viviendas Urbano" value={detalle.viviendas_urbano} md={3} />
                                <InfoField label="Plan Mejoramiento" value={detalle.plan_mejoramiento} md={6} />
                            </InfoSection>

                            <InfoSection title="Prestador">
                                <InfoField label="Nombre" value={(detalle as any).Prestador?.nombre} md={6} />
                                <InfoField label="NIT" value={(detalle as any).Prestador?.nit} md={3} />
                                <InfoField label="Código Sistema" value={(detalle as any).Prestador?.codigo_sistema} md={3} />
                                <InfoField label="Nombre Sistema" value={(detalle as any).Prestador?.nombre_sistema} md={6} />
                                <InfoField label="Dirección" value={(detalle as any).Prestador?.direccion} md={6} />
                            </InfoSection>
                        </Box>
                    ) : (
                        <Stack sx={{ py: 6 }} spacing={1} alignItems="center">
                            <Typography variant="body1">No se pudo cargar el detalle.</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Intenta nuevamente.
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
