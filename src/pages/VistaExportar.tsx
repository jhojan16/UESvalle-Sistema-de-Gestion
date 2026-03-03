import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Database, Eye, FileDown } from "lucide-react";

type ExportTipo = "muestra" | "inspeccion" | "mapa_riesgo";

type PrestadorOption = {
  id_prestador: number;
  nombre: string | null;
  nit: string | null;
  nombre_sistema: string | null;
};

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQ && next === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }

  out.push(cur);
  return out;
}

export default function ExportarVista() {
  const [tipo, setTipo] = useState<ExportTipo>("muestra");
  const [loading, setLoading] = useState(false);
  const [previewColumns, setPreviewColumns] = useState<GridColDef[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [hasLoadedPreview, setHasLoadedPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [prestadores, setPrestadores] = useState<PrestadorOption[]>([]);
  const [selectedPrestadores, setSelectedPrestadores] = useState<PrestadorOption[]>([]);
  const [loadingPrestadores, setLoadingPrestadores] = useState(false);
  const [prestadorErrorMsg, setPrestadorErrorMsg] = useState("");
  const [selectionError, setSelectionError] = useState("");

  const fnUrl = useMemo(() => {
    const base = import.meta.env.VITE_SUPABASE_URL;
    return base ? `${String(base).replace(/\/$/, "")}/functions/v1/export_csv_full` : "";
  }, []);

  const canRunExport =
    !loading &&
    !loadingPrestadores &&
    selectedPrestadores.length > 0 &&
    selectedPrestadores.length <= 10 &&
    !prestadorErrorMsg;

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? "";
  };

  useEffect(() => {
    let active = true;

    const fetchPrestadores = async () => {
      setLoadingPrestadores(true);

      const { data, error } = await supabase
        .from("prestador")
        .select("id_prestador,nombre,nit,nombre_sistema")
        .order("nombre", { ascending: true });

      if (!active) return;

      if (error) {
        setPrestadorErrorMsg(`No se pudieron cargar prestadores: ${error.message}`);
        setPrestadores([]);
      } else {
        setPrestadorErrorMsg("");
        setPrestadores((data ?? []) as PrestadorOption[]);
      }

      setLoadingPrestadores(false);
    };

    fetchPrestadores();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setHasLoadedPreview(false);
    setPreviewColumns([]);
    setPreviewRows([]);
  }, [tipo, selectedPrestadores]);

  const parseCsvToGrid = (csvText: string) => {
    const normalizedCsv = csvText.replace(/^\uFEFF/, "");
    const lines = normalizedCsv.split(/\r\n|\n|\r/).filter((x) => x.trim().length > 0);

    if (lines.length === 0) {
      setPreviewColumns([]);
      setPreviewRows([]);
      setHasLoadedPreview(true);
      return;
    }

    const rawHeaders = splitCsvLine(lines[0]).map((h) => h.trim());
    const sanitize = (s: string) => s.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    const hiddenPreviewHeaders = new Set(["row_cell_id", "id_prestador"]);

    const headers = rawHeaders
      .map((h, i) => ({ sourceIndex: i, key: sanitize(h) || `col_${i}`, label: h }))
      .filter((h) => !hiddenPreviewHeaders.has(h.label.toLowerCase()));

    const dataLines = lines.slice(1, 21);
    const rows = dataLines.map((line, idx) => {
      const cells = splitCsvLine(line);
      const obj: Record<string, string | number> = { id: idx };
      headers.forEach((h) => {
        obj[h.key] = (cells[h.sourceIndex] ?? "").toString();
      });
      return obj as Record<string, string>;
    });

    const columns: GridColDef[] = headers.map((h) => ({
      field: h.key,
      headerName: h.label,
      flex: 1,
      minWidth: 160,
    }));

    setPreviewColumns(columns);
    setPreviewRows(rows);
    setHasLoadedPreview(true);
  };

  const callExport = async (preview: boolean) => {
    setErrorMsg("");

    if (!fnUrl) throw new Error("No se encontro VITE_SUPABASE_URL.");

    const token = await getToken();
    if (!token) throw new Error("Sesion invalida. Inicia sesion nuevamente.");

    if (selectedPrestadores.length === 0) {
      throw new Error("Debes seleccionar al menos 1 prestador.");
    }
    if (selectedPrestadores.length > 10) {
      throw new Error("Solo puedes seleccionar hasta 10 prestadores.");
    }

    const res = await fetch(fnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        preview,
        tipo,
        prestador_ids: selectedPrestadores.map((p) => p.id_prestador),
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Error HTTP ${res.status}`);
    }

    return await res.text();
  };

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const csvText = await callExport(true);
      parseCsvToGrid(csvText);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Error inesperado en vista previa.");
      setPreviewColumns([]);
      setPreviewRows([]);
      setHasLoadedPreview(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const csvText = await callExport(false);
      const csvWithBom = `\uFEFF${csvText.replace(/^\uFEFF/, "")}`;
      const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exportacion_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Error inesperado al descargar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Exportar datos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Filtra por tipo y selecciona hasta 10 prestadores para exportar informacion.
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "flex-start" }}
          >
            <FormControl size="small" sx={{ minWidth: { lg: 220 }, maxWidth: { lg: 260 } }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as ExportTipo)}
                disabled={loading}
              >
                <MenuItem value="muestra">Muestra</MenuItem>
                <MenuItem value="inspeccion">Inspeccion</MenuItem>
                <MenuItem value="mapa_riesgo">Mapa de riesgo</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              size="small"
              options={prestadores}
              value={selectedPrestadores}
              loading={loadingPrestadores}
              filterSelectedOptions
              isOptionEqualToValue={(a, b) => a.id_prestador === b.id_prestador}
              getOptionLabel={(o) => `${o.nombre ?? "Sin nombre"} (${o.nit ?? "Sin NIT"})`}
              onChange={(_, value) => {
                if (value.length > 10) {
                  setSelectionError("Maximo 10 prestadores.");
                  setSelectedPrestadores(value.slice(0, 10));
                  return;
                }

                setSelectionError("");
                setSelectedPrestadores(value);
              }}
              sx={{ flex: 1, minWidth: { lg: 420 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Prestadores (max. 10)"
                  placeholder="Buscar por nombre o NIT"
                  error={Boolean(selectionError || prestadorErrorMsg)}
                  helperText={selectionError || prestadorErrorMsg || `${selectedPrestadores.length}/10 seleccionados`}
                />
              )}
            />

            <Stack direction={{ xs: "row", lg: "column" }} spacing={1} sx={{ minWidth: { lg: 190 } }}>
              <Button
                variant="outlined"
                startIcon={<Eye size={18} />}
                onClick={fetchPreview}
                disabled={!canRunExport}
                fullWidth
              >
                Vista previa
              </Button>

              <Button
                variant="contained"
                startIcon={<FileDown size={18} />}
                onClick={handleDownload}
                disabled={!canRunExport}
                fullWidth
              >
                Descargar CSV
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {errorMsg ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      ) : null}

      {!hasLoadedPreview && !loading ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Carga una vista previa para validar columnas y datos antes de descargar.
        </Alert>
      ) : null}

      <Paper sx={{ p: 3, minHeight: 520 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 420,
              gap: 2,
            }}
          >
            <CircularProgress size={56} />
            <Typography variant="body1" color="text.secondary">
              Procesando exportacion...
            </Typography>
          </Box>
        ) : hasLoadedPreview && previewRows.length > 0 ? (
          <Box>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight="bold">
                Vista previa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {previewRows.length} filas mostradas
              </Typography>
            </Box>
            <Box sx={{ height: 620, width: "100%" }}>
              <DataGrid
                rows={previewRows as any}
                columns={previewColumns}
                pageSizeOptions={[10, 20]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                disableRowSelectionOnClick
                density="comfortable"
                sx={{
                  "& .MuiDataGrid-cell:focus": { outline: "none" },
                  "& .MuiDataGrid-cell:focus-within": { outline: "none" },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "action.hover",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
          </Box>
        ) : hasLoadedPreview ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 420,
              gap: 2,
              textAlign: "center",
            }}
          >
            <Database size={64} color="lightgray" />
            <Typography variant="h6" color="text.secondary">
              Sin datos para mostrar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No se encontraron registros con los filtros seleccionados.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 420,
              gap: 2,
              textAlign: "center",
            }}
          >
            <Database size={72} color="lightgray" />
            <Typography variant="h6" color="text.secondary">
              Sin vista previa
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
              Selecciona un tipo, elige prestadores y luego carga la vista previa.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
