import { useState } from "react";
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
    Stack
} from "@mui/material";
import { UploadCloud, FileSpreadsheet, Download, Map as MapIcon } from "lucide-react";

// 1. Actualizamos el tipo para incluir 'mapa_riesgo'
type ImportType = "inspeccion" | "muestra" | "mapa_riesgo";

export default function CargaMasivaVista() {
    const [importType, setImportType] = useState<ImportType>("mapa_riesgo");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const handleTypeChange = (_: any, newType: ImportType | null) => {
        if (newType) {
            setImportType(newType);
            setFile(null);
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

        try {
            // 2. Configuración del endpoint según el tipo seleccionado
            let endpoint = "";
            switch (importType) {
                case "muestra": endpoint = "muestra_insert"; break;
                case "inspeccion": endpoint = "super-handler"; break;
                case "mapa_riesgo": endpoint = "mapaRiesgo"; break; // Tu nuevo endpoint
            }

            const formData = new FormData();
            formData.append("file", file);

            const { data, error } = await supabase.functions.invoke(endpoint, {
                body: formData,
            });

            if (error) {
                const errorMsg = error.message || "Error en la respuesta del servidor";
                setStatus({ type: "error", msg: `Error de Function: ${errorMsg}` });
                return;
            }

            setStatus({
                type: "success",
                msg: data.message || "Archivo procesado correctamente.",
            });

            setFile(null);
        } catch (error: any) {
            setStatus({
                type: "error",
                msg: error.message === "Failed to fetch"
                    ? "Error de conexión o CORS. Verifica que la función esté desplegada."
                    : (error.message || "Error al procesar el archivo")
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper para obtener el nombre de la plantilla
    const getTemplateConfig = () => {
        switch (importType) {
            case 'muestra': return { name: 'Muestras', path: '/templates/muestra.csv' };
            case 'inspeccion': return { name: 'Inspecciones', path: '/templates/inspeccion.csv' };
            case 'mapa_riesgo': return { name: 'Mapa de Riesgo', path: '/templates/mapa de riesgo.csv' };
        }
    };

    const template = getTemplateConfig();

    return (
        <Box className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography variant="h3" fontWeight="800" className="text-slate-800">
                    Carga Masiva de Datos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Sube archivos CSV de forma rápida y segura a la plataforma.
                </Typography>
            </Box>

            <Paper elevation={0} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <Box sx={{ bgcolor: 'grey.50', p: 4, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, textAlign: 'center', textTransform: 'uppercase' }}>
                        PASO 1: ¿QUÉ TIPO DE DATOS VAS A SUBIR?
                    </Typography>
                    <ToggleButtonGroup
                        value={importType}
                        exclusive
                        onChange={handleTypeChange}
                        color="primary"
                        fullWidth
                    >
                        <ToggleButton value="mapa_riesgo" sx={{ py: 1.5, fontWeight: 'bold' }}>
                            <MapIcon size={18} className="mr-2" /> MAPA DE RIESGO
                        </ToggleButton>
                        <ToggleButton value="muestra" sx={{ py: 1.5, fontWeight: 'bold' }}>
                            <UploadCloud size={18} className="mr-2" /> MUESTRAS
                        </ToggleButton>
                        <ToggleButton value="inspeccion" sx={{ py: 1.5, fontWeight: 'bold' }}>
                            <UploadCloud size={18} className="mr-2" /> INSPECCIONES
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{ p: 5 }}>
                    <Stack spacing={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Asegúrate de usar el formato oficial para evitar errores de carga.
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Download size={18} />}
                                href={template.path}
                                download
                                sx={{ borderRadius: '12px', px: 4 }}
                            >
                                Descargar Plantilla {template.name}
                            </Button>
                        </Box>

                        <Divider>
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                                PASO 2: SUBIR ARCHIVO
                            </Typography>
                        </Divider>

                        <Box component="label" sx={{ cursor: 'pointer' }}>
                            <input type="file" hidden accept=".csv" onChange={handleFileChange} disabled={loading} />
                            <Box
                                sx={{
                                    p: 6,
                                    border: '2px dashed',
                                    borderColor: file ? 'primary.main' : '#e2e8f0',
                                    bgcolor: file ? 'aliceblue' : 'transparent',
                                    textAlign: 'center',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.50' }
                                }}
                            >
                                {!file ? (
                                    <Stack spacing={2} alignItems="center">
                                        <UploadCloud size={48} className="text-blue-500" />
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">Arrastra tu archivo CSV aquí</Typography>
                                            <Typography variant="body2" color="text.secondary">Formato requerido para {template.name}</Typography>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Stack spacing={2} alignItems="center">
                                        <FileSpreadsheet size={48} className="text-green-600" />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">{file.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{(file.size / 1024).toFixed(2)} KB</Typography>
                                        </Box>
                                        <Button size="small" color="error" onClick={(e) => { e.preventDefault(); setFile(null); }}>
                                            Cambiar archivo
                                        </Button>
                                    </Stack>
                                )}
                            </Box>
                        </Box>

                        <Box>
                            {status && (
                                <Alert severity={status.type} sx={{ mb: 2, borderRadius: '12px' }}>
                                    {status.msg}
                                </Alert>
                            )}
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{ py: 2, borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem' }}
                                disabled={!file || loading}
                                onClick={handleUpload}
                            >
                                {loading ? 'Procesando...' : `Cargar Datos de ${template.name}`}
                            </Button>
                            {loading && <LinearProgress sx={{ mt: 2, borderRadius: '4px', height: 6 }} />}
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
}