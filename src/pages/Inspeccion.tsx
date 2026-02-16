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
    FormControl,
    Select,
    MenuItem,
    InputLabel,
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
    prestador_nit: string | null;
    prestador_nombre: string | null;
};

type Filtro = "id_inspeccion_sivicap" | "fecha_inspeccion" | "nit" | "prestador";

const normalize = (v: string) => v.trim().replace(/\s+/g, " ");

const toRow = (r: any): InspeccionRow => ({
    id_inspeccion: Number(r.id_inspeccion),
    id_inspeccion_sivicap: r.id_inspeccion_sivicap !== null && r.id_inspeccion_sivicap !== undefined ? String(r.id_inspeccion_sivicap) : null,
    fecha_inspeccion: r.fecha_inspeccion ?? null,
    concepto: r.concepto ?? null,
    iraba_inspeccion: r.iraba_inspeccion !== null && r.iraba_inspeccion !== undefined ? String(r.iraba_inspeccion) : null,
    bps: r.bps !== null && r.bps !== undefined ? String(r.bps) : null,
    id_prestador: r.id_prestador ?? null,
    prestador_nit: r.Prestador?.nit !== null && r.Prestador?.nit !== undefined ? String(r.Prestador.nit) : null,
    prestador_nombre: r.Prestador?.nombre !== null && r.Prestador?.nombre !== undefined ? String(r.Prestador.nombre) : null,
});

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

