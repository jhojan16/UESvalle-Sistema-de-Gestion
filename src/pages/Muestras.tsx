import { useState, useMemo } from "react";
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
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import { Grid } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Search, Eye, X } from "lucide-react";
import { MuestraCompleta } from "@/integrations/supabase/index";

const InfoField = ({
  label,
  value,
  md = 3,
}: {
  label: string;
  value: any;
  md?: number;
}) => (
  <Grid size={{ xs: 12, md }}>
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{ display: "block", fontWeight: 500, textTransform: "uppercase" }}
      >
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

const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
    <Typography
      variant="h5"
      fontWeight="bold"
      gutterBottom
      sx={{ color: "primary.main" }}
    >
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
    { label: "ID Muestra", key: "id_muestra", md: 2 },
    { label: "Nº Muestra", key: "muestra_no", md: 2 },
    { label: "Contramuestra", key: "contramuestra_pp", md: 2 },
    { label: "IRCA", key: "irca", md: 2 },
    { label: "IRCA Básico", key: "irca_basico", md: 2 },
    { label: "IRCA Especial", key: "irca_especial", md: 2 },
    { label: "Fecha Toma", key: "fecha_toma", md: 4 },
    { label: "Recepción Lab", key: "fecha_recepcion_lab", md: 4 },
    { label: "Análisis Lab", key: "fecha_analisis_lab", md: 4 },
    { label: "Coagulante", key: "coagulante", md: 4 },
    { label: "Resultados para", key: "resultados_para", md: 4 },
    { label: "Tipo Muestra", key: "tipo_muestra", md: 4 },
    { label: "Desinfectante", key: "desinfectante", md: 6 },
    { label: "Código Lab", key: "codigo_laboratorio", md: 6 },
    { label: "Análisis Solicitados", key: "analisis_solicitados", md: 12 },
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
};

export default function VistaAnalisisMuestras() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  const { data: listado, isLoading: loadingListado } = useQuery({
    queryKey: ["muestras_listado", paginationModel.page, paginationModel.pageSize],
    queryFn: async () => {
      const from = paginationModel.page * paginationModel.pageSize;
      const to = from + paginationModel.pageSize - 1;

      const { data, error, count } = await supabase
        .from("muestra")
        .select("id_muestra,muestra_no,fecha_toma,tipo_muestra,irca", { count: "exact" })
        .order("fecha_toma", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { rows: (data as MuestraRow[]) ?? [], count: count ?? 0 };
    },
    staleTime: 60 * 1000,
  });

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
  });

  const filteredRows = useMemo(() => {
    const rows = listado?.rows ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const a = r.muestra_no?.toLowerCase().includes(q) ?? false;
      const b = r.fecha_toma?.toLowerCase().includes(q) ?? false;
      const c = r.irca?.toString().includes(q) ?? false;
      return a || b || c;
    });
  }, [listado?.rows, search]);

  const columns: GridColDef[] = [
    {
      field: "muestra_no",
      headerName: "Nº Muestra",
      flex: 1,
      minWidth: 120,
      renderCell: (p) => (
        <Chip
          label={p.value || "Sin número"}
          color="primary"
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "fecha_toma",
      headerName: "Fecha Toma",
      flex: 1,
      minWidth: 130,
      renderCell: (p) =>
        p.value ? new Date(p.value).toLocaleDateString("es-CO") : "-",
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

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedId(null);
  };

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
        <TextField
          fullWidth
          placeholder="Buscar por Nº Muestra, Fecha o IRCA..."
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

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loadingListado}
          getRowId={(row) => row.id_muestra}
          paginationMode="server"
          rowCount={listado?.count ?? 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ minHeight: 400, border: "none" }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={detalle[f.key as keyof MuestraCompleta]}
                    md={f.md}
                  />
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
                    value={
                      detalle.punto_muestreo?.[
                        f.key as keyof typeof detalle.punto_muestreo
                      ]
                    }
                    md={f.md}
                  />
                ))}
              </InfoSection>

              <InfoSection title="Prestador">
                {CONFIG_CAMPOS.prestador.map((f) => (
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={
                      detalle.prestador?.[
                        f.key as keyof typeof detalle.prestador
                      ]
                    }
                    md={f.md}
                  />
                ))}
              </InfoSection>

              <InfoSection title="Laboratorio">
                {CONFIG_CAMPOS.laboratorio.map((f) => (
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={
                      detalle.laboratorio?.[
                        f.key as keyof typeof detalle.laboratorio
                      ]
                    }
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
