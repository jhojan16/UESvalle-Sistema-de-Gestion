import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Divider,
  Stack,
} from "@mui/material";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Map as MapIcon,
} from "lucide-react";

type ImportType = "inspeccion" | "muestra" | "mapa_riesgo";

const getEndpoint = (importType: ImportType) => {
  switch (importType) {
    case "muestra":
      return "muestra_insert";
    case "inspeccion":
      return "super-handler";
    case "mapa_riesgo":
      return "mapaRiesgo";
  }
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sanitize = (name: string) => name.replace(/[^\w.\-]+/g, "_");

const getEnvSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL ?? "";
};

export default function CargaMasivaVista() {
  const [importType, setImportType] = useState<ImportType>("mapa_riesgo");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const clearSelectedFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTypeChange = (_: undefined, newType: ImportType | null) => {
    if (newType) {
      setImportType(newType);
      clearSelectedFile();
      setStatus(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus(null);

    const endpoint = getEndpoint(importType);
    const bucket = "imports";

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user?.id) {
        setStatus({
          type: "error",
          msg: "No hay sesión activa. Inicia sesión e intenta de nuevo.",
        });
        return;
      }

      const { data: sessionRes, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) {
        setStatus({ type: "error", msg: `Error obteniendo sesión: ${sessErr.message}` });
        return;
      }

      const token = sessionRes.session?.access_token;
      if (!token) {
        setStatus({
          type: "error",
          msg: "No se encontró token de sesión. Cierra sesión e inicia sesión nuevamente.",
        });
        return;
      }

      const userId = userRes.user.id;
      const id = makeId();
      const safeName = sanitize(file.name || "archivo.csv");
      const path = `tmp/${userId}/${id}-${safeName}`;

      // 1) Subir archivo una sola vez
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: "text/csv", upsert: false });

      if (upErr) {
        setStatus({ type: "error", msg: `Error subiendo a Storage: ${upErr.message}` });
        return;
      }

      const supabaseUrl = getEnvSupabaseUrl();
      if (!supabaseUrl) {
        setStatus({ type: "error", msg: "Falta VITE_SUPABASE_URL en tus variables de entorno." });
        return;
      }

      // 2) Llamar la función y reintentar si devuelve "running"
      let batch_id: string | null = null;
      const maxCalls = 60; // límite para no quedar en loop infinito

      for (let attempt = 0; attempt < maxCalls; attempt++) {
        const res = await fetch(`${supabaseUrl}/functions/v1/${endpoint}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch_id ? { path, batch_id } : { path }),
        });

        const text = await res.text();

        if (!res.ok) {
          setStatus({
            type: "error",
            msg: `Error Function (${res.status}): ${text || "Sin body"}`,
          });
          return;
        }

        const json = text ? JSON.parse(text) : null;

        // Si la función dice "running", guardamos batch_id y seguimos
        if (json?.status === "running") {
          batch_id = json.batch_id;

          // Opcional: mostrar progreso/estado
          setStatus({
            type: "success",
            msg: `Procesando... restantes: ${json.remaining ?? "?"} (batch ${batch_id})`,
          });

          // Pequeña pausa para no saturar
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }

        // Si terminó
        setStatus({
          type: "success",
          msg: json?.message || "Archivo procesado correctamente.",
        });

        clearSelectedFile();
        return;
      }

      // Si llega aquí, no terminó en maxCalls
      setStatus({
        type: "error",
        msg: "El proceso está tardando demasiado. Intenta nuevamente (se reanuda con el batch_id).",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        msg:
          error?.message === "Failed to fetch"
            ? "Error de conexión o CORS. Verifica que la función esté desplegada."
            : error?.message || "Error al procesar el archivo",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemplateConfig = () => {
    switch (importType) {
      case "muestra":
        return { name: "Muestras", path: "/templates/muestra.csv" };
      case "inspeccion":
        return { name: "Inspecciones", path: "/templates/inspeccion.csv" };
      case "mapa_riesgo":
        return { name: "Mapa de Riesgo", path: "/templates/mapa de riesgo.csv" };
    }
  };

  const template = getTemplateConfig();

  return (
    <Box className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h3" fontWeight="800" className="text-slate-800">
          Carga Masiva de Datos
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Sube archivos CSV de forma rápida y segura a la plataforma.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
      >
        <Box
          sx={{
            bgcolor: "grey.50",
            p: 4,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="700"
            sx={{ mb: 2, textAlign: "center", textTransform: "uppercase" }}
          >
            PASO 1: ¿QUÉ TIPO DE DATOS VAS A SUBIR?
          </Typography>
          <ToggleButtonGroup
            value={importType}
            exclusive
            onChange={handleTypeChange}
            color="primary"
            fullWidth
          >
            <ToggleButton
              value="mapa_riesgo"
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              <MapIcon size={18} className="mr-2" /> MAPA DE RIESGO
            </ToggleButton>
            <ToggleButton value="muestra" sx={{ py: 1.5, fontWeight: "bold" }}>
              <UploadCloud size={18} className="mr-2" /> MUESTRAS
            </ToggleButton>
            <ToggleButton
              value="inspeccion"
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              <UploadCloud size={18} className="mr-2" /> INSPECCIONES
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ p: 5 }}>
          <Stack spacing={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Asegúrate de usar el formato oficial para evitar errores de
                carga.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download size={18} />}
                href={template.path}
                download
                sx={{ borderRadius: "12px", px: 4 }}
              >
                Descargar Plantilla {template.name}
              </Button>
            </Box>

            <Divider>
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontWeight: "bold" }}
              >
                PASO 2: SUBIR ARCHIVO
              </Typography>
            </Divider>

            <Box component="label" sx={{ cursor: "pointer" }}>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".csv"
                onClick={(e) => {
                  // Permite volver a seleccionar exactamente el mismo archivo.
                  e.currentTarget.value = "";
                }}
                onChange={handleFileChange}
                disabled={loading}
              />
              <Box
                sx={{
                  p: 6,
                  border: "2px dashed",
                  borderColor: file ? "primary.main" : "#e2e8f0",
                  bgcolor: file ? "aliceblue" : "transparent",
                  textAlign: "center",
                  borderRadius: "16px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "grey.50",
                  },
                }}
              >
                {!file ? (
                  <Stack spacing={2} alignItems="center">
                    <UploadCloud size={48} className="text-blue-500" />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Selecciona tu archivo CSV aquí
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Formato requerido para {template.name}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={2} alignItems="center">
                    <FileSpreadsheet size={48} className="text-green-600" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(2)} KB
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.preventDefault();
                        clearSelectedFile();
                      }}
                    >
                      Cambiar archivo
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>

            <Box>
              {status && (
                <Alert
                  severity={status.type}
                  sx={{ mb: 2, borderRadius: "12px" }}
                >
                  {status.msg}
                </Alert>
              )}
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  py: 2,
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
                disabled={!file || loading}
                onClick={handleUpload}
              >
                {loading ? "Procesando..." : `Cargar Datos de ${template.name}`}
              </Button>
              {loading && (
                <LinearProgress
                  sx={{ mt: 2, borderRadius: "4px", height: 6 }}
                />
              )}
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
