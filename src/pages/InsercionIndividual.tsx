import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
    Box,
    Paper,
    Typography,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress
} from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"

type NitDuplicado = { nit: string; total: number }
type PrestadorOpt = { id_prestador: number; nombre: string | null; nit: string | null }

type StagingRow = {
    id_staging: number
    id_inspeccion_sivicap: string | null
    fecha_inspeccion: string | null
    autoridad_inspeccion: string | null
    fecha_visita_anterior: string | null
    nombre_visita_anterior: string | null
    copia_visita_anterior: string | null
    concepto: string | null
    plazo_ejecucion_inspeccion: string | null
    plan_mejoramiento: string | null
    habitantes_municipio: string | null
    viviendas: string | null
    viviendas_urbano: string | null
    iraba_inspeccion: string | null
    indice_tratamiento: string | null
    indice_continuidad: string | null
    bps: string | null
    estado: string | null
    nit: string | null
    created_at: string | null
    processed: boolean | null
}

type DraftRow = StagingRow & { id_prestador: number | null }

const toInt = (v: any) => {
    if (v === undefined || v === null) return null
    const s = String(v).trim()
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? Math.trunc(n) : null
}

const toText = (v: any) => {
    if (v === undefined || v === null) return null
    const s = String(v).trim()
    return s ? s : null
}

const isReadyRow = (r: DraftRow) => {
    const nitOk = String(r.nit ?? "").trim().length > 0
    const prestadorOk = typeof r.id_prestador === "number" && Number.isFinite(r.id_prestador)
    return nitOk && prestadorOk
}

export default function InspeccionStagingResolver() {
    const qc = useQueryClient()
    const [selectedNit, setSelectedNit] = React.useState<string>("")
    const [originalRows, setOriginalRows] = React.useState<DraftRow[]>([])
    const [draftRows, setDraftRows] = React.useState<DraftRow[]>([])

    const { data: nitsDup = [], isLoading: loadingNits } = useQuery({
        queryKey: ["staging-nits-duplicados"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inspeccion_staging_nits_duplicados")
                .select("nit,total")
            if (error) throw error
            return (data ?? []) as NitDuplicado[]
        }
    })

    const { data: stagingRows = [], isLoading: loadingRows } = useQuery({
        queryKey: ["staging-rows-por-nit", selectedNit],
        enabled: !!selectedNit,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("inspeccion_staging")
                .select("*")
                .eq("processed", false)
                .eq("nit", selectedNit)
                .order("created_at", { ascending: true })
            if (error) throw error
            return (data ?? []) as StagingRow[]
        }
    })

    React.useEffect(() => {
        const base = (stagingRows ?? []).map((r) => ({ ...r, id_prestador: null }))
        setOriginalRows(base)
        setDraftRows(base)
    }, [stagingRows])

    const uniqueNitsInDraft = React.useMemo(() => {
        const set = new Set<string>()
        for (const r of draftRows) {
            const nit = String(r.nit ?? "").trim()
            if (nit) set.add(nit)
        }
        return Array.from(set)
    }, [draftRows])

    const { data: prestadoresPorNit = new Map<string, PrestadorOpt[]>(), isLoading: loadingPrestadores } = useQuery({
        queryKey: ["prestadores-por-nits", uniqueNitsInDraft],
        enabled: uniqueNitsInDraft.length > 0,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("prestador")
                .select("id_prestador,nombre,nit")
                .in("nit", uniqueNitsInDraft)
                .order("nombre", { ascending: true })
            if (error) throw error
            const map = new Map<string, PrestadorOpt[]>()
                ; (data ?? []).forEach((p: any) => {
                    const nit = String(p.nit ?? "").trim()
                    if (!nit) return
                    if (!map.has(nit)) map.set(nit, [])
                    map.get(nit)!.push(p as PrestadorOpt)
                })
            return map
        }
    })

    React.useEffect(() => {
        if (!prestadoresPorNit || draftRows.length === 0) return
        setDraftRows((prev) =>
            prev.map((r) => {
                const nit = String(r.nit ?? "").trim()
                const candidatos = prestadoresPorNit.get(nit) ?? []
                if (candidatos.length === 1) return { ...r, id_prestador: candidatos[0].id_prestador }
                if (candidatos.some((c) => c.id_prestador === r.id_prestador)) return r
                return { ...r, id_prestador: null }
            })
        )
    }, [prestadoresPorNit])

    const readyRows = React.useMemo(() => draftRows.filter(isReadyRow), [draftRows])
    const pendingRows = React.useMemo(() => draftRows.filter((r) => !isReadyRow(r)), [draftRows])

    const canSend = readyRows.length > 0

    const enviarMutation = useMutation({
        mutationFn: async () => {
            const rowsToSend = draftRows.filter(isReadyRow)

            if (rowsToSend.length === 0) {
                return { inserted: 0, pending: draftRows.length }
            }

            const payload = rowsToSend.map((r) => ({
                id_inspeccion_sivicap: toText(r.id_inspeccion_sivicap),
                fecha_inspeccion: toText(r.fecha_inspeccion),
                autoridad_inspeccion: toText(r.autoridad_inspeccion),
                fecha_visita_anterior: toText(r.fecha_visita_anterior),
                nombre_visita_anterior: toText(r.nombre_visita_anterior),
                copia_visita_anterior: toText(r.copia_visita_anterior),
                concepto: toText(r.concepto),
                plazo_ejecucion_inspeccion: toText(r.plazo_ejecucion_inspeccion),
                plan_mejoramiento: toText(r.plan_mejoramiento),
                habitantes_municipio: toInt(r.habitantes_municipio),
                viviendas: toInt(r.viviendas),
                viviendas_urbano: toInt(r.viviendas_urbano),
                iraba_inspeccion: toInt(r.iraba_inspeccion),
                indice_tratamiento: toInt(r.indice_tratamiento),
                indice_continuidad: toInt(r.indice_continuidad),
                bps: toInt(r.bps),
                estado: toText(r.estado),
                id_prestador: r.id_prestador
            }))

            const { error: insertErr } = await supabase.from("inspeccion").insert(payload as any)
            if (insertErr) throw insertErr

            const ids = rowsToSend.map((r) => r.id_staging)
            const { error: updErr } = await supabase
                .from("inspeccion_staging")
                .update({ processed: true })
                .in("id_staging", ids)
            if (updErr) throw updErr

            return { inserted: rowsToSend.length, pending: draftRows.length - rowsToSend.length }
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ["staging-nits-duplicados"] })
            await qc.invalidateQueries({ queryKey: ["staging-rows-por-nit", selectedNit] })
        }
    })

    const columns: GridColDef[] = [
        { field: "id_staging", headerName: "ID", width: 90 },
        { field: "nit", headerName: "NIT", width: 180, editable: true },
        {
            field: "id_prestador",
            headerName: "Prestador",
            width: 320,
            renderCell: (params) => {
                const nit = String(params.row.nit ?? "").trim()
                const opts = prestadoresPorNit.get(nit) ?? []
                const value = params.row.id_prestador ?? ""
                return (
                    <FormControl fullWidth size="small" disabled={opts.length === 0}>
                        <Select
                            value={value}
                            onChange={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value)
                                setDraftRows((prev) =>
                                    prev.map((r) => (r.id_staging === params.row.id_staging ? { ...r, id_prestador: v } : r))
                                )
                            }}
                        >
                            <MenuItem value="">Seleccionar...</MenuItem>
                            {opts.map((p) => (
                                <MenuItem key={p.id_prestador} value={p.id_prestador}>
                                    {p.id_prestador} - {p.nombre ?? "N/A"}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )
            }
        },
        { field: "id_inspeccion_sivicap", headerName: "ID SIVICAP", width: 160, editable: true },
        { field: "fecha_inspeccion", headerName: "Fecha inspección", width: 200, editable: true },
        { field: "autoridad_inspeccion", headerName: "Autoridad", width: 200, editable: true },
        { field: "concepto", headerName: "Concepto", width: 220, editable: true },
        { field: "estado", headerName: "Estado", width: 140, editable: true },
        { field: "habitantes_municipio", headerName: "Habitantes", width: 130, editable: true },
        { field: "viviendas", headerName: "Viviendas", width: 120, editable: true },
        { field: "viviendas_urbano", headerName: "Viviendas urbano", width: 150, editable: true },
        { field: "iraba_inspeccion", headerName: "IRABA", width: 110, editable: true },
        { field: "indice_tratamiento", headerName: "Índice trat.", width: 140, editable: true },
        { field: "indice_continuidad", headerName: "Índice cont.", width: 140, editable: true },
        { field: "bps", headerName: "BPS", width: 100, editable: true }
    ]

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Resolver duplicados de NIT en staging
                </Typography>
                <Divider sx={{ mt: 2, mb: 2 }} />

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>NIT duplicado</InputLabel>
                        <Select
                            label="NIT duplicado"
                            value={selectedNit}
                            onChange={(e) => setSelectedNit(String(e.target.value))}
                        >
                            {loadingNits ? (
                                <MenuItem value="">
                                    <CircularProgress size={18} />
                                </MenuItem>
                            ) : (
                                nitsDup.map((n) => (
                                    <MenuItem key={n.nit} value={n.nit}>
                                        {n.nit} ({n.total})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", alignItems: "center" }}>
                        <Box sx={{ mr: 1, textAlign: "right" }}>
                            <Typography variant="body2" color="text.secondary">
                                Listas: {readyRows.length} | Pendientes: {pendingRows.length}
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            disabled={!selectedNit || draftRows.length === 0}
                            onClick={() => setDraftRows(originalRows)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            disabled={!selectedNit || !canSend || enviarMutation.isPending}
                            onClick={() => enviarMutation.mutate()}
                        >
                            {enviarMutation.isPending ? "Enviando..." : `Enviar (${readyRows.length})`}
                        </Button>
                    </Box>
                </Box>

                {selectedNit && (
                    <Box sx={{ mt: 3, height: 560, width: "100%" }}>
                        <DataGrid
                            rows={draftRows}
                            columns={columns}
                            getRowId={(row) => row.id_staging}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableRowSelectionOnClick
                            loading={loadingRows || loadingPrestadores}
                            processRowUpdate={(newRow, oldRow) => {
                                const nitNew = String(newRow.nit ?? "").trim()
                                const nitOld = String(oldRow.nit ?? "").trim()
                                const updated = nitNew !== nitOld ? { ...newRow, id_prestador: null } : newRow
                                setDraftRows((prev) => prev.map((r) => (r.id_staging === updated.id_staging ? (updated as DraftRow) : r)))
                                return updated
                            }}
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    )
}
