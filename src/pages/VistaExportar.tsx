import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Box,
    Typography,
    TextField,
    Paper,
    Button,
    CircularProgress,
    InputAdornment,
    Chip,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Search, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function VistaExportar() {
    const [search, setSearch] = useState("");
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50, // Aumentado para mejor rendimiento
    });

    // ✅ Llamada a la función merge()
    const { data, isLoading, error } = useQuery({
        queryKey: ["merge"],
        queryFn: async () => {
            const { data, error } = await supabase.rpc("merge");
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000, // Cache por 5 minutos
        refetchOnWindowFocus: false, // No recargar al cambiar de ventana
    });

    const mergedData = data || [];

    // ✅ Filtrado optimizado con useMemo
    const filteredData = useMemo(() => {
        if (!search.trim()) return mergedData;

        const searchLower = search.toLowerCase();
        return mergedData.filter((row) => {
            const values = Object.values(row).join(" ").toLowerCase();
            return values.includes(searchLower);
        });
    }, [mergedData, search]);

    // ✅ Columnas dinámicas memoizadas
    const columns: GridColDef[] = useMemo(() => {
        if (mergedData.length === 0) return [];

        return Object.keys(mergedData[0]).map((key) => ({
            field: key,
            headerName: key.replace(/_/g, " ").toUpperCase(),
            flex: 1,
            minWidth: 150,
            // Optimización: renderizar como texto simple
            renderCell: (params) => params.value?.toString() || '',
        }));
    }, [mergedData]);

    // ✅ Exportar a Excel optimizado
    const exportToExcel = () => {
        if (!mergedData.length) return;

        try {
            const ws = XLSX.utils.json_to_sheet(mergedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Datos");
            const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, `datos_completos_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error al exportar:', error);
        }
    };

    return (
        <Box sx={{
            textAlign: 'left',
            width: '100%',
            maxWidth: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Encabezado */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexShrink: 0 }}>
                <Box>
                    <Typography variant="h3" fontWeight="bold" gutterBottom>
                        Exportar Información
                    </Typography>
                    <Typography color="text.secondary">
                        Vista previa y exportación de todos los datos relacionados
                    </Typography>
                    {!isLoading && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Chip
                                label={`Total: ${mergedData.length} registros`}
                                color="primary"
                                size="small"
                            />
                            {search && (
                                <Chip
                                    label={`Filtrados: ${filteredData.length}`}
                                    color="secondary"
                                    size="small"
                                />
                            )}
                        </Box>
                    )}
                </Box>

                <Button
                    variant="contained"
                    startIcon={<FileDown size={20} />}
                    onClick={exportToExcel}
                    disabled={!mergedData.length}
                >
                    Exportar Excel
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 3, mb: 3, flexShrink: 0 }}>
                <TextField
                    fullWidth
                    placeholder="Buscar entre todos los campos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Vista previa con scroll */}
            <Paper sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">
                        Error cargando datos: {error.message}
                    </Typography>
                ) : filteredData.length > 0 ? (
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <DataGrid
                            rows={filteredData}
                            columns={columns}
                            getRowId={(row) => row.uid ?? row.id_prestador ?? row.codigo ?? Math.random()}
                            disableRowSelectionOnClick
                            disableColumnFilter
                            disableColumnMenu
                            disableDensitySelector
                            pagination
                            paginationMode="client"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}

                            rowHeight={52}
                            columnHeaderHeight={56}
                            loading={isLoading}
                            sx={{
                                height: '100%',
                                border: 'none',
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                },
                                '& .MuiDataGrid-cell:focus': {
                                    outline: 'none'
                                },
                                '& .MuiDataGrid-cell:focus-within': {
                                    outline: 'none'
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: 'action.hover',
                                    fontWeight: 'bold',
                                    borderBottom: '2px solid',
                                    borderColor: 'divider',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                },
                                '& .MuiDataGrid-virtualScroller': {
                                    backgroundColor: 'background.paper',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'action.hover',
                                },
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography color="text.secondary">
                            {search ? 'No se encontraron resultados para tu búsqueda' : 'No hay datos para mostrar'}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}