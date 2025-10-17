'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus,
  MoreHorizontal,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAdminCategories, useCreateCategorie, useUpdateCategorie, useDeleteCategorie } from '@/hooks/useAdmin';
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

interface CategorieFormData {
  nom: string;
  images?: string;
  enabled: boolean;
  pro: boolean;
}

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'nombre_produits'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const [editDialog, setEditDialog] = useState<{ open: boolean; categorie?: any }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; categorieCode?: string }>({ open: false });
  const [formData, setFormData] = useState<CategorieFormData>({
    nom: '',
    images: '',
    enabled: true,
    pro: false
  });

  const { data: categories, isLoading, error } = useAdminCategories();
  const createMutation = useCreateCategorie();
  const updateMutation = useUpdateCategorie();
  const deleteMutation = useDeleteCategorie();

  // Réinitialiser la page quand on change la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fonction de tri
  const handleSort = (field: 'nom' | 'nombre_produits') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les catégories
  const filteredCategories = categories?.filter(cat => 
    cat.nom.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Trier les catégories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = sortedCategories.slice(startIndex, endIndex);

  const handleCreate = () => {
    // Le code sera généré automatiquement dans l'API à partir du nom
    const dataToCreate = {
      code: '', // Sera généré par l'API
      nom: formData.nom,
      images: formData.images,
      enabled: formData.enabled,
      pro: formData.pro
    };
    createMutation.mutate(dataToCreate, {
      onSuccess: () => {
        setCreateDialog(false);
        setFormData({ nom: '', images: '', enabled: true, pro: false });
      }
    });
  };

  const handleEdit = (categorie: any) => {
    setFormData({
      nom: categorie.nom,
      images: categorie.images || '',
      enabled: categorie.enabled,
      pro: categorie.pro
    });
    setEditDialog({ open: true, categorie });
  };

  const handleUpdate = () => {
    if (editDialog.categorie) {
      updateMutation.mutate(
        { code: editDialog.categorie.code, data: formData },
        {
          onSuccess: () => {
            setEditDialog({ open: false });
            setFormData({ nom: '', images: '', enabled: true, pro: false });
          }
        }
      );
    }
  };

  const handleDelete = (categorieCode: string) => {
    setDeleteDialog({ open: true, categorieCode });
  };

  const confirmDelete = () => {
    if (deleteDialog.categorieCode) {
      deleteMutation.mutate(deleteDialog.categorieCode);
      setDeleteDialog({ open: false });
    }
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
          Erreur lors du chargement des catégories
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
            <p className="text-gray-600">
              Gérez toutes les catégories de biens immobiliers
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Catégorie
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Catégories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Catégories Actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories?.filter(c => c.enabled).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Catégories Pro</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories?.filter(c => c.pro).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des catégories */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Catégories ({filteredCategories?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
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
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('nombre_produits')}
                    >
                      <div className="flex items-center gap-2">
                        Nombre d'annonces
                        {sortField === 'nombre_produits' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((categorie) => (
                      <tr key={categorie.code} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{categorie.nom}</p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {categorie.nombre_produits} bien(s)
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {categorie.pro ? (
                            <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
                          ) : (
                            <Badge variant="outline">Particulier</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={categorie.enabled ? "default" : "secondary"}
                            className={categorie.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {categorie.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(categorie)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  if ((categorie.nombre_produits || 0) > 0) {
                                    toast.error(
                                      `Impossible de supprimer la catégorie. ${categorie.nombre_produits} produit(s) y sont liés.`,
                                      { duration: 5000 }
                                    );
                                  } else {
                                    handleDelete(categorie.code);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer {(categorie.nombre_produits || 0) > 0 && `(${categorie.nombre_produits} produit(s))`}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Aucune catégorie trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedCategories.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedCategories.length}
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
                Nouvelle Catégorie
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Créez une nouvelle catégorie de biens immobiliers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                  Nom de la catégorie *
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Saisissez le nom de la catégorie"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                    Catégorie active
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="pro"
                    checked={formData.pro}
                    onChange={(e) => setFormData({ ...formData, pro: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="pro" className="text-sm font-medium cursor-pointer">
                    Catégorie professionnelle
                  </Label>
                </div>
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
                Modifier la Catégorie
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Modifiez les informations de la catégorie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom de la catégorie *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Saisissez le nom de la catégorie"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="edit-enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="edit-enabled" className="text-sm font-medium cursor-pointer">
                    Catégorie active
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="edit-pro"
                    checked={formData.pro}
                    onChange={(e) => setFormData({ ...formData, pro: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="edit-pro" className="text-sm font-medium cursor-pointer">
                    Catégorie professionnelle
                  </Label>
                </div>
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
                Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
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