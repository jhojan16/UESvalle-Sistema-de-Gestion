import { useMemo, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Box, Button, Typography, CircularProgress, Paper, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { FileDown, Eye, Database } from "lucide-react"
import { DataGrid, GridColDef } from "@mui/x-data-grid"

type ExportTipo = "muestra" | "inspeccion" | "mapa_riesgo"

function escapeCsvValue(v: string) {
    const s = (v ?? "").toString()
    const t = s.replace(/"/g, '""')
    if (/[",\n\r]/.test(t)) return `"${t}"`
    return t
}

function splitCsvLine(line: string) {
    const out: string[] = []
    let cur = ""
    let inQ = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
            const next = line[i + 1]
            if (inQ && next === '"') {
                cur += '"'
                i++
            } else {
                inQ = !inQ
            }
        } else if (ch === "," && !inQ) {
            out.push(cur)
            cur = ""
        } else {
            cur += ch
        }
    }
    out.push(cur)
    return out
}

export default function ExportarVista() {
    const [tipo, setTipo] = useState<ExportTipo>("muestra")
    const [loading, setLoading] = useState(false)
    const [previewColumns, setPreviewColumns] = useState<GridColDef[]>([])
    const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
    const [hasLoadedPreview, setHasLoadedPreview] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string>("")

    const fnUrl = useMemo(() => {
        const base = import.meta.env.VITE_SUPABASE_URL
        return base ? `${String(base).replace(/\/$/, "")}/functions/v1/export_csv_full` : ""
    }, [])

    const getToken = async () => {
        const { data } = await supabase.auth.getSession()
        const token = data?.session?.access_token ?? ""
        return token
    }

    const parseCsvToGrid = (csvText: string) => {
        const lines = csvText.split(/\r\n|\n|\r/).filter((x) => x.trim().length > 0)
        if (lines.length === 0) {
            setPreviewColumns([])
            setPreviewRows([])
            setHasLoadedPreview(true)
            return
        }

        const rawHeaders = splitCsvLine(lines[0]).map((h) => h.trim())
        const sanitize = (s: string) => s.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase()
        const hiddenPreviewHeaders = new Set(["row_cell_id"])
        const headers = rawHeaders
            .map((h, i) => ({ sourceIndex: i, key: sanitize(h) || `col_${i}`, label: h }))
            .filter((h) => !hiddenPreviewHeaders.has(h.label.toLowerCase()))

        const dataLines = lines.slice(1, 21)
        const rows = dataLines.map((line, idx) => {
            const cells = splitCsvLine(line)
            const obj: any = { id: idx }
            headers.forEach((h) => {
                obj[h.key] = (cells[h.sourceIndex] ?? "").toString()
            })
            return obj as Record<string, string>
        })

        const columns: GridColDef[] = headers.map((h) => ({ field: h.key, headerName: h.label, flex: 1, minWidth: 150 }))

        setPreviewColumns(columns)
        setPreviewRows(rows)
        setHasLoadedPreview(true)
    }

    const callExport = async (preview: boolean) => {
        setErrorMsg("")
        if (!fnUrl) throw new Error("No se encontró VITE_SUPABASE_URL")
        const token = await getToken()
        if (!token) throw new Error("Sesión inválida. Inicia sesión nuevamente.")

        const res = await fetch(fnUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ preview, tipo }),
        })

        if (!res.ok) {
            const t = await res.text().catch(() => "")
            throw new Error(t || `Error HTTP ${res.status}`)
        }

        const csvText = await res.text()
        return csvText
    }

    const fetchPreview = async () => {
        setLoading(true)
        try {
            const csvText = await callExport(true)
            parseCsvToGrid(csvText)
        } catch (e: any) {
            setErrorMsg(e?.message ?? "Error inesperado en vista previa")
            setPreviewColumns([])
            setPreviewRows([])
            setHasLoadedPreview(true)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setLoading(true)
        try {
            const csvText = await callExport(false)
            const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `exportacion_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch (e: any) {
            setErrorMsg(e?.message ?? "Error inesperado al descargar")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                    Exportar Datos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Selecciona el tipo de exportación y revisa una vista previa antes de descargar.
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <FormControl size="small" sx={{ minWidth: 240 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as ExportTipo)} disabled={loading}>
                            <MenuItem value="muestra">Muestra</MenuItem>
                            <MenuItem value="inspeccion">Inspección</MenuItem>
                            <MenuItem value="mapa_riesgo">Mapa de riesgo</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="outlined" startIcon={<Eye />} onClick={fetchPreview} disabled={loading}>
                        Cargar Vista Previa
                    </Button>

                    <Button variant="contained" startIcon={<FileDown />} onClick={handleDownload} disabled={loading}>
                        Descargar CSV
                    </Button>
                </Box>
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

            <Paper sx={{ p: 3, minHeight: 500 }}>
                {loading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
                        <CircularProgress size={60} />
                        <Typography variant="body1" color="text.secondary">
                            Procesando exportación...
                        </Typography>
                    </Box>
                ) : hasLoadedPreview && previewRows.length > 0 ? (
                    <Box>
                        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" fontWeight="bold">
                                Vista Previa - Primeras 20 Filas
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {previewRows.length} filas mostradas
                            </Typography>
                        </Box>
                        <Box sx={{ height: 600, width: "100%" }}>
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
                                    "& .MuiDataGrid-columnHeaders": { backgroundColor: "action.hover", fontWeight: "bold" },
                                }}
                            />
                        </Box>
                    </Box>
                ) : hasLoadedPreview && previewRows.length === 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
                        <Database size={64} color="lightgray" />
                        <Typography variant="h6" color="text.secondary">
                            No hay datos disponibles
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No se encontraron registros para mostrar
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2, textAlign: "center" }}>
                        <Database size={80} color="lightgray" />
                        <Typography variant="h6" color="text.secondary">
                            Sin Vista Previa
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                            Selecciona el tipo y carga una vista previa, o descarga directamente el CSV.
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    )
}
