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
} from "@mui/material";
import { Grid } from "@mui/material"; // Usando la versión más reciente de Grid
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Search, Eye, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { MuestraCompleta } from "@/integrations/supabase/index";

// --- COMPONENTES AUXILIARES PARA REFACTORIZACIÓN ---

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

// --- CONFIGURACIÓN DE CAMPOS ---

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
    { label: "Municipio", key: "departamento", md: 3 }, // Ajustado según tu código original
    { label: "Dirección", key: "municipio", md: 3 }, // Ajustado según tu código original
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

export default function VistaAnalisisMuestras() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [selectedAnalisis, setSelectedAnalisis] =
    useState<MuestraCompleta | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  const { data: analisis, isLoading } = useQuery({
    queryKey: ["muestras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("muestra")
        .select(
          `*, prestador(*), laboratorio(nombre, estado, telefono), punto_muestreo (*), analisis_muestra(*)`,
        )
        .order("fecha_toma", { ascending: false });
      if (error) throw error;
      return data as MuestraCompleta[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredData = useMemo(() => {
    if (!search.trim() || !analisis) return analisis || [];
    const searchLower = search.toLowerCase();
    return analisis.filter(
      (item) =>
        item.muestra_no?.toLowerCase().includes(searchLower) ||
        item.fecha_toma?.toLowerCase().includes(searchLower) ||
        item.irca?.toString().includes(searchLower),
    );
  }, [analisis, search]);

  const columns: GridColDef[] = [
    {
      field: "muestra_no",
      headerName: "Nº Muestra",
      flex: 1,
      minWidth: 100,
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
      minWidth: 100,
      renderCell: (p) =>
        p.value ? new Date(p.value).toLocaleDateString("es-CO") : "-",
    },
    {
      field: "tipo_muestra",
      headerName: "Tipo muestra",
      flex: 0.5,
      minWidth: 100,
    },
    { field: "irca", headerName: "IRCA", flex: 0.5, minWidth: 100 },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 100,
      getActions: (p) => [
        <GridActionsCellItem
          icon={<Eye size={20} />}
          label="Ver Detalles"
          onClick={() => {
            setSelectedAnalisis(p.row);
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
    setSelectedAnalisis(null);
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
          helperText={`${filteredData.length} registros encontrados`}
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id_muestra}
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
                Muestra: {selectedAnalisis?.muestra_no || "Sin número"}
              </Typography>
            </Box>
            <IconButton onClick={closeDialog}>
              <X />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedAnalisis ? (
            <Box sx={{ py: 1 }}>
              <InfoSection title="Información General">
                {CONFIG_CAMPOS.general.map((f) => (
                  <InfoField
                    key={f.label}
                    label={f.label}
                    value={selectedAnalisis[f.key as keyof MuestraCompleta]}
                    md={f.md}
                  />
                ))}
              </InfoSection>

              <InfoSection title="Resultados de Laboratorio por Parámetro">
                <Box sx={{ height: 350, width: "100%" }}>
                  <DataGrid
                    rows={selectedAnalisis.analisis_muestra || []}
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
                      selectedAnalisis.punto_muestreo?.[
                        f.key as keyof typeof selectedAnalisis.punto_muestreo
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
                      selectedAnalisis.prestador?.[
                        f.key as keyof typeof selectedAnalisis.prestador
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
                      selectedAnalisis.laboratorio?.[
                        f.key as keyof typeof selectedAnalisis.laboratorio
                      ]
                    }
                    md={f.md}
                  />
                ))}
              </InfoSection>
            </Box>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