const InspeccionCard = ({ item, onClick }: { item: InspeccionRow; onClick: () => void }) => {
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
                        {item.prestador_nombre ?? "Sin prestador"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Fecha: {fecha}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        NIT: {item.prestador_nit ?? "---"}
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
    const [filtro, setFiltro] = useState<Filtro>("id_inspeccion_sivicap");
    const [draft, setDraft] = useState("");
    const [appliedFiltro, setAppliedFiltro] = useState<Filtro | null>(null);
    const [appliedValue, setAppliedValue] = useState("");

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);

    const isSearchMode = appliedFiltro !== null && appliedValue.trim().length > 0;

    const { data: listado, isLoading: loadingListado } = useQuery({
        queryKey: ["inspecciones_listado_cards", page, pageSize],
        enabled: !isSearchMode,
        queryFn: async () => {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            const { data, error, count } = await supabase
                .from("inspeccion")
                .select(
                    "id_inspeccion,id_inspeccion_sivicap,fecha_inspeccion,concepto,iraba_inspeccion,bps,id_prestador, Prestador:prestador(nit,nombre)",
                    { count: "exact" }
                )
                .order("fecha_inspeccion", { ascending: false })
                .range(from, to);

            if (error) throw error;

            const rows = ((data ?? []) as any[]).map(toRow);
            return { rows, count: count ?? 0 };
        },
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        keepPreviousData: true as any,
    });

    const { data: searchResult, isLoading: loadingSearch } = useQuery({
        queryKey: ["inspecciones_search_exact", appliedFiltro, appliedValue],
        enabled: isSearchMode,
        queryFn: async () => {
            const value = normalize(appliedValue);

            const base = supabase
                .from("inspeccion")
                .select(
                    "id_inspeccion,id_inspeccion_sivicap,fecha_inspeccion,concepto,iraba_inspeccion,bps,id_prestador, Prestador:prestador(nit,nombre)"
                )
                .order("fecha_inspeccion", { ascending: false });

            if (appliedFiltro === "id_inspeccion_sivicap") {
                const { data, error } = await base.eq("id_inspeccion_sivicap", value);
                if (error) throw error;
                return { rows: ((data ?? []) as any[]).map(toRow), count: (data ?? []).length };
            }

            if (appliedFiltro === "fecha_inspeccion") {
                const { data, error } = await base.eq("fecha_inspeccion", value);
                if (error) throw error;
                return { rows: ((data ?? []) as any[]).map(toRow), count: (data ?? []).length };
            }

            if (appliedFiltro === "nit") {
                const { data: prestadores, error: pErr } = await supabase
                    .from("prestador")
                    .select("id_prestador")
                    .eq("nit", value);

                if (pErr) throw pErr;

                const ids = (prestadores ?? []).map((p: any) => Number(p.id_prestador)).filter((n: any) => Number.isFinite(n));

                if (ids.length === 0) return { rows: [], count: 0 };

                const { data, error } = await base.in("id_prestador", ids);
                if (error) throw error;
                return { rows: ((data ?? []) as any[]).map(toRow), count: (data ?? []).length };
            }

            if (appliedFiltro === "prestador") {
                const { data: prestadores, error: pErr } = await supabase
                    .from("prestador")
                    .select("id_prestador")
                    .ilike("nombre", value);

                if (pErr) throw pErr;

                const ids = (prestadores ?? []).map((p: any) => Number(p.id_prestador)).filter((n: any) => Number.isFinite(n));

                if (ids.length === 0) return { rows: [], count: 0 };

                const { data, error } = await base.in("id_prestador", ids);
                if (error) throw error;
                return { rows: ((data ?? []) as any[]).map(toRow), count: (data ?? []).length };
            }

            return { rows: [], count: 0 };
        },
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const rowsToShow = useMemo(() => {
        if (isSearchMode) return searchResult?.rows ?? [];
        return listado?.rows ?? [];
    }, [isSearchMode, searchResult?.rows, listado?.rows]);

    const loadingMain = isSearchMode ? loadingSearch : loadingListado;

    const totalNormal = listado?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalNormal / pageSize));
    const canPrev = page > 0;
    const canNext = page + 1 < totalPages;

    const applySearch = () => {
        const v = normalize(draft);
        if (!v) return;
        setAppliedFiltro(filtro);
        setAppliedValue(v);
    };

    const clearSearch = () => {
        setDraft("");
        setAppliedFiltro(null);
        setAppliedValue("");
        setPage(0);
    };

    const openDetalle = (id: number) => {
        setSelectedId(id);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedId(null);
    };

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
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const labelFiltro = useMemo(() => {
        if (filtro === "id_inspeccion_sivicap") return "SIVICAP";
        if (filtro === "fecha_inspeccion") return "Fecha inspección";
        if (filtro === "nit") return "NIT prestador";
        return "Nombre prestador";
    }, [filtro]);

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
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>Filtrar por</InputLabel>
                        <Select
                            label="Filtrar por"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value as Filtro)}
                        >
                            <MenuItem value="id_inspeccion_sivicap">ID Inspeccion Sivicap</MenuItem>
                            <MenuItem value="fecha_inspeccion">Fecha Inspeccion</MenuItem>
                            <MenuItem value="nit">NIT prestador</MenuItem>
                            <MenuItem value="prestador">Nombre prestador</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        sx={{ flex: 1, minWidth: 260 }}
                        size="small"
                        placeholder={`Busqueda por ${labelFiltro}...`}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") applySearch();
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button variant="contained" onClick={applySearch} disabled={!draft.trim()}>
                        Buscar
                    </Button>

                    <Button variant="outlined" onClick={clearSearch} disabled={!draft.trim() && !isSearchMode}>
                        Limpiar
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
                {loadingMain ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={1.5} sx={{ p: 1 }}>
                        {rowsToShow.map((ins) => (
                            <InspeccionCard key={ins.id_inspeccion} item={ins} onClick={() => openDetalle(ins.id_inspeccion)} />
                        ))}
                        {rowsToShow.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                                <Typography variant="h6" fontWeight={700}>
                                    Sin resultados
                                </Typography>
                                <Typography variant="body2">Verifica el valor exacto o prueba otro filtro.</Typography>
                            </Box>
                        ) : null}
                    </Stack>
                )}

                {!isSearchMode ? (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, pb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Página {page + 1} de {totalPages} · Total: {totalNormal}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button variant="outlined" disabled={!canPrev || loadingMain} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                                    Anterior
                                </Button>
                                <Button variant="contained" disabled={!canNext || loadingMain} onClick={() => setPage((p) => p + 1)}>
                                    Siguiente
                                </Button>
                            </Box>
                        </Box>
                    </>
                ) : null}
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
