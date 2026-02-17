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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material"
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid"
import DeleteIcon from "@mui/icons-material/Delete"
import { inspeccionStaging } from "@/integrations/supabase/index"

type NitDuplicado = { nit: string; total: number }
type PrestadorOpt = { id_prestador: number; nombre: string | null; nit: string | null }
type DraftRow = inspeccionStaging & { id_prestador: number | null }

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

    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [confirmId, setConfirmId] = React.useState<number | null>(null)

    const { data: nitsDup = [], isLoading: loadingNits } = useQuery({
        queryKey: ["staging-nits-duplicados"],
        queryFn: async () => {
            const { data, error } = await supabase.from("inspeccion_staging_nits_duplicados").select("nit,total")
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
            return (data ?? []) as inspeccionStaging[]
        }
    })

    React.useEffect(() => {
        const base: DraftRow[] = (stagingRows ?? []).map((r) => ({ ...(r as any), id_prestador: null }))
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

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from("inspeccion_staging").delete().eq("id_staging", id)
            if (error) throw error
            return id
        },
        onSuccess: async (id) => {
            setDraftRows((prev) => prev.filter((x: any) => Number(x.id_staging) !== Number(id)))
            setOriginalRows((prev) => prev.filter((x: any) => Number(x.id_staging) !== Number(id)))
            await qc.invalidateQueries({ queryKey: ["staging-nits-duplicados"] })
            await qc.invalidateQueries({ queryKey: ["staging-rows-por-nit", selectedNit] })
        }
    })

    const enviarMutation = useMutation({
        mutationFn: async () => {
            const rowsToSend = draftRows.filter(isReadyRow)

            if (rowsToSend.length === 0) {
                return { inserted: 0, pending: draftRows.length, deletedIds: [] as number[] }
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

            const ids = rowsToSend.map((r: any) => Number(r.id_staging)).filter((n) => Number.isFinite(n))

            const { error: updErr } = await supabase.from("inspeccion_staging").update({ processed: true }).in("id_staging", ids)
            if (updErr) throw updErr

            const { error: delErr } = await supabase.from("inspeccion_staging").delete().in("id_staging", ids)
            if (delErr) throw delErr

            return { inserted: rowsToSend.length, pending: draftRows.length - rowsToSend.length, deletedIds: ids }
        },
        onSuccess: async (r) => {
            if (r?.deletedIds?.length) {
                setDraftRows((prev) => prev.filter((x: any) => !r.deletedIds.includes(Number(x.id_staging))))
                setOriginalRows((prev) => prev.filter((x: any) => !r.deletedIds.includes(Number(x.id_staging))))
            }
            await qc.invalidateQueries({ queryKey: ["staging-nits-duplicados"] })
            await qc.invalidateQueries({ queryKey: ["staging-rows-por-nit", selectedNit] })
        }
    })

    const columns: GridColDef[] = [
        {
            field: "__actions__",
            headerName: "",
            width: 70,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            type: "actions",
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Eliminar"
                    onClick={() => {
                        const id = Number((params.row as any).id_staging)
                        setConfirmId(Number.isFinite(id) ? id : null)
                        setConfirmOpen(true)
                    }}
                    showInMenu={false}
                />
            ]
        },
        { field: "id_staging", headerName: "ID", width: 90 },
        { field: "nit", headerName: "NIT", width: 180 },
        {
            field: "id_prestador",
            headerName: "Prestador",
            width: 320,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const nit = String((params.row as any).nit ?? "").trim()
                const opts = prestadoresPorNit.get(nit) ?? []
                const value = (params.row as any).id_prestador ?? ""
                return (
                    <FormControl fullWidth size="small" disabled={opts.length === 0}>
                        <Select
                            value={value}
                            onChange={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value)
                                setDraftRows((prev) =>
                                    prev.map((r: any) =>
                                        Number(r.id_staging) === Number((params.row as any).id_staging) ? { ...r, id_prestador: v } : r
                                    )
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
        { field: "id_inspeccion_sivicap", headerName: "ID SIVICAP", width: 160 },
        { field: "fecha_inspeccion", headerName: "Fecha inspección", width: 200 },
        { field: "autoridad_inspeccion", headerName: "Autoridad", width: 200 },
        { field: "concepto", headerName: "Concepto", width: 220 },
        { field: "estado", headerName: "Estado", width: 140 },
        { field: "habitantes_municipio", headerName: "Habitantes", width: 130 },
        { field: "viviendas", headerName: "Viviendas", width: 120 },
        { field: "viviendas_urbano", headerName: "Viviendas urbano", width: 150 },
        { field: "iraba_inspeccion", headerName: "IRABA", width: 110 },
        { field: "indice_tratamiento", headerName: "Índice trat.", width: 140 },
        { field: "indice_continuidad", headerName: "Índice cont.", width: 140 },
        { field: "bps", headerName: "BPS", width: 100 }
    ]

    const closeConfirm = () => {
        setConfirmOpen(false)
        setConfirmId(null)
    }

    const confirmDelete = async () => {
        const id = confirmId
        closeConfirm()
        if (!id) return
        await deleteMutation.mutateAsync(id)
    }

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
                        <Select label="NIT duplicado" value={selectedNit} onChange={(e) => setSelectedNit(String(e.target.value))}>
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
                            disabled={!selectedNit || draftRows.length === 0 || enviarMutation.isPending || deleteMutation.isPending}
                            onClick={() => setDraftRows(originalRows)}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="contained"
                            disabled={!selectedNit || !canSend || enviarMutation.isPending || deleteMutation.isPending}
                            onClick={() => enviarMutation.mutate()}
                        >
                            {enviarMutation.isPending ? "Enviando..." : `Enviar (${readyRows.length})`}
                        </Button>
                    </Box>
                </Box>

                {!selectedNit ? (
                    <Box sx={{ mt: 3, height: 220, display: "grid", placeItems: "center" }}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="h6" fontWeight={700}>
                                Sin resultados
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Selecciona un NIT para continuar
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ mt: 3, height: 560, width: "100%" }}>
                        <DataGrid
                            rows={draftRows as any[]}
                            columns={columns}
                            getRowId={(row: any) => Number(row.id_staging)}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableRowSelectionOnClick
                            loading={loadingRows || loadingPrestadores}
                            isCellEditable={() => false}
                        />
                    </Box>
                )}
            </Paper>

            <Dialog open={confirmOpen} onClose={closeConfirm} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary">
                        ¿Estás seguro de que deseas eliminar esta fila? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm} disabled={deleteMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
