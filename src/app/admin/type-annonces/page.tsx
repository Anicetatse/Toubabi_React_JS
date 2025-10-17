'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  MoreHorizontal,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText
} from 'lucide-react';
import { useTypeAnnonces, useCreateTypeAnnonce, useUpdateTypeAnnonce, useDeleteTypeAnnonce } from '@/hooks/useAdmin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

interface TypeAnnonceFormData {
  nom: string;
  description: string;
}

export default function AdminTypeAnnoncesPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'id'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const [editDialog, setEditDialog] = useState<{ open: boolean; type?: any }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; typeId?: string }>({ open: false });
  const [formData, setFormData] = useState<TypeAnnonceFormData>({
    nom: '',
    description: ''
  });

  const { data: typeAnnonces, isLoading, error, refetch } = useTypeAnnonces();
  const createMutation = useCreateTypeAnnonce();
  const updateMutation = useUpdateTypeAnnonce();
  const deleteMutation = useDeleteTypeAnnonce();

  // Réinitialiser la page quand on change la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fonction de tri
  const handleSort = (field: 'nom' | 'id') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les types d'annonces
  const filteredTypes = typeAnnonces?.filter(type => 
    type.nom.toLowerCase().includes(search.toLowerCase()) ||
    type.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Trier les types d'annonces
  const sortedTypes = [...filteredTypes].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTypes = sortedTypes.slice(startIndex, endIndex);

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateDialog(false);
        setFormData({ nom: '', description: '' });
        refetch();
      }
    });
  };

  const handleEdit = (type: any) => {
    setFormData({
      nom: type.nom,
      description: type.description || ''
    });
    setEditDialog({ open: true, type });
  };

  const handleUpdate = () => {
    if (editDialog.type) {
      updateMutation.mutate(
        { id: editDialog.type.id, data: formData },
        {
          onSuccess: () => {
            setEditDialog({ open: false });
            setFormData({ nom: '', description: '' });
            refetch();
          }
        }
      );
    }
  };

  const handleDelete = (typeId: string) => {
    setDeleteDialog({ open: true, typeId });
  };

  const confirmDelete = () => {
    if (deleteDialog.typeId) {
      deleteMutation.mutate(deleteDialog.typeId, {
        onSuccess: () => {
          setDeleteDialog({ open: false });
          refetch();
        }
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-600">
          Erreur lors du chargement des types d'annonces
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Types d'Annonces</h1>
            <p className="text-gray-600">
              Gérez les types d'annonces disponibles sur la plateforme
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Type
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un type d'annonce..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Types</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeAnnonces?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Résultats</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredTypes?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des types d'annonces */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Types d'Annonces ({filteredTypes?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-2">
                        ID
                        {sortField === 'id' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('nom')}
                    >
                      <div className="flex items-center gap-2">
                        Nom
                        {sortField === 'nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTypes.length > 0 ? (
                    paginatedTypes.map((type) => (
                      <tr key={type.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm text-gray-600">#{type.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{type.nom}</p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(type)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(type.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        Aucun type d'annonce trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedTypes.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedTypes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialog de création */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Tag className="h-5 w-5 text-red-600" />
                </div>
                Nouveau Type d'Annonce
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Créez un nouveau type d'annonce pour la plateforme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                  Nom du type *
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Vente, Location, Échange..."
                  className="h-11"
                />
              </div>
              
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCreateDialog(false)}
                className="px-6"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreate}
                className="bg-red-600 hover:bg-red-700 px-6"
                disabled={!formData.nom || createMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition */}
        <Dialog open={editDialog.open} onOpenChange={(open: boolean) => setEditDialog({ open })}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                Modifier le Type d'Annonce
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Modifiez les informations du type d'annonce
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom du type *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Vente, Location, Échange..."
                  className="h-11"
                />
              </div>
              
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setEditDialog({ open: false })}
                className="px-6"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700 px-6"
                disabled={!formData.nom || updateMutation.isPending}
              >
                <Edit className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce type d'annonce ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
