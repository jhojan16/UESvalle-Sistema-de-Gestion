import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Paper,
    Alert,
} from "@mui/material";
import { FileDown, Eye, Database } from "lucide-react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function ExportarVista() {
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<string[][]>([]);
    const [previewColumns, setPreviewColumns] = useState<GridColDef[]>([]);
    const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
    const [hasLoadedPreview, setHasLoadedPreview] = useState(false);

    // 🔹 Vista previa (solo algunas filas)
    const fetchPreview = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("export_csv_full", {
                body: { preview: true },
            });
            
            if (error) {
                console.error(error);
                alert("Error al cargar vista previa: " + error.message);
                setLoading(false);
                return;
            }

            // Si la función retorna CSV, conviértelo a JSON para mostrarlo en el DataGrid
            const lines: string[] = data.split("\n").filter(Boolean);
            
            if (lines.length === 0) {
                setPreviewColumns([]);
                setPreviewRows([]);
                setPreviewData([]);
                setHasLoadedPreview(true);
                setLoading(false);
                return;
            }

            // Primer fila = headers
            const rawHeaders = lines[0].split(",").map((h) => h.trim());
            
            // Sanear nombres de campo para DataGrid
            const sanitize = (s: string) =>
                s
                    .replace(/\s+/g, "_")
                    .replace(/[^a-zA-Z0-9_]/g, "")
                    .toLowerCase();
            
            const headers = rawHeaders.map((h, i) => ({ 
                key: sanitize(h) || `col_${i}`, 
                label: h 
            }));

            const dataRows = lines.slice(1, 21).map((line) => line.split(","));
            
            const rows = dataRows.map((cells, idx) => {
                const obj: Record<string, string> & { id: number } = { id: idx } as Record<string, string> & { id: number };
                headers.forEach((h, i) => {
                    obj[h.key] = (cells[i] ?? "").toString();
                });
                return obj;
            });

            const columns: GridColDef[] = headers.map((h) => ({ 
                field: h.key, 
                headerName: h.label, 
                flex: 1, 
                minWidth: 150 
            }));

            setPreviewColumns(columns);
            setPreviewRows(rows);
            setPreviewData(dataRows);
            setHasLoadedPreview(true);
        } catch (error) {
            console.error("Error en vista previa:", error);
            alert("Error inesperado al cargar vista previa");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Descargar el CSV completo
    const handleDownload = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke("export_csv_full");
            
            if (error) {
                console.error(error);
                alert("Error al exportar: " + error.message);
                setLoading(false);
                return;
            }

            // Crear archivo descargable
            const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `exportacion_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error en descarga:", error);
            alert("Error inesperado al descargar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    Exportar Datos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualiza una muestra de los datos antes de exportar el archivo completo
                </Typography>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<FileDown />}
                    onClick={handleDownload}
                    disabled={loading}
                    size="large"
                >
                    Descargar CSV Completo
                </Button>
            </Box>

            {/* Alerta informativa */}
            {!hasLoadedPreview && !loading && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Haz clic en "Ver Vista Previa" para visualizar una muestra de los datos antes de descargar.
                </Alert>
            )}

            {/* Contenedor de la vista previa */}
            <Paper sx={{ p: 3, minHeight: 500 }}>
                {loading ? (
                    // Estado de carga
                    <Box 
                        sx={{ 
                            display: "flex", 
                            flexDirection: "column",
                            justifyContent: "center", 
                            alignItems: "center",
                            minHeight: 400,
                            gap: 2
                        }}
                    >
                        <CircularProgress size={60} />
                        <Typography variant="body1" color="text.secondary">
                            Cargando datos...
                        </Typography>
                    </Box>
                ) : hasLoadedPreview && previewRows.length > 0 ? (
                    // Vista previa con datos
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight="bold">
                                Vista Previa - Primeras 20 Filas
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {previewRows.length} filas mostradas
                            </Typography>
                        </Box>
                        <Box sx={{ height: 600, width: '100%' }}>
                            <DataGrid
                                rows={previewRows}
                                columns={previewColumns}
                                pageSizeOptions={[10, 20]}
                                initialState={{ 
                                    pagination: { 
                                        paginationModel: { pageSize: 10, page: 0 } 
                                    } 
                                }}
                                disableRowSelectionOnClick
                                density="comfortable"
                                sx={{
                                    '& .MuiDataGrid-cell:focus': { 
                                        outline: 'none' 
                                    },
                                    '& .MuiDataGrid-cell:focus-within': { 
                                        outline: 'none' 
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: 'action.hover',
                                        fontWeight: 'bold',
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                ) : hasLoadedPreview && previewRows.length === 0 ? (
                    // Sin datos después de cargar
                    <Box 
                        sx={{ 
                            display: "flex", 
                            flexDirection: "column",
                            justifyContent: "center", 
                            alignItems: "center",
                            minHeight: 400,
                            gap: 2
                        }}
                    >
                        <Database size={64} color="lightgray" />
                        <Typography variant="h6" color="text.secondary">
                            No hay datos disponibles
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron registros para mostrar
                        </Typography>
                    </Box>
                ) : (
                    // Estado inicial - sin vista previa cargada
                    <Box 
                        sx={{ 
                            display: "flex", 
                            flexDirection: "column",
                            justifyContent: "center", 
                            alignItems: "center",
                            minHeight: 400,
                            gap: 2,
                            textAlign: 'center'
                        }}
                    >
                        <Database size={80} color="lightgray" />
                        <Typography variant="h6" color="text.secondary">
                            Sin Vista Previa
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
                            Haz clic en "Ver Vista Previa" para visualizar una muestra de los datos,
                            o descarga directamente el archivo CSV completo.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            startIcon={<Eye />}
                            onClick={fetchPreview}
                            sx={{ mt: 2 }}
                        >
                            Cargar Vista Previa
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}