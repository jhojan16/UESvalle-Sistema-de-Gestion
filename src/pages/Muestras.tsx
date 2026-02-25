import { useMemo, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  Chip,
  Divider,
  Stack,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Grid } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Search, Eye, X } from "lucide-react";
import { MuestraCompleta } from "@/integrations/supabase/index";

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

const CONFIG_CAMPOS = {
  general: [
    { label: "ID Muestra", key: "id_muestra", md: 3 },
    { label: "Nº Muestra", key: "muestra_no", md: 3},
    { label: "Contramuestra", key: "contramuestra_pp", md: 3},
    { label: "IRCA", key: "irca", md: 3 },
    { label: "IRCA Básico", key: "irca_basico", md: 3 },
    { label: "IRCA Especial", key: "irca_especial", md: 3 },
    { label: "Fecha Toma", key: "fecha_toma", md: 3 },
    { label: "Nivel de Riesgo", key: "nivel_riesgo", md: 3 },
    { label: "Recepción Lab", key: "fecha_recepcion_lab", md:   3},
    { label: "Análisis Lab", key: "fecha_analisis_lab", md: 3 },
    { label: "Resultados para", key: "resultados_para", md: 3 },
    { label: "Tipo Muestra", key: "tipo_muestra", md:3 },
    { label: "Código Lab", key: "codigo_laboratorio", md: 3 },
    { label: "Desinfectante", key: "desinfectante", md: 3 },
    { label: "Coagulante", key: "coagulante", md: 6 },
    { label: "Análisis Solicitados", key: "analisis_solicitados", md: 6 },
    { label: "Observaciones", key: "observaciones", md: 12 },
    { label: "Nota", key: "nota", md: 12 },
  ],
  punto: [
    { label: "Nombre", key: "nombre", md: 3 },
    { label: "Municipio", key: "departamento", md: 3 },
    { label: "Dirección", key: "municipio", md: 3 },
    { label: "Vereda", key: "vereda", md: 3 },
    { label: "Dirección Exacta", key: "direccion", md: 6 },
    { label: "Descripción", key: "descripcion", md: 6 },
  ],
  prestador: [
    { label: "Nombre", key: "nombre", md: 4 },
    { label: "NIT", key: "nit", md: 2 },
    { label: "Dirección", key: "direccion", md: 2 },
    { label: "Nombre Sistema", key: "nombre_sistema", md: 2 },
    { label: "Código Sistema", key: "codigo_sistema", md: 2 },
  ],
  laboratorio: [
    { label: "Nombre", key: "nombre", md: 6 },
    { label: "Estado", key: "estado", md: 3 },
    { label: "Teléfono", key: "telefono", md: 3 },
  ],
};

type MuestraRow = {
  id_muestra: number;
  muestra_no: string | null;
  fecha_toma: string | null;
  tipo_muestra: string | null;
  irca: number | null;
  id_prestador: number | null;
};

type Filtro = "muestra_no" | "nit" | "fecha_toma";

const normalize = (v: string) => v.trim().replace(/\s+/g, " ");

