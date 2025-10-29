import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Prestador = {
  id_prestador: number;
  nombre: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  id_sspd: string | null;
  id_autoridad_sanitaria: string | null;
};

export default function Prestadores() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrestador, setEditingPrestador] = useState<Prestador | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    id_sspd: '',
    id_autoridad_sanitaria: '',
  });

  const queryClient = useQueryClient();

  const { data: prestadores, isLoading } = useQuery({
    queryKey: ['prestadores', search],
    queryFn: async () => {
      let query = supabase.from('prestador').select('*').order('nombre');
      
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,nit.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Prestador[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('prestador').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador creado exitosamente');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Error al crear prestador', {
        description: error.message
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const { error } = await supabase
        .from('prestador')
        .update(data)
        .eq('id_prestador', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador actualizado exitosamente');
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Error al actualizar prestador', {
        description: error.message
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('prestador')
        .delete()
        .eq('id_prestador', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores'] });
      toast.success('Prestador eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar prestador', {
        description: error.message
      });
    },
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      nit: '',
      direccion: '',
      telefono: '',
      id_sspd: '',
      id_autoridad_sanitaria: '',
    });
    setEditingPrestador(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrestador) {
      updateMutation.mutate({ id: editingPrestador.id_prestador, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (prestador: Prestador) => {
    setEditingPrestador(prestador);
    setFormData({
      nombre: prestador.nombre,
      nit: prestador.nit || '',
      direccion: prestador.direccion || '',
      telefono: prestador.telefono || '',
      id_sspd: prestador.id_sspd || '',
      id_autoridad_sanitaria: prestador.id_autoridad_sanitaria || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de eliminar este prestador?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prestadores</h1>
          <p className="text-muted-foreground">Gestión de prestadores de servicios</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Prestador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPrestador ? 'Editar Prestador' : 'Nuevo Prestador'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT</Label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_sspd">ID SSPD</Label>
                  <Input
                    id="id_sspd"
                    value={formData.id_sspd}
                    onChange={(e) => setFormData({ ...formData, id_sspd: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="id_autoridad_sanitaria">ID Autoridad Sanitaria</Label>
                  <Input
                    id="id_autoridad_sanitaria"
                    value={formData.id_autoridad_sanitaria}
                    onChange={(e) => setFormData({ ...formData, id_autoridad_sanitaria: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingPrestador ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Prestadores</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o NIT..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>ID SSPD</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prestadores && prestadores.length > 0 ? (
                  prestadores.map((prestador) => (
                    <TableRow key={prestador.id_prestador}>
                      <TableCell className="font-medium">{prestador.nombre}</TableCell>
                      <TableCell>{prestador.nit || '-'}</TableCell>
                      <TableCell>{prestador.telefono || '-'}</TableCell>
                      <TableCell>{prestador.id_sspd || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(prestador)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(prestador.id_prestador)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No se encontraron prestadores
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}