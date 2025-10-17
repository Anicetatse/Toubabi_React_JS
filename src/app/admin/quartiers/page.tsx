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
  ToggleRight
} from 'lucide-react';
import { 
  useQuartiers, 
  useCreateQuartier, 
  useUpdateQuartier, 
  useUpdateQuartierStatus,
  useDeleteQuartier,
  useCommunes 
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

interface QuartierFormData {
  nom: string;
  id_commune: string;
  enabled: boolean;
  lat?: string;
  lng?: string;
  prix_venal?: string;
  prix_marchand?: string;
  prix_moyen?: string;
}

export default function AdminQuartiersPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'commune_nom' | 'enabled'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;

  // Fonction pour formater un nombre avec séparateurs de milliers
  const formatPrice = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fonction pour obtenir la valeur numérique (sans espaces)
  const getNumericValue = (formattedValue: string) => {
    return formattedValue.replace(/\s/g, '');
  };
  const [editDialog, setEditDialog] = useState<{ open: boolean; quartier?: any }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; quartierId?: string }>({ open: false });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; quartier?: any }>({ open: false });
  const [formData, setFormData] = useState<QuartierFormData>({
    nom: '',
    id_commune: '',
    enabled: true,
    lat: '',
    lng: '',
    prix_venal: '',
    prix_marchand: '',
    prix_moyen: ''
  });

  const { data: quartiers, isLoading, error, refetch } = useQuartiers();
  const { data: communes } = useCommunes();
  const createMutation = useCreateQuartier();
  const updateMutation = useUpdateQuartier();
  const updateStatusMutation = useUpdateQuartierStatus();
  const deleteMutation = useDeleteQuartier();

  // Réinitialiser la page quand on change la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fonction de tri
  const handleSort = (field: 'nom' | 'commune_nom' | 'enabled') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les quartiers
  const filteredQuartiers = quartiers?.filter(quartier => 
    quartier.nom.toLowerCase().includes(search.toLowerCase()) ||
    quartier.commune_nom?.toLowerCase().includes(search.toLowerCase()) ||
    quartier.ville_nom?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Trier les quartiers
  const sortedQuartiers = [...filteredQuartiers].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedQuartiers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuartiers = sortedQuartiers.slice(startIndex, endIndex);

  const handleCreate = () => {
    const data = {
      nom: formData.nom,
      id_commune: formData.id_commune,
      enabled: formData.enabled,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
      prix_venal: formData.prix_venal ? parseInt(getNumericValue(formData.prix_venal)) : null,
      prix_marchand: formData.prix_marchand ? parseInt(getNumericValue(formData.prix_marchand)) : null,
      prix_moyen: formData.prix_moyen ? parseInt(getNumericValue(formData.prix_moyen)) : null,
    };
    
    createMutation.mutate(data, {
      onSuccess: () => {
        setCreateDialog(false);
        setFormData({ nom: '', id_commune: '', enabled: true, lat: '', lng: '', prix_venal: '', prix_marchand: '', prix_moyen: '' });
        refetch();
      }
    });
  };

  const handleEdit = (quartier: any) => {
    setFormData({
      nom: quartier.nom,
      id_commune: quartier.id_commune,
      enabled: quartier.enabled === 1,
      lat: quartier.lat?.toString() || '',
      lng: quartier.lng?.toString() || '',
      prix_venal: quartier.prix_venal ? formatPrice(quartier.prix_venal.toString()) : '',
      prix_marchand: quartier.prix_marchand ? formatPrice(quartier.prix_marchand.toString()) : '',
      prix_moyen: quartier.prix_moyen ? formatPrice(quartier.prix_moyen.toString()) : ''
    });
    setEditDialog({ open: true, quartier });
  };

  const handleUpdate = () => {
    if (editDialog.quartier) {
      const data = {
        nom: formData.nom,
        id_commune: formData.id_commune,
        enabled: formData.enabled,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        prix_venal: formData.prix_venal ? parseInt(getNumericValue(formData.prix_venal)) : null,
        prix_marchand: formData.prix_marchand ? parseInt(getNumericValue(formData.prix_marchand)) : null,
        prix_moyen: formData.prix_moyen ? parseInt(getNumericValue(formData.prix_moyen)) : null,
      };

      updateMutation.mutate(
        { id: editDialog.quartier.id, data },
        {
          onSuccess: () => {
            setEditDialog({ open: false });
            setFormData({ nom: '', id_commune: '', enabled: true, lat: '', lng: '', prix_venal: '', prix_marchand: '', prix_moyen: '' });
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

  const handleDelete = (quartierId: string) => {
    setDeleteDialog({ open: true, quartierId });
  };

  const confirmDelete = () => {
    if (deleteDialog.quartierId) {
      deleteMutation.mutate(deleteDialog.quartierId, {
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
          Erreur lors du chargement des quartiers
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Quartiers</h1>
            <p className="text-gray-600">
              Gérez les quartiers de la plateforme
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Quartier
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un quartier..."
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
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quartiers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quartiers?.length || 0}
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
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quartiers?.filter(q => q.enabled === 1).length || 0}
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
                  <p className="text-sm font-medium text-gray-600">Inactifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {quartiers?.filter(q => q.enabled === 0).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des quartiers */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Quartiers ({filteredQuartiers?.length || 0})</CardTitle>
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
                      onClick={() => handleSort('commune_nom')}
                    >
                      <div className="flex items-center gap-2">
                        Commune / Ville
                        {sortField === 'commune_nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Coordonnées GPS</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Annonces Enregistrées</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Annonces Activées</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Annonces en Attente</th>
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
                  {paginatedQuartiers.length > 0 ? (
                    paginatedQuartiers.map((quartier) => (
                      <tr key={quartier.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{quartier.nom}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">{quartier.commune_nom}</p>
                            <p className="text-xs text-gray-500">{quartier.ville_nom}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {quartier.lat && quartier.lng ? (
                            <div className="text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <span className="font-medium">Lat:</span> 
                                <span>{Number(quartier.lat)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <span className="font-medium">Lng:</span> 
                                <span>{Number(quartier.lng)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Non renseigné</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="font-semibold">
                            {quartier.total_annonces || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className="bg-green-100 text-green-800 font-semibold">
                            {quartier.annonces_actives || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className="bg-orange-100 text-orange-800 font-semibold">
                            {quartier.annonces_en_attente || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={quartier.enabled === 1 ? "default" : "secondary"}
                            className={quartier.enabled === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {quartier.enabled === 1 ? 'Actif' : 'Inactif'}
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, quartier })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(quartier)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(quartier.id, quartier.enabled)}
                              >
                                {quartier.enabled === 1 ? (
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
                                onClick={() => handleDelete(quartier.id)}
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
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        Aucun quartier trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedQuartiers.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedQuartiers.length}
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
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                Nouveau Quartier
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Créez un nouveau quartier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                  Nom du quartier *
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Angré"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune" className="text-sm font-semibold text-gray-700">
                  Commune *
                </Label>
                <SearchableSelect
                  options={communes?.map((c) => ({ 
                    value: c.id.toString(), 
                    label: c.nom 
                  })) || []}
                  value={formData.id_commune}
                  onValueChange={(value) => setFormData({ ...formData, id_commune: value })}
                  placeholder="Sélectionnez une commune"
                  searchPlaceholder="Rechercher une commune..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-sm font-semibold text-gray-700">
                    Latitude
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Ex: 5.3599"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-sm font-semibold text-gray-700">
                    Longitude
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Ex: -4.0083"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Prix */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  Prix (FCFA)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prix_venal" className="text-sm font-medium text-gray-700">
                      Prix vénal
                    </Label>
                    <Input
                      id="prix_venal"
                      type="text"
                      value={formData.prix_venal}
                      onChange={(e) => setFormData({ ...formData, prix_venal: formatPrice(e.target.value) })}
                      placeholder="Ex: 125 000 000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_marchand" className="text-sm font-medium text-gray-700">
                      Prix marchand
                    </Label>
                    <Input
                      id="prix_marchand"
                      type="text"
                      value={formData.prix_marchand}
                      onChange={(e) => setFormData({ ...formData, prix_marchand: formatPrice(e.target.value) })}
                      placeholder="Ex: 95 000 000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_moyen" className="text-sm font-medium text-gray-700">
                      Prix moyen
                    </Label>
                    <Input
                      id="prix_moyen"
                      type="text"
                      value={formData.prix_moyen}
                      onChange={(e) => setFormData({ ...formData, prix_moyen: formatPrice(e.target.value) })}
                      placeholder="Ex: 110 000 000"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="enabled" className="text-sm font-medium cursor-pointer">
                  Quartier actif
                </Label>
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
                disabled={!formData.nom || !formData.id_commune || createMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open })}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                Détails du Quartier
              </DialogTitle>
            </DialogHeader>
            {viewDialog.quartier && (
              <div className="space-y-5 py-4">
                {/* Informations générales */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations générales</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Nom</p>
                      <p className="text-base font-semibold text-gray-900">{viewDialog.quartier.nom}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Commune</p>
                      <p className="text-base text-gray-900">{viewDialog.quartier.commune_nom}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Ville</p>
                      <p className="text-base text-gray-900">{viewDialog.quartier.ville_nom}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Statut</p>
                      <Badge 
                        variant={viewDialog.quartier.enabled === 1 ? "default" : "secondary"}
                        className={viewDialog.quartier.enabled === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {viewDialog.quartier.enabled === 1 ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Coordonnées GPS */}
                {viewDialog.quartier.lat && viewDialog.quartier.lng && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Coordonnées GPS
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Latitude: </span>
                        <span className="text-gray-900">{Number(viewDialog.quartier.lat)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Longitude: </span>
                        <span className="text-gray-900">{Number(viewDialog.quartier.lng)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistiques des annonces */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Statistiques des annonces</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Enregistrées</p>
                      <Badge variant="outline" className="font-bold text-lg px-4 py-1">
                        {viewDialog.quartier.total_annonces || 0}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Activées</p>
                      <Badge className="bg-green-100 text-green-800 font-bold text-lg px-4 py-1">
                        {viewDialog.quartier.annonces_actives || 0}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">En Attente</p>
                      <Badge className="bg-orange-100 text-orange-800 font-bold text-lg px-4 py-1">
                        {viewDialog.quartier.annonces_en_attente || 0}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Prix */}
                {(viewDialog.quartier.prix_venal || viewDialog.quartier.prix_marchand || viewDialog.quartier.prix_moyen) && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-gray-900 mb-3">Prix du quartier (FCFA)</h3>
                    <div className="space-y-2">
                      {viewDialog.quartier.prix_venal && (
                        <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                          <span className="font-medium text-gray-700">Prix vénal</span>
                          <span className="text-lg font-bold text-gray-900">
                            {parseInt(viewDialog.quartier.prix_venal).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      )}
                      {viewDialog.quartier.prix_marchand && (
                        <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                          <span className="font-medium text-gray-700">Prix marchand</span>
                          <span className="text-lg font-bold text-gray-900">
                            {parseInt(viewDialog.quartier.prix_marchand).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      )}
                      {viewDialog.quartier.prix_moyen && (
                        <div className="flex justify-between items-center p-2 bg-white rounded border border-green-200">
                          <span className="font-medium text-gray-700">Prix moyen</span>
                          <span className="text-lg font-bold text-gray-900">
                            {parseInt(viewDialog.quartier.prix_moyen).toLocaleString('fr-FR')} FCFA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setViewDialog({ open: false })}
                className="px-6"
              >
                Fermer
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
                Modifier le Quartier
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Modifiez les informations du quartier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom du quartier *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Angré"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-commune">Commune *</Label>
                <SearchableSelect
                  options={communes?.map((c) => ({ 
                    value: c.id.toString(), 
                    label: c.nom 
                  })) || []}
                  value={formData.id_commune}
                  onValueChange={(value) => setFormData({ ...formData, id_commune: value })}
                  placeholder="Sélectionnez une commune"
                  searchPlaceholder="Rechercher une commune..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-lat">Latitude</Label>
                  <Input
                    id="edit-lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="Ex: 5.3599"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lng">Longitude</Label>
                  <Input
                    id="edit-lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="Ex: -4.0083"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Prix */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  Prix (FCFA)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_venal" className="text-sm font-medium text-gray-700">
                      Prix vénal
                    </Label>
                    <Input
                      id="edit-prix_venal"
                      type="text"
                      value={formData.prix_venal}
                      onChange={(e) => setFormData({ ...formData, prix_venal: formatPrice(e.target.value) })}
                      placeholder="Ex: 125 000 000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_marchand" className="text-sm font-medium text-gray-700">
                      Prix marchand
                    </Label>
                    <Input
                      id="edit-prix_marchand"
                      type="text"
                      value={formData.prix_marchand}
                      onChange={(e) => setFormData({ ...formData, prix_marchand: formatPrice(e.target.value) })}
                      placeholder="Ex: 95 000 000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_moyen" className="text-sm font-medium text-gray-700">
                      Prix moyen
                    </Label>
                    <Input
                      id="edit-prix_moyen"
                      type="text"
                      value={formData.prix_moyen}
                      onChange={(e) => setFormData({ ...formData, prix_moyen: formatPrice(e.target.value) })}
                      placeholder="Ex: 110 000 000"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="edit-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <Label htmlFor="edit-enabled" className="text-sm font-medium cursor-pointer">
                  Quartier actif
                </Label>
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
                disabled={!formData.nom || !formData.id_commune || updateMutation.isPending}
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
                Êtes-vous sûr de vouloir supprimer ce quartier ? Cette action est irréversible.
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
