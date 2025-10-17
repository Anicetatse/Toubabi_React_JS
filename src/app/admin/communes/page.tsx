'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  MoreHorizontal,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Upload,
  X as XIcon,
  ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { 
  useCommunes, 
  useCreateCommune, 
  useUpdateCommune, 
  useUpdateCommuneStatus,
  useDeleteCommune,
  useVilles 
} from '@/hooks/useAdmin';
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

interface CommuneFormData {
  nom: string;
  id_ville: string;
  image?: string;
  enabled: boolean;
}

export default function AdminCommunesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'ville_nom' | 'enabled'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  const [viewDialog, setViewDialog] = useState<{ open: boolean; commune?: any }>({ open: false });
  const [editDialog, setEditDialog] = useState<{ open: boolean; commune?: any }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; communeId?: string }>({ open: false });
  const [formData, setFormData] = useState<CommuneFormData>({
    nom: '',
    id_ville: '',
    image: '',
    enabled: true
  });
  const [uploading, setUploading] = useState(false);

  const { data: communes, isLoading, error, refetch } = useCommunes();
  const { data: villes } = useVilles();
  const createMutation = useCreateCommune();
  const updateMutation = useUpdateCommune();
  const updateStatusMutation = useUpdateCommuneStatus();
  const deleteMutation = useDeleteCommune();

  // Réinitialiser la page quand on change la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fonction de tri
  const handleSort = (field: 'nom' | 'ville_nom' | 'enabled') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les communes
  const filteredCommunes = communes?.filter(commune => {
    const matchesSearch = commune.nom.toLowerCase().includes(search.toLowerCase()) ||
                         commune.ville_nom?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && commune.enabled === 1) ||
                         (statusFilter === 'inactive' && commune.enabled === 0);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Trier les communes
  const sortedCommunes = [...filteredCommunes].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedCommunes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommunes = sortedCommunes.slice(startIndex, endIndex);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await fetch('/api/upload-commune-image', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, image: data.path });
        toast.success('Image uploadée avec succès');
      } else {
        toast.error('Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateDialog(false);
        setFormData({ nom: '', id_ville: '', image: '', enabled: true });
        refetch();
      }
    });
  };

  const handleEdit = (commune: any) => {
    setFormData({
      nom: commune.nom,
      id_ville: commune.id_ville,
      image: commune.image || '',
      enabled: commune.enabled === 1
    });
    setEditDialog({ open: true, commune });
  };

  const handleUpdate = () => {
    if (editDialog.commune) {
      updateMutation.mutate(
        { id: editDialog.commune.id, data: formData },
        {
          onSuccess: () => {
            setEditDialog({ open: false });
            setFormData({ nom: '', id_ville: '', image: '', enabled: true });
            refetch();
          }
        }
      );
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        enabled: currentStatus === 1 ? 0 : 1
      });
      refetch();
    } catch (error) {
      // Les erreurs sont gérées par le hook
    }
  };

  const handleDelete = (communeId: string) => {
    setDeleteDialog({ open: true, communeId });
  };

  const confirmDelete = () => {
    if (deleteDialog.communeId) {
      deleteMutation.mutate(deleteDialog.communeId, {
        onSuccess: () => {
          setDeleteDialog({ open: false });
          refetch();
        }
      });
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
          Erreur lors du chargement des communes
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Communes</h1>
            <p className="text-gray-600">
              Gérez les communes de la plateforme
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Commune
          </Button>
        </div>

        {/* Recherche et Filtres */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher une commune ou ville..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="inactive">Inactives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Communes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {communes?.length || 0}
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
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {communes?.filter(c => c.enabled === 1).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <EyeOff className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inactives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {communes?.filter(c => c.enabled === 0).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des communes */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Communes ({filteredCommunes?.length || 0})</CardTitle>
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
                      onClick={() => handleSort('ville_nom')}
                    >
                      <div className="flex items-center gap-2">
                        Ville
                        {sortField === 'ville_nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Annonces Enregistrées
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Annonces Activées
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">
                      Annonces en Attente
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('enabled')}
                    >
                      <div className="flex items-center gap-2">
                        Statut
                        {sortField === 'enabled' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCommunes.length > 0 ? (
                    paginatedCommunes.map((commune) => (
                      <tr key={commune.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{commune.nom}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">{commune.ville_nom}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="font-semibold">
                            {commune.total_annonces || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className="bg-green-100 text-green-800 font-semibold">
                            {commune.annonces_actives || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className="bg-orange-100 text-orange-800 font-semibold">
                            {commune.annonces_en_attente || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={commune.enabled === 1 ? "default" : "secondary"}
                            className={commune.enabled === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {commune.enabled === 1 ? 'Active' : 'Inactive'}
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, commune })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(commune)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(commune.id, commune.enabled)}
                              >
                                {commune.enabled === 1 ? (
                                  <>
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="h-4 w-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(commune.id)}
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
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Aucune commune trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedCommunes.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedCommunes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, commune: null })}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                Détails de la Commune
              </DialogTitle>
            </DialogHeader>
            
            {viewDialog.commune && (
              <div className="space-y-6 py-4">
                {/* En-tête avec nom */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{viewDialog.commune.nom}</h3>
                  <p className="text-sm text-gray-600">Ville : {viewDialog.commune.ville_nom}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge 
                      variant={viewDialog.commune.enabled === 1 ? "default" : "secondary"}
                      className={viewDialog.commune.enabled === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {viewDialog.commune.enabled === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Image */}
                {viewDialog.commune.image && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image de la commune
                    </Label>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={viewDialog.commune.image}
                        alt={viewDialog.commune.nom}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Statistiques annonces */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Statistiques des annonces
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {viewDialog.commune.total_annonces || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 mb-1">Activées</p>
                      <p className="text-2xl font-bold text-green-900">
                        {viewDialog.commune.annonces_actives || 0}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600 mb-1">En attente</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {viewDialog.commune.annonces_en_attente || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setViewDialog({ open: false, commune: null })}
                className="px-6"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de création */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                Nouvelle Commune
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Créez une nouvelle commune
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 gap-5">
                {/* Informations de base */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    Informations de base
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                      Nom de la commune *
                    </Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Cocody"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ville" className="text-sm font-semibold text-gray-700">
                      Ville *
                    </Label>
                    <SearchableSelect
                      options={villes?.map((v) => ({ 
                        value: v.id.toString(), 
                        label: v.nom 
                      })) || []}
                      value={formData.id_ville}
                      onValueChange={(value) => setFormData({ ...formData, id_ville: value })}
                      placeholder="Sélectionnez une ville"
                      searchPlaceholder="Rechercher une ville..."
                    />
                  </div>
                </div>

                {/* Image et statut */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                    Options
                  </h3>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image de la commune
                    </Label>
                    
                    {/* Prévisualisation si image existe */}
                    {formData.image && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={formData.image}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <Label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                      Commune active (visible sur le site)
                    </Label>
                  </div>
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
                disabled={!formData.nom || !formData.id_ville || createMutation.isPending}
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
                Modifier la Commune
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Modifiez les informations de la commune
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 gap-5">
                {/* Informations de base */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    Informations de base
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-nom">Nom de la commune *</Label>
                    <Input
                      id="edit-nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Cocody"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-ville">Ville *</Label>
                    <SearchableSelect
                      options={villes?.map((v) => ({ 
                        value: v.id.toString(), 
                        label: v.nom 
                      })) || []}
                      value={formData.id_ville}
                      onValueChange={(value) => setFormData({ ...formData, id_ville: value })}
                      placeholder="Sélectionnez une ville"
                      searchPlaceholder="Rechercher une ville..."
                    />
                  </div>
                </div>

                {/* Image et statut */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image de la commune
                    </Label>
                    
                    {/* Prévisualisation si image existe */}
                    {formData.image && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={formData.image}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Upload */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="edit-enabled"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <Label htmlFor="edit-enabled" className="text-sm font-medium cursor-pointer">
                      Commune active (visible sur le site)
                    </Label>
                  </div>
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
                disabled={!formData.nom || !formData.id_ville || updateMutation.isPending}
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
                Êtes-vous sûr de vouloir supprimer cette commune ? Cette action est irréversible.
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
