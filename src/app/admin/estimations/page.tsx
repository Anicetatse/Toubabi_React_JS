'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  useAdminEstimations,
  usePrixReferences,
  useCreateEstimation,
  useUpdateEstimation,
  useDeleteEstimation
} from '@/hooks/useAdmin';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Building2,
  Calculator,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Home,
  Layers
} from 'lucide-react';

interface Estimation {
  id: number;
  id_quartier?: number;
  coefficient_occupa_sols?: number;
  hauteur?: number;
  niveau?: number;
  created_at?: string;
  updated_at?: string;
  quartier?: {
    id: number;
    nom: string;
    commune: {
      id: number;
      nom: string;
    };
  };
}

interface Quartier {
  id: number;
  nom: string;
  commune: string;
  commune_id: number;
}

export default function AdminEstimationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'quartier' | 'niveau'>('quartier');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  
  // Hooks React Query
  const { data: estimationsData, isLoading, error: estimationsError } = useAdminEstimations(1, 1000, '');
  const { data: referencesData, error: referencesError } = usePrixReferences();
  const createMutation = useCreateEstimation();
  const updateMutation = useUpdateEstimation();
  const deleteMutation = useDeleteEstimation();

  // Log des erreurs pour debug
  if (estimationsError) {
    console.error('Erreur chargement estimations:', estimationsError);
  }
  if (referencesError) {
    console.error('Erreur chargement références:', referencesError);
  }
  
  // États pour les dialogues
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [editDialog, setEditDialog] = useState({ open: false, estimation: null as Estimation | null });
  const [viewDialog, setViewDialog] = useState({ open: false, estimation: null as Estimation | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, estimation: null as Estimation | null });
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    id_quartier: '',
    coefficient_occupa_sols: '',
    hauteur: '',
    niveau: ''
  });

  // Fonction de tri
  const handleSort = (field: 'quartier' | 'niveau') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les estimations
  const filteredEstimations = estimations.filter((e: Estimation) => 
    e.quartier?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.quartier?.commune.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trier les estimations
  const sortedEstimations = [...filteredEstimations].sort((a, b) => {
    let aValue: any = sortField === 'quartier' ? a.quartier?.nom : a.niveau;
    let bValue: any = sortField === 'quartier' ? b.quartier?.nom : b.niveau;

    if (!aValue) return 1;
    if (!bValue) return -1;
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedEstimations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEstimations = sortedEstimations.slice(startIndex, endIndex);

  // Statistiques
  const stats = {
    total_estimations: filteredEstimations.length,
    quartiers_avec_estimations: new Set(filteredEstimations.map((e: Estimation) => e.quartier?.nom)).size,
    niveaux_moyens: filteredEstimations.length > 0 
      ? Math.round(filteredEstimations.reduce((sum: number, e: Estimation) => sum + (e.niveau || 0), 0) / filteredEstimations.filter((e: Estimation) => e.niveau).length)
      : 0
  };

  // Fonction de formatage des prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Fonction pour formater un nombre avec séparateurs de milliers
  const formatPriceInput = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fonction pour obtenir la valeur numérique (sans espaces)
  const getNumericValue = (formattedValue: string) => {
    return formattedValue.replace(/\s/g, '');
  };

  // Handler pour les champs de prix
  const handlePriceChange = (field: string, value: string) => {
    const numericValue = getNumericValue(value);
    setFormData({ ...formData, [field]: numericValue });
  };

  // Charger les données depuis les hooks
  useEffect(() => {
    if (estimationsData?.data) {
      setEstimations(estimationsData.data);
    }
  }, [estimationsData]);

  useEffect(() => {
    if (referencesData?.data?.quartiers) {
      setQuartiers(referencesData.data.quartiers);
    }
  }, [referencesData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      id_quartier: '',
      coefficient_occupa_sols: '',
      hauteur: '',
      niveau: ''
    });
  };

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setCreateDialog({ open: false });
      resetForm();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleUpdate = async () => {
    if (!editDialog.estimation) return;
    
    try {
      await updateMutation.mutateAsync({ 
        id: editDialog.estimation.id, 
        data: formData 
      });
      setEditDialog({ open: false, estimation: null });
      resetForm();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.estimation) return;
    
    try {
      await deleteMutation.mutateAsync(deleteDialog.estimation.id);
      setDeleteDialog({ open: false, estimation: null });
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const openEditDialog = (estimation: Estimation) => {
    setFormData({
      id_quartier: estimation.id_quartier?.toString() || '',
      coefficient_occupa_sols: estimation.coefficient_occupa_sols?.toString() || '',
      hauteur: estimation.hauteur?.toString() || '',
      niveau: estimation.niveau?.toString() || ''
    });
    setEditDialog({ open: true, estimation });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="ml-4 text-gray-600">Chargement des estimations...</p>
        </div>
      </AdminLayout>
    );
  }

  if (estimationsError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">Erreur de chargement</p>
            <p className="text-gray-600 text-sm">Vérifiez la console pour plus de détails</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Recharger
            </Button>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Estimations de Construction</h1>
            <p className="text-gray-600">
              Gérez les paramètres d'estimation des coûts de construction par quartier
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog({ open: true })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Estimation
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une estimation (quartier, commune)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Estimations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_estimations}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quartiers Couverts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.quartiers_avec_estimations}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Niveaux Moyens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.niveaux_moyens > 0 ? `R+${stats.niveaux_moyens}` : '-'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Layers className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des estimations */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Estimations ({filteredEstimations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('quartier')}
                    >
                      <div className="flex items-center gap-2">
                        Quartier
                        {sortField === 'quartier' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Commune</th>
                    <th 
                      className="text-center py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('niveau')}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        Niveaux
                        {sortField === 'niveau' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Hauteur (m)</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Coefficient d'occupation des sols (COS)</th>  
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEstimations.length > 0 ? (
                    paginatedEstimations.map((estimation: Estimation) => (
                      <tr key={estimation.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{estimation.quartier?.nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{estimation.quartier?.commune?.nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {estimation.niveau ? `R+${estimation.niveau}` : '-'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm text-gray-700">{estimation.hauteur ? `${estimation.hauteur} m` : '-'}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm text-gray-700">{estimation.coefficient_occupa_sols || '-'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, estimation })}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(estimation)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, estimation })}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Aucune estimation trouvée</p>
                        <p className="text-sm">Commencez par ajouter une estimation</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedEstimations.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de création - TODO */}
      <Dialog open={createDialog.open} onOpenChange={(open: boolean) => setCreateDialog({ open })}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Plus className="h-5 w-5 text-red-600" />
              </div>
              Nouvelle Estimation
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Créez une nouvelle estimation de coûts de construction
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Quartier */}
            <div className="space-y-2">
              <Label htmlFor="id_quartier" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Quartier *
              </Label>
              <SearchableSelect
                options={quartiers.map((quartier: Quartier) => ({ 
                  value: quartier.id.toString(), 
                  label: `${quartier.nom} - ${quartier.commune}` 
                }))}
                value={formData.id_quartier}
                onValueChange={(value) => setFormData({ ...formData, id_quartier: value })}
                placeholder="Sélectionnez un quartier"
                searchPlaceholder="Rechercher un quartier..."
              />
            </div>

            {/* Paramètres techniques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niveau" className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Nombre de niveaux
                </Label>
                <Input
                  id="niveau"
                  type="number"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  placeholder="Ex: 3"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hauteur" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Hauteur (m)
                </Label>
                <Input
                  id="hauteur"
                  type="number"
                  step="0.01"
                  value={formData.hauteur}
                  onChange={(e) => setFormData({ ...formData, hauteur: e.target.value })}
                  placeholder="Ex: 12.50"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coefficient_occupa_sols" className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600" />
                  COS
                </Label>
                <Input
                  id="coefficient_occupa_sols"
                  type="number"
                  step="0.01"
                  value={formData.coefficient_occupa_sols}
                  onChange={(e) => setFormData({ ...formData, coefficient_occupa_sols: e.target.value })}
                  placeholder="Ex: 0.60"
                  className="h-10"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setCreateDialog({ open: false });
                resetForm();
              }}
              className="px-6"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!formData.id_quartier || createMutation.isPending}
              className="bg-red-600 hover:bg-red-700 px-6"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={editDialog.open} onOpenChange={(open: boolean) => !open && setEditDialog({ open: false, estimation: null })}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              Modifier l'Estimation
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Modifiez les paramètres d'estimation
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Quartier */}
            <div className="space-y-2">
              <Label htmlFor="edit_id_quartier" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Quartier *
              </Label>
              <SearchableSelect
                options={quartiers.map((quartier: Quartier) => ({ 
                  value: quartier.id.toString(), 
                  label: `${quartier.nom} - ${quartier.commune}` 
                }))}
                value={formData.id_quartier}
                onValueChange={(value) => setFormData({ ...formData, id_quartier: value })}
                placeholder="Sélectionnez un quartier"
                searchPlaceholder="Rechercher un quartier..."
              />
            </div>

            {/* Paramètres techniques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_niveau" className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  Nombre de niveaux
                </Label>
                <Input
                  id="edit_niveau"
                  type="number"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  placeholder="Ex: 3"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_hauteur" className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Hauteur (m)
                </Label>
                <Input
                  id="edit_hauteur"
                  type="number"
                  step="0.01"
                  value={formData.hauteur}
                  onChange={(e) => setFormData({ ...formData, hauteur: e.target.value })}
                  placeholder="Ex: 12.50"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_coefficient_occupa_sols" className="text-sm font-medium flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600" />
                  COS
                </Label>
                <Input
                  id="edit_coefficient_occupa_sols"
                  type="number"
                  step="0.01"
                  value={formData.coefficient_occupa_sols}
                  onChange={(e) => setFormData({ ...formData, coefficient_occupa_sols: e.target.value })}
                  placeholder="Ex: 0.60"
                  className="h-10"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialog({ open: false, estimation: null });
                resetForm();
              }}
              className="px-6"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!formData.id_quartier || updateMutation.isPending}
              className="bg-red-600 hover:bg-red-700 px-6"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Modification...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open, estimation: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette estimation pour le quartier <strong>{deleteDialog.estimation?.quartier?.nom}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, estimation: null })}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de vue détaillée */}
      <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open, estimation: null })}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              Détails de l'Estimation
            </DialogTitle>
            <DialogDescription>
              Informations complètes de l'estimation
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.estimation && (
            <div className="space-y-6 py-4">
              {/* Localisation */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Quartier</p>
                    <p className="font-semibold text-gray-900">{viewDialog.estimation.quartier?.nom || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Commune</p>
                    <p className="font-semibold text-gray-900">{viewDialog.estimation.quartier?.commune?.nom || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Paramètres techniques */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Paramètres Techniques
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Niveaux</p>
                    <p className="font-semibold text-gray-900">
                      {viewDialog.estimation.niveau ? `R+${viewDialog.estimation.niveau}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hauteur</p>
                    <p className="font-semibold text-gray-900">
                      {viewDialog.estimation.hauteur ? `${viewDialog.estimation.hauteur} m` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">COS</p>
                    <p className="font-semibold text-gray-900">
                      {viewDialog.estimation.coefficient_occupa_sols || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewDialog({ open: false, estimation: null })}
              className="px-6"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </AdminLayout>
  );
}