export default function VistaAnalisisMuestras() {
  const [filtro, setFiltro] = useState<Filtro>("muestra_no");
  const [draft, setDraft] = useState("");
  const [appliedFiltro, setAppliedFiltro] = useState<Filtro | null>(null);
  const [appliedValue, setAppliedValue] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  const isSearchMode = appliedFiltro !== null && appliedValue.trim().length > 0;

  const { data: listado, isLoading: loadingListado, isFetching: fetchingListado } = useQuery({
    queryKey: ["muestras_listado", paginationModel.page, paginationModel.pageSize],
    enabled: !isSearchMode,
    queryFn: async () => {
      const from = paginationModel.page * paginationModel.pageSize;
      const to = from + paginationModel.pageSize - 1;

      const { data, error, count } = await supabase
        .from("muestra")
        .select("id_muestra,muestra_no,fecha_toma,tipo_muestra,irca,id_prestador", { count: "exact" })
        .order("fecha_toma", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { rows: (data as MuestraRow[]) ?? [], count: count ?? 0 };
    },
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const { data: searchResult, isLoading: loadingSearch } = useQuery({
    queryKey: ["muestras_search_exact", appliedFiltro, appliedValue],
    enabled: isSearchMode,
    queryFn: async () => {
      const value = normalize(appliedValue);

      const base = supabase
        .from("muestra")
        .select("id_muestra,muestra_no,fecha_toma,tipo_muestra,irca,id_prestador")
        .order("fecha_toma", { ascending: false });

      if (appliedFiltro === "muestra_no") {
        const { data, error } = await base.eq("muestra_no", value);
        if (error) throw error;
        return { rows: (data as MuestraRow[]) ?? [], count: (data ?? []).length };
      }

      if (appliedFiltro === "fecha_toma") {
        const { data, error } = await base.eq("fecha_toma", value);
        if (error) throw error;
        return { rows: (data as MuestraRow[]) ?? [], count: (data ?? []).length };
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
        return { rows: (data as MuestraRow[]) ?? [], count: (data ?? []).length };
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

  const loadingMain = isSearchMode ? loadingSearch : loadingListado || fetchingListado;

  const columns: GridColDef[] = [
    {
      field: "muestra_no",
      headerName: "Nº Muestra",
      flex: 1,
      minWidth: 120,
      renderCell: (p) => (
        <Chip label={p.value || "Sin número"} color="primary" size="small" variant="outlined" />
      ),
    },
    {
      field: "fecha_toma",
      headerName: "Fecha Toma",
      flex: 1,
      minWidth: 130,
      renderCell: (p) => (p.value ?? "-"),
    },
    { field: "tipo_muestra", headerName: "Tipo muestra", flex: 1, minWidth: 140 },
    { field: "irca", headerName: "IRCA", flex: 0.5, minWidth: 90 },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 110,
      getActions: (p) => [
        <GridActionsCellItem
          icon={<Eye size={20} />}
          label="Ver Detalles"
          onClick={() => {
            setSelectedId(p.row.id_muestra);
            setDialogOpen(true);
          }}
        />,
      ],
    },
  ];

  const analisisColumns: GridColDef[] = [
    { field: "caracteristica", headerName: "Característica", flex: 1.5 },
    { field: "resultado", headerName: "Resultado", flex: 1 },
    { field: "unidades", headerName: "Unidades", flex: 1 },
    { field: "valores_aceptados", headerName: "Límite Normativo", flex: 1 },
    { field: "metodo", headerName: "Método", flex: 1 },
    { field: "diagnostico", headerName: "Diagnóstico", flex: 1 },
  ];

  const { data: detalle, isLoading: loadingDetalle } = useQuery({
    queryKey: ["muestra_detalle", selectedId],
    enabled: !!selectedId && dialogOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("muestra")
        .select("*, prestador(*), laboratorio(nombre, estado, telefono), punto_muestreo(*), analisis_muestra(*)")
        .eq("id_muestra", selectedId)
        .maybeSingle();

      if (error) throw error;
      return data as MuestraCompleta | null;
    },
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedId(null);
  };

  const applySearch = () => {
    const v = normalize(draft);
    if (!v) return;
    setAppliedFiltro(filtro);
    setAppliedValue(v);
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

  const clearSearch = () => {
    setDraft("");
    setAppliedFiltro(null);
    setAppliedValue("");
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

  const labelFiltro = useMemo(() => {
    if (filtro === "muestra_no") return "Nº Muestra";
    if (filtro === "nit") return "NIT";
    return "Fecha toma";
  }, [filtro]);

  const totalNormalRef = useRef(0);
  const totalNormal = useMemo(() => {
    if (typeof listado?.count === "number") totalNormalRef.current = listado.count;
    return totalNormalRef.current;
  }, [listado?.count]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Análisis de Muestras
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión y consulta de calidad del agua
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Filtrar por</InputLabel>
            <Select label="Filtrar por" value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)}>
              <MenuItem value="muestra_no">Número de Muestra</MenuItem>
              <MenuItem value="nit">NIT</MenuItem>
              <MenuItem value="fecha_toma">Fecha</MenuItem>
            </Select>
          </FormControl>

          <TextField
            sx={{ flex: 1, minWidth: 260 }}
            size="small"
            placeholder={`Valor exacto para ${labelFiltro}...`}
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

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={rowsToShow}
          columns={columns}
          loading={loadingMain}
          getRowId={(row) => row.id_muestra}
          paginationMode={isSearchMode ? "client" : "server"}
          rowCount={isSearchMode ? rowsToShow.length : totalNormal}
          paginationModel={paginationModel}
          onPaginationModelChange={(m) => {
            if (isSearchMode) {
              setPaginationModel((p) => ({ ...p, page: m.page, pageSize: m.pageSize }));
              return;
            }
            setPaginationModel((p) => (p.page === m.page && p.pageSize === m.pageSize ? p : m));
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ minHeight: 400, border: "none" }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Detalles del Análisis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Muestra: {detalle?.muestra_no || "Sin número"}
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
                {CONFIG_CAMPOS.general.map((f) => (
                  <InfoField key={f.label} label={f.label} value={detalle[f.key as keyof MuestraCompleta]} md={f.md} />
                ))}
              </InfoSection>

              <InfoSection title="Resultados de Laboratorio por Parámetro">
                <Box sx={{ height: 350, width: "100%" }}>
                  <DataGrid
                    rows={detalle.analisis_muestra || []}
                    columns={analisisColumns}
                    getRowId={(row) => row.id_analisis_muestra}
                    density="compact"
                    disableRowSelectionOnClick
                    hideFooterSelectedRowCount
                  />
                </Box>
              </InfoSection>

              <InfoSection title="Punto de Muestreo">
                {CONFIG_CAMPOS.punto.map((f) => (
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={detalle.punto_muestreo?.[f.key as keyof typeof detalle.punto_muestreo]}
                    md={f.md}
                  />
                ))}
              </InfoSection>

              <InfoSection title="Prestador">
                {CONFIG_CAMPOS.prestador.map((f) => (
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={detalle.prestador?.[f.key as keyof typeof detalle.prestador]}
                    md={f.md}
                  />
                ))}
              </InfoSection>

              <InfoSection title="Laboratorio">
                {CONFIG_CAMPOS.laboratorio.map((f) => (
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={detalle.laboratorio?.[f.key as keyof typeof detalle.laboratorio]}
                    md={f.md}
                  />
                ))}
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
