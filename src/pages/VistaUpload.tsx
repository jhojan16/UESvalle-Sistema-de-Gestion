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
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Trash2, Download } from "lucide-react";

type ImportType = "inspeccion" | "muestra";

export default function CargaMasivaVista() {
    const [importType, setImportType] = useState<ImportType>("muestra");
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
            // Determinamos el nombre de la función
            const endpoint = importType === "muestra" ? "muestra_insert" : "super-handler";

            // 1. IMPORTANTE: Empaquetar el archivo en un FormData
            // Esto debe coincidir con el 'formData.get("file")' de tu Edge Function
            const formData = new FormData();
            formData.append("file", file);

            // 2. Invocamos la función enviando el formData directamente en el body
            const { data, error } = await supabase.functions.invoke(endpoint, {
                body: formData,
            });

            // 3. Manejo de errores de la respuesta de Supabase
            if (error) {
                console.error("Detalle del error:", error);
                // Intentamos extraer un mensaje amigable si la función devolvió un JSON con error
                const errorMsg = error.message || "Error en la respuesta del servidor";
                setStatus({ type: "error", msg: `Error de Function: ${errorMsg}` });
                return;
            }

            // 4. Éxito (ajustado a la estructura de respuesta de tu RPC)
            // Nota: Asegúrate de que data.result contenga estas propiedades o ajusta el mensaje
            setStatus({
                type: "success",
                msg: data.message || "Archivo procesado correctamente.",
            });

            setFile(null);
        } catch (error: any) {
            console.error("Error capturado:", error);
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

    return (
        <Box className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography variant="h3" fontWeight="800" className="text-slate-800">
                    Carga Masiva de Datos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Sube archivos CSV/Excel de forma rápida y segura.
                </Typography>
            </Box>

            {/* Contenedor Principal Sin Lineas Punteadas Laterales */}
            <Paper
                elevation={0}
                className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
                sx={{ position: 'relative' }} // Evita que elementos hijos "se salgan"
            >
                {/* Paso 1: Selección */}
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
                        <ToggleButton value="muestra" sx={{ py: 1.5, fontWeight: 'bold' }}>
                            <UploadCloud size={18} className="mr-2" /> MUESTRAS DE AGUA
                        </ToggleButton>
                        <ToggleButton value="inspeccion" sx={{ py: 1.5, fontWeight: 'bold' }}>
                            <UploadCloud size={18} className="mr-2" /> INSPECCIONES TÉCNICAS
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{ p: 5 }}>
                    <Stack spacing={4}>
                        {/* Plantilla */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Asegúrate de usar el formato correcto antes de subir el archivo.
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Download size={18} />}
                                href={importType === 'muestra' ? '/templates/muestra.csv' : '/templates/inspeccion.csv'}
                                download
                                sx={{ borderRadius: '12px', px: 4 }}
                            >
                                Descargar Plantilla {importType === 'muestra' ? 'Muestras' : 'Inspecciones'}
                            </Button>
                        </Box>

                        <Divider>
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                                PASO 2: SUBIR ARCHIVO
                            </Typography>
                        </Divider>

                        {/* Dropzone (Aquí es el único lugar donde debe haber líneas punteadas) */}
                        <Box component="label" sx={{ cursor: 'pointer' }}>
                            <input type="file" hidden accept=".csv, .xlsx" onChange={handleFileChange} disabled={loading} />
                            <Box
                                sx={{
                                    p: 6,
                                    border: '2px dashed',
                                    borderColor: file ? 'primary.main' : '#e2e8f0', // Color slate-200
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
                                            <Typography variant="h6" fontWeight="bold">Arrastra tu archivo aquí</Typography>
                                            <Typography variant="body2" color="text.secondary">Solo se permiten formatos .csv o .xlsx</Typography>
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

                        {/* Botón Acción */}
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
                                {loading ? 'Procesando...' : 'Iniciar Carga de Datos'}
                            </Button>
                            {loading && <LinearProgress sx={{ mt: 2, borderRadius: '4px', height: 6 }} />}
                        </Box>
                    </Stack>
                </Box>
            </Paper>
            <Typography variant="caption" sx={{ display: 'block', mt: 4, textAlign: 'center', color: 'text.disabled' }}>
                ¿Tienes problemas con el formato? Contacta al soporte técnico.
            </Typography>
        </Box>
    );
}