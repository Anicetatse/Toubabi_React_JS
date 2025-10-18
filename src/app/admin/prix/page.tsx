'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Home,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminPrix, usePrixReferences, useSousCategories, useCreatePrix, useUpdatePrix, useDeletePrix } from '@/hooks/useAdmin';

interface Prix {
  id: number;
  id_quartier?: number;
  code_categorie?: string;
  code_sous_categorie?: string;
  prix_min_location?: number;
  prix_moy_location?: number;
  prix_max_location?: number;
  prix_min_vente?: number;
  prix_moy_vente?: number;
  prix_max_vente?: number;
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
  categorie?: {
    code: string;
    nom: string;
  };
  souscategorie?: {
    code: string;
    nom: string;
  };
}

interface Quartier {
  id: number;
  nom: string;
  commune: string;
  commune_id: number;
}

interface Categorie {
  code: string;
  nom: string;
}

interface SousCategorie {
  code: string;
  nom: string;
}

export default function AdminPrixPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'quartier' | 'categorie'>('quartier');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  
  // Hooks pour les données - charger TOUS les prix pour le tri côté client
  const { data: prixData, isLoading } = useAdminPrix(1, 1000, ''); // Charger tous les prix
  const { data: referencesData } = usePrixReferences();
  
  // États pour les dialogues
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [editDialog, setEditDialog] = useState({ open: false, prix: null as Prix | null });
  const [viewDialog, setViewDialog] = useState({ open: false, prix: null as Prix | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, prix: null as Prix | null });
  
  // États pour les sous-catégories (chargement dynamique)
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const { data: sousCategoriesData } = useSousCategories(selectedCategorie);
  
  // Mutations
  const createMutation = useCreatePrix();
  const updateMutation = useUpdatePrix();
  const deleteMutation = useDeletePrix();
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    id_quartier: '',
    code_categorie: '',
    code_sous_categorie: '',
    prix_min_location: '',
    prix_moy_location: '',
    prix_max_location: '',
    prix_min_vente: '',
    prix_moy_vente: '',
    prix_max_vente: ''
  });
  
  // Extraire les données des hooks
  const allPrix = prixData?.data || [];
  const quartiers = referencesData?.data?.quartiers || [];
  const categories = referencesData?.data?.categories || [];
  const sousCategories = sousCategoriesData?.data || [];


  // Réinitialiser la page quand on change la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Charger les sous-catégories quand une catégorie est sélectionnée
  useEffect(() => {
    setSelectedCategorie(formData.code_categorie);
  }, [formData.code_categorie]);

  // Fonction de tri
  const handleSort = (field: 'quartier' | 'categorie') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les prix
  const filteredPrix = allPrix.filter((p: Prix) => 
    p.quartier?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.quartier?.commune.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.categorie?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.souscategorie?.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trier les prix
  const sortedPrix = [...filteredPrix].sort((a, b) => {
    let aValue: any = sortField === 'quartier' ? a.quartier?.nom : a.categorie?.nom;
    let bValue: any = sortField === 'quartier' ? b.quartier?.nom : b.categorie?.nom;

    if (!aValue) return 1;
    if (!bValue) return -1;
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedPrix.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrix = sortedPrix.slice(startIndex, endIndex);

  // Statistiques basées sur les prix affichés (filtrés)
  const prixAvecLocation = filteredPrix.filter((p: Prix) => p.prix_moy_location);
  const prixAvecVente = filteredPrix.filter((p: Prix) => p.prix_moy_vente);
  
  const stats = {
    total_prix: filteredPrix.length,
    prix_moyen_location: prixAvecLocation.length > 0 
      ? Math.round(prixAvecLocation.reduce((sum: number, p: Prix) => sum + (p.prix_moy_location || 0), 0) / prixAvecLocation.length)
      : 0,
    prix_moyen_vente: prixAvecVente.length > 0 
      ? Math.round(prixAvecVente.reduce((sum: number, p: Prix) => sum + (p.prix_moy_vente || 0), 0) / prixAvecVente.length)
      : 0,
    quartiers_avec_prix: new Set(filteredPrix.map((p: Prix) => p.quartier?.nom)).size
  };

  const resetForm = () => {
    setFormData({
      id_quartier: '',
      code_categorie: '',
      code_sous_categorie: '',
      prix_min_location: '',
      prix_moy_location: '',
      prix_max_location: '',
      prix_min_vente: '',
      prix_moy_vente: '',
      prix_max_vente: ''
    });
  };

  const handleCreate = async () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateDialog({ open: false });
        resetForm();
      }
    });
  };

  const handleUpdate = async () => {
    if (!editDialog.prix) return;
    
    updateMutation.mutate({ id: editDialog.prix.id, data: formData }, {
      onSuccess: () => {
        setEditDialog({ open: false, prix: null });
        resetForm();
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteDialog.prix) return;
    
    deleteMutation.mutate(deleteDialog.prix.id, {
      onSuccess: () => {
        setDeleteDialog({ open: false, prix: null });
      }
    });
  };

  const openEditDialog = (prixItem: Prix) => {
    setFormData({
      id_quartier: prixItem.id_quartier?.toString() || '',
      code_categorie: prixItem.code_categorie || '',
      code_sous_categorie: prixItem.code_sous_categorie || '',
      prix_min_location: prixItem.prix_min_location?.toString() || '',
      prix_moy_location: prixItem.prix_moy_location?.toString() || '',
      prix_max_location: prixItem.prix_max_location?.toString() || '',
      prix_min_vente: prixItem.prix_min_vente?.toString() || '',
      prix_moy_vente: prixItem.prix_moy_vente?.toString() || '',
      prix_max_vente: prixItem.prix_max_vente?.toString() || ''
    });
    setEditDialog({ open: true, prix: prixItem });
  };

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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="ml-4 text-gray-600">Chargement des prix...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Prix (batis)</h1>
            <p className="text-gray-600">
              Gérez les prix par quartier, catégorie et sous-catégorie
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog({ open: true })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Prix
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un prix (quartier, commune, catégorie)..."
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
                  <p className="text-sm font-medium text-gray-600">Total des Prix</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_prix}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prix Moyen Location</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.prix_moyen_location)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prix Moyen Vente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(stats.prix_moyen_vente)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des prix */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Prix ({filteredPrix.length})</CardTitle>
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
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('categorie')}
                    >
                      <div className="flex items-center gap-2">
                        Catégorie
                        {sortField === 'categorie' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sous-catégorie</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Prix Location</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Prix Vente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPrix.length > 0 ? (
                    paginatedPrix.map((prixItem: Prix) => (
                      <tr key={prixItem.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{prixItem.quartier?.nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{prixItem.quartier?.commune?.nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {prixItem.categorie?.nom || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {prixItem.souscategorie?.nom ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {prixItem.souscategorie.nom}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            {prixItem.prix_min_location && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Min:</span>
                                <span className="font-medium text-gray-700">
                                  {prixItem.prix_min_location.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            )}
                            {prixItem.prix_moy_location && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-green-600 font-medium">Moy:</span>
                                <span className="font-bold text-green-700">
                                  {prixItem.prix_moy_location.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            )}
                            {prixItem.prix_max_location && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Max:</span>
                                <span className="font-medium text-gray-700">
                                  {prixItem.prix_max_location.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            )}
                            {!prixItem.prix_min_location && !prixItem.prix_moy_location && !prixItem.prix_max_location && (
                              <span className="text-xs text-gray-400">Non renseigné</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            {prixItem.prix_min_vente && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Min:</span>
                                <span className="font-medium text-gray-700">
                                  {prixItem.prix_min_vente.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            )}
                            {prixItem.prix_moy_vente && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-blue-600 font-medium">Moy:</span>
                                <span className="font-bold text-blue-700">
                                  {prixItem.prix_moy_vente.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            )}
                            {prixItem.prix_max_vente && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Max:</span>
                                <span className="font-medium text-gray-700">
                                  {prixItem.prix_max_vente.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>
                            )}
                            {!prixItem.prix_min_vente && !prixItem.prix_moy_vente && !prixItem.prix_max_vente && (
                              <span className="text-xs text-gray-400">Non renseigné</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, prix: prixItem })}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(prixItem)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, prix: prixItem })}
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
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Aucun prix trouvé</p>
                        <p className="text-sm">Commencez par ajouter un prix indicatif</p>
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
                  totalItems={sortedPrix.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de création */}
      <Dialog open={createDialog.open} onOpenChange={(open: boolean) => setCreateDialog({ open })}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Plus className="h-5 w-5 text-red-600" />
              </div>
              Nouveau Prix Indicatif
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Créez un nouveau prix indicatif par quartier et type de bien
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            {/* Localisation */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Localisation
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="id_quartier" className="text-sm font-semibold text-gray-700">
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
            </div>

            {/* Type de bien */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                Type de bien
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code_categorie" className="text-sm font-semibold text-gray-700">
                    Catégorie *
                  </Label>
                  <SearchableSelect
                    options={categories.map((categorie: Categorie) => ({ 
                      value: categorie.code, 
                      label: categorie.nom 
                    }))}
                    value={formData.code_categorie}
                    onValueChange={(value) => setFormData({ ...formData, code_categorie: value, code_sous_categorie: '' })}
                    placeholder="Sélectionnez une catégorie"
                    searchPlaceholder="Rechercher une catégorie..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code_sous_categorie" className="text-sm font-semibold text-gray-700">
                    Sous-catégorie
                  </Label>
                  <SearchableSelect
                    options={sousCategories.map((sousCategorie: SousCategorie) => ({ 
                      value: sousCategorie.code, 
                      label: sousCategorie.nom 
                    }))}
                    value={formData.code_sous_categorie}
                    onValueChange={(value) => setFormData({ ...formData, code_sous_categorie: value })}
                    placeholder="Optionnel"
                    searchPlaceholder="Rechercher une sous-catégorie..."
                    disabled={!formData.code_categorie}
                  />
                </div>
              </div>
            </div>

            {/* Prix - Location et Vente côte à côte */}
            <div className="grid grid-cols-2 gap-4">
              {/* Prix de location */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-600" />
                  Prix de location
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="prix_min_location" className="text-sm font-medium text-gray-700">
                      Minimum
                    </Label>
                    <Input
                      id="prix_min_location"
                      type="text"
                      value={formatPriceInput(formData.prix_min_location)}
                      onChange={(e) => handlePriceChange('prix_min_location', e.target.value)}
                      placeholder="50 000"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_moy_location" className="text-sm font-semibold text-green-700">
                      Moyen *
                    </Label>
                    <Input
                      id="prix_moy_location"
                      type="text"
                      value={formatPriceInput(formData.prix_moy_location)}
                      onChange={(e) => handlePriceChange('prix_moy_location', e.target.value)}
                      placeholder="80 000"
                      className="h-10 border-green-300 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_max_location" className="text-sm font-medium text-gray-700">
                      Maximum
                    </Label>
                    <Input
                      id="prix_max_location"
                      type="text"
                      value={formatPriceInput(formData.prix_max_location)}
                      onChange={(e) => handlePriceChange('prix_max_location', e.target.value)}
                      placeholder="120 000"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Prix de vente */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Prix de vente
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="prix_min_vente" className="text-sm font-medium text-gray-700">
                      Minimum
                    </Label>
                    <Input
                      id="prix_min_vente"
                      type="text"
                      value={formatPriceInput(formData.prix_min_vente)}
                      onChange={(e) => handlePriceChange('prix_min_vente', e.target.value)}
                      placeholder="5 000 000"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_moy_vente" className="text-sm font-semibold text-blue-700">
                      Moyen *
                    </Label>
                    <Input
                      id="prix_moy_vente"
                      type="text"
                      value={formatPriceInput(formData.prix_moy_vente)}
                      onChange={(e) => handlePriceChange('prix_moy_vente', e.target.value)}
                      placeholder="15 000 000"
                      className="h-10 border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix_max_vente" className="text-sm font-medium text-gray-700">
                      Maximum
                    </Label>
                    <Input
                      id="prix_max_vente"
                      type="text"
                      value={formatPriceInput(formData.prix_max_vente)}
                      onChange={(e) => handlePriceChange('prix_max_vente', e.target.value)}
                      placeholder="25 000 000"
                      className="h-10"
                    />
                  </div>
                </div>
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
              disabled={!formData.id_quartier || !formData.code_categorie || createMutation.isPending}
              className="bg-red-600 hover:bg-red-700 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={editDialog.open} onOpenChange={(open: boolean) => setEditDialog({ open, prix: null })}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              Modifier le Prix Indicatif
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Modifiez les informations du prix indicatif
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            {/* Localisation */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Localisation
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="edit-id_quartier" className="text-sm font-semibold text-gray-700">
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
            </div>

            {/* Type de bien */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
                Type de bien
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code_categorie" className="text-sm font-semibold text-gray-700">
                    Catégorie *
                  </Label>
                  <SearchableSelect
                    options={categories.map((categorie: Categorie) => ({ 
                      value: categorie.code, 
                      label: categorie.nom 
                    }))}
                    value={formData.code_categorie}
                    onValueChange={(value) => setFormData({ ...formData, code_categorie: value, code_sous_categorie: '' })}
                    placeholder="Sélectionnez une catégorie"
                    searchPlaceholder="Rechercher une catégorie..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-code_sous_categorie" className="text-sm font-semibold text-gray-700">
                    Sous-catégorie
                  </Label>
                  <SearchableSelect
                    options={sousCategories.map((sousCategorie: SousCategorie) => ({ 
                      value: sousCategorie.code, 
                      label: sousCategorie.nom 
                    }))}
                    value={formData.code_sous_categorie}
                    onValueChange={(value) => setFormData({ ...formData, code_sous_categorie: value })}
                    placeholder="Optionnel"
                    searchPlaceholder="Rechercher une sous-catégorie..."
                    disabled={!formData.code_categorie}
                  />
                </div>
              </div>
            </div>

            {/* Prix - Location et Vente côte à côte */}
            <div className="grid grid-cols-2 gap-4">
              {/* Prix de location */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Home className="h-5 w-5 text-green-600" />
                  Prix de location
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_min_location" className="text-sm font-medium text-gray-700">
                      Minimum
                    </Label>
                    <Input
                      id="edit-prix_min_location"
                      type="text"
                      value={formatPriceInput(formData.prix_min_location)}
                      onChange={(e) => handlePriceChange('prix_min_location', e.target.value)}
                      placeholder="50 000"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_moy_location" className="text-sm font-semibold text-green-700">
                      Moyen *
                    </Label>
                    <Input
                      id="edit-prix_moy_location"
                      type="text"
                      value={formatPriceInput(formData.prix_moy_location)}
                      onChange={(e) => handlePriceChange('prix_moy_location', e.target.value)}
                      placeholder="80 000"
                      className="h-10 border-green-300 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_max_location" className="text-sm font-medium text-gray-700">
                      Maximum
                    </Label>
                    <Input
                      id="edit-prix_max_location"
                      type="text"
                      value={formatPriceInput(formData.prix_max_location)}
                      onChange={(e) => handlePriceChange('prix_max_location', e.target.value)}
                      placeholder="120 000"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Prix de vente */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Prix de vente
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_min_vente" className="text-sm font-medium text-gray-700">
                      Minimum
                    </Label>
                    <Input
                      id="edit-prix_min_vente"
                      type="text"
                      value={formatPriceInput(formData.prix_min_vente)}
                      onChange={(e) => handlePriceChange('prix_min_vente', e.target.value)}
                      placeholder="5 000 000"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_moy_vente" className="text-sm font-semibold text-blue-700">
                      Moyen *
                    </Label>
                    <Input
                      id="edit-prix_moy_vente"
                      type="text"
                      value={formatPriceInput(formData.prix_moy_vente)}
                      onChange={(e) => handlePriceChange('prix_moy_vente', e.target.value)}
                      placeholder="15 000 000"
                      className="h-10 border-blue-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix_max_vente" className="text-sm font-medium text-gray-700">
                      Maximum
                    </Label>
                    <Input
                      id="edit-prix_max_vente"
                      type="text"
                      value={formatPriceInput(formData.prix_max_vente)}
                      onChange={(e) => handlePriceChange('prix_max_vente', e.target.value)}
                      placeholder="25 000 000"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialog({ open: false, prix: null });
                resetForm();
              }}
              className="px-6"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!formData.id_quartier || !formData.code_categorie || updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation */}
      <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open, prix: null })}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              Détails du prix indicatif
            </DialogTitle>
            <DialogDescription>
              Informations complètes du prix indicatif
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.prix && (
            <div className="space-y-4">
              {/* En-tête avec informations principales */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">{viewDialog.prix.quartier?.nom || 'N/A'}</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commune</p>
                    <p className="text-base font-semibold text-gray-900">{viewDialog.prix.quartier?.commune.nom || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Catégorie</p>
                    <Badge variant="secondary" className="text-base px-3 py-1">{viewDialog.prix.categorie?.nom || 'N/A'}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sous-catégorie</p>
                    {viewDialog.prix.souscategorie?.nom ? (
                      <Badge variant="outline" className="text-base px-3 py-1">{viewDialog.prix.souscategorie.nom}</Badge>
                    ) : (
                      <p className="text-base text-gray-400">-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prix en 2 colonnes */}
              <div className="grid grid-cols-2 gap-4">
                {/* Prix de location */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 text-base">Prix de location</h4>
                  </div>
                  <div className="space-y-2">
                    {viewDialog.prix.prix_min_location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium">Min:</span>
                        <span className="font-semibold text-green-700">{viewDialog.prix.prix_min_location.toLocaleString('fr-FR')} F</span>
                      </div>
                    )}
                    {viewDialog.prix.prix_moy_location && (
                      <div className="flex justify-between">
                        <span className="text-green-600 font-semibold">Moy:</span>
                        <span className="font-bold text-green-700 text-lg">{viewDialog.prix.prix_moy_location.toLocaleString('fr-FR')} F</span>
                      </div>
                    )}
                    {viewDialog.prix.prix_max_location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium">Max:</span>
                        <span className="font-semibold text-green-700">{viewDialog.prix.prix_max_location.toLocaleString('fr-FR')} F</span>
                      </div>
                    )}
                    {!viewDialog.prix.prix_min_location && !viewDialog.prix.prix_moy_location && !viewDialog.prix.prix_max_location && (
                      <span className="text-sm text-gray-400">Non renseigné</span>
                    )}
                  </div>
                </div>
                
                {/* Prix de vente */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-800 text-base">Prix de vente</h4>
                  </div>
                  <div className="space-y-2">
                    {viewDialog.prix.prix_min_vente && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-medium">Min:</span>
                        <span className="font-semibold text-blue-700">{viewDialog.prix.prix_min_vente.toLocaleString('fr-FR')} F</span>
                      </div>
                    )}
                    {viewDialog.prix.prix_moy_vente && (
                      <div className="flex justify-between">
                        <span className="text-blue-600 font-semibold">Moy:</span>
                        <span className="font-bold text-blue-700 text-lg">{viewDialog.prix.prix_moy_vente.toLocaleString('fr-FR')} F</span>
                      </div>
                    )}
                    {viewDialog.prix.prix_max_vente && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-medium">Max:</span>
                        <span className="font-semibold text-blue-700">{viewDialog.prix.prix_max_vente.toLocaleString('fr-FR')} F</span>
                      </div>
                    )}
                    {!viewDialog.prix.prix_min_vente && !viewDialog.prix.prix_moy_vente && !viewDialog.prix.prix_max_vente && (
                      <span className="text-sm text-gray-400">Non renseigné</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewDialog({ open: false, prix: null })}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open, prix: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le prix indicatif de <strong>{deleteDialog.prix?.quartier?.nom}</strong> ({deleteDialog.prix?.categorie?.nom}) ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
