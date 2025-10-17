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
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { RichTextEditor } from '@/components/RichTextEditor';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Home,
  MapPin,
  Calendar,
  User,
  FileText,
  Building2,
  Image as ImageIcon
} from 'lucide-react';
import { useAdminAnnonces, useUpdateAnnonceStatus, useUpdateAnnonce, useDeleteAnnonce, useAnnoncesStats } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

interface AnnonceAdmin {
  code: string;
  nom: string;
  description: string;
  image?: string; // JSON string avec array d'images
  prix_vente: string; // Converti en string depuis BigInt
  surface: number;
  piece: number;
  chambre: number;
  type_annonce: string;
  enabled: number;
  client_nom?: string;
  client_prenom?: string;
  client_email?: string;
  commune_nom?: string;
  quartier_nom?: string;
  categorie_nom?: string;
  souscategorie_nom?: string;
  created_at: string;
  updated_at?: string;
}

type SortField = 'nom' | 'prix_vente' | 'surface' | 'type_annonce' | 'enabled' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function AdminAnnoncesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [itemsPerPage] = useState(10);
  
  const [viewDialog, setViewDialog] = useState<{ open: boolean; annonce: AnnonceAdmin | null }>({
    open: false,
    annonce: null
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; annonce: AnnonceAdmin | null }>({
    open: false,
    annonce: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; annonce: AnnonceAdmin | null }>({
    open: false,
    annonce: null
  });

  // État pour le formulaire d'édition
  const [editFormData, setEditFormData] = useState({
    nom: '',
    description: '',
    prix_vente: '0',
    surface: 0,
    piece: 0,
    chambre: 0,
    type_annonce: 'louer',
    images: [] as string[]
  });

  // Fetch data
  const { data: annoncesData, isLoading, refetch } = useAdminAnnonces(1, 1000000, '', undefined);
  const { data: statsData } = useAnnoncesStats();
  const updateStatusMutation = useUpdateAnnonceStatus();
  const updateAnnonceMutation = useUpdateAnnonce();
  const deleteMutation = useDeleteAnnonce();

  // Client-side filtering and sorting
  const filteredAnnonces = annoncesData?.data?.filter((annonce: AnnonceAdmin) => {
    const matchesSearch = annonce.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.client_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && annonce.enabled === 1) ||
                         (statusFilter === 'inactive' && annonce.enabled === 0);
    
    const matchesType = typeFilter === 'all' || annonce.type_annonce === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Sort data
  const sortedAnnonces = [...filteredAnnonces].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'prix_vente') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    } else if (sortField === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else {
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedAnnonces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAnnonces = sortedAnnonces.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleToggleStatus = async (code: string, currentStatus: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        code,
        enabled: currentStatus === 1 ? 0 : 1
      });
      refetch();
    } catch (error) {
      // Les erreurs sont déjà gérées par le hook
    }
  };

  const handleEdit = (annonce: AnnonceAdmin) => {
    setEditFormData({
      nom: annonce.nom,
      description: annonce.description || '',
      prix_vente: annonce.prix_vente,
      surface: annonce.surface,
      piece: annonce.piece,
      chambre: annonce.chambre,
      type_annonce: annonce.type_annonce,
      images: parseImages(annonce.image)
    });
    setEditDialog({ open: true, annonce });
  };

  const handleUpdate = async () => {
    if (!editDialog.annonce) return;
    
    try {
      // Nettoyer le prix (retirer les espaces et convertir en nombre)
      const cleanPrice = editFormData.prix_vente.replace(/\s/g, '');
      
      await updateAnnonceMutation.mutateAsync({
        code: editDialog.annonce.code,
        data: {
          nom: editFormData.nom,
          description: editFormData.description,
          prix_vente: cleanPrice,
          surface: editFormData.surface,
          piece: editFormData.piece,
          chambre: editFormData.chambre,
          type_annonce: editFormData.type_annonce,
          images: editFormData.images
        }
      });
      
      setEditDialog({ open: false, annonce: null });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.annonce) return;
    
    try {
      await deleteMutation.mutateAsync(deleteDialog.annonce.code);
      setDeleteDialog({ open: false, annonce: null });
      refetch();
    } catch (error) {
      // Les erreurs sont déjà gérées par le hook
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? Number(price) : price;
    if (!numPrice || isNaN(numPrice)) {
      return 'Prix non renseigné';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatNumberWithSpaces = (value: string | number) => {
    // Convertir en string et retirer tout sauf les chiffres
    const numStr = String(value).replace(/\D/g, '');
    if (!numStr) return '';
    // Ajouter des espaces tous les 3 chiffres
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    // Décoder les entités HTML
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    const decoded = txt.value;
    // Retirer les balises HTML mais garder les retours à la ligne
    return decoded.replace(/<[^>]*>/g, '\n').replace(/\n\n+/g, '\n\n').trim();
  };

  const linkify = (text: string) => {
    if (!text) return '';
    // Détecter les URLs et les convertir en liens cliquables
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`);
  };

  const parseImages = (imageString?: string): string[] => {
    if (!imageString) return [];
    try {
      const images = JSON.parse(imageString);
      // Convertir les chemins vers le bon dossier public/assets/annonces
      const correctedImages = Array.isArray(images) 
        ? images.map(img => {
            let correctedImg = img;
            
            // Corriger tous les cas possibles vers /assets/annonces/
            if (img.includes('assets/images/annonces')) {
              correctedImg = img.replace('assets/images/annonces', 'assets/annonces');
            } else if (img.includes('/admin/assets/images/annonces/')) {
              correctedImg = img.replace('/admin/assets/images/annonces/', '/assets/annonces/');
            } else if (img.includes('/admin/assets/annonces/')) {
              correctedImg = img.replace('/admin/assets/annonces/', '/assets/annonces/');
            } else if (img.includes('admin/assets/annonces')) {
              correctedImg = img.replace('admin/assets/annonces', 'assets/annonces');
            }
            
            // S'assurer que le chemin commence par / pour éviter les problèmes de routage
            return correctedImg.startsWith('/') ? correctedImg : `/${correctedImg}`;
          })
        : [];
      return correctedImages;
    } catch {
      return [];
    }
  };

  const getStatusBadge = (enabled: number) => {
    return enabled === 1 ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Actif
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        Inactif
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'louer': 'bg-blue-100 text-blue-800',
      'acheter': 'bg-purple-100 text-purple-800'
    };
    
    const labels = {
      'louer': 'À louer',
      'acheter': 'À acheter'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[type as keyof typeof labels] || type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des annonces...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Annonces</h1>
            <p className="text-gray-600">
              Modifiez et gérez les annonces déposées par les clients
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Annonces</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData?.total?.toLocaleString() || '0'}</p>
                </div>
                <Home className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annonces Actives</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statsData?.active?.toLocaleString() || '0'}
                  </p>
                </div>
                <ToggleRight className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {statsData?.inactive?.toLocaleString() || '0'}
                  </p>
                </div>
                <ToggleLeft className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statsData?.thisMonth?.toLocaleString() || '0'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom, description, client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="louer">À louer</SelectItem>
                  <SelectItem value="acheter">À acheter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('nom')}
                    >
                      <div className="flex items-center gap-2">
                        Annonce
                        {sortField === 'nom' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('prix_vente')}
                    >
                      <div className="flex items-center gap-2">
                        Prix
                        {sortField === 'prix_vente' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('surface')}
                    >
                      <div className="flex items-center gap-2">
                        Surface
                        {sortField === 'surface' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type_annonce')}
                    >
                      <div className="flex items-center gap-2">
                        Type
                        {sortField === 'type_annonce' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('enabled')}
                    >
                      <div className="flex items-center gap-2">
                        Statut
                        {sortField === 'enabled' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortField === 'created_at' && (
                          <span className="text-xs">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAnnonces.map((annonce: AnnonceAdmin) => (
                    <tr key={annonce.code} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{annonce.nom}</p>
                           
                            {annonce.client_nom && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {annonce.client_prenom ? `${annonce.client_prenom} ${annonce.client_nom}` : annonce.client_nom}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {formatPrice(annonce.prix_vente)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {annonce.surface > 0 ? `${annonce.surface} m²` : 'Non renseigné'}
                          </p>
                          <p className="text-gray-500">{annonce.piece} pièces</p>
                          {annonce.chambre > 0 && (
                            <p className="text-gray-500">{annonce.chambre} chambres</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getTypeBadge(annonce.type_annonce)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(annonce.enabled)}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(annonce.created_at)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewDialog({ open: true, annonce })}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(annonce)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(annonce.code, annonce.enabled)}
                            >
                              {annonce.enabled === 1 ? (
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
                              onClick={() => setDeleteDialog({ open: true, annonce })}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedAnnonces.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* View Dialog */}
        <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, annonce: null })}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                Détails de l'Annonce
              </DialogTitle>
            </DialogHeader>
            
            {viewDialog.annonce && (
              <div className="space-y-6 py-4">
                {/* En-tête avec titre et prix */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{viewDialog.annonce.nom}</h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <p className="text-3xl font-bold text-blue-600">
                      {formatPrice(viewDialog.annonce.prix_vente)}
                    </p>
                    <div className="flex gap-2">
                      {getTypeBadge(viewDialog.annonce.type_annonce)}
                      {getStatusBadge(viewDialog.annonce.enabled)}
                    </div>
                  </div>
                </div>

                {/* Images */}
                {parseImages(viewDialog.annonce.image).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images ({parseImages(viewDialog.annonce.image).length})
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {parseImages(viewDialog.annonce.image).map((img, idx) => (
                        <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={img}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.png';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </Label>
                  <div 
                    className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: viewDialog.annonce.description || 'Aucune description'
                    }}
                  />
                </div>

                {/* Caractéristiques */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Caractéristiques
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Surface</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewDialog.annonce.surface > 0 ? `${viewDialog.annonce.surface} m²` : 'Non renseigné'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Pièces</p>
                      <p className="text-lg font-semibold text-gray-900">{viewDialog.annonce.piece}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Chambres</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewDialog.annonce.chambre > 0 ? viewDialog.annonce.chambre : 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Localisation */}
                {(viewDialog.annonce.commune_nom || viewDialog.annonce.quartier_nom) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localisation
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {[viewDialog.annonce.quartier_nom, viewDialog.annonce.commune_nom]
                          .filter(Boolean)
                          .join(', ') || 'Non renseignée'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Catégorie */}
                {viewDialog.annonce.categorie_nom && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Catégorie
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {viewDialog.annonce.categorie_nom}
                        {viewDialog.annonce.souscategorie_nom && ` › ${viewDialog.annonce.souscategorie_nom}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Annonceur */}
                {viewDialog.annonce.client_nom && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Annonceur
                    </Label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium">
                        {viewDialog.annonce.client_prenom ? `${viewDialog.annonce.client_prenom} ${viewDialog.annonce.client_nom}` : viewDialog.annonce.client_nom}
                      </p>
                      {viewDialog.annonce.client_email && (
                        <p className="text-sm text-gray-600 mt-1">{viewDialog.annonce.client_email}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date de création
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-900">{formatDate(viewDialog.annonce.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setViewDialog({ open: false, annonce: null })}
                className="px-6"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, annonce: null })}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3 pb-4 border-b sticky top-0 bg-white z-10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                Modifier l'Annonce
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Modifiez les informations de l'annonce
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Informations générales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  Informations générales
                </h3>
                
                <div className="space-y-4 pl-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nom" className="text-sm font-semibold text-gray-700">
                      Nom de l'annonce *
                    </Label>
                    <Input
                      id="edit-nom"
                      value={editFormData.nom}
                      onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                      placeholder="Nom de l'annonce"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">
                      Description
                    </Label>
                    <RichTextEditor
                      value={editFormData.description}
                      onChange={(value) => setEditFormData({ ...editFormData, description: value })}
                      placeholder="Description de l'annonce avec formatage (gras, liens, listes...)"
                    />
                  </div>
                </div>
              </div>

              {/* Gestion des images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
                  Images de l'annonce
                </h3>
                
                <div className="pl-3">
                  {/* Images existantes */}
                  {editFormData.images && editFormData.images.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">
                        Images actuelles ({editFormData.images.length})
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {editFormData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-image.jpg';
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const newImages = editFormData.images.filter((_, i) => i !== index);
                                setEditFormData({ ...editFormData, images: newImages });
                              }}
                            >
                              ×
                            </Button>
                            </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ajouter de nouvelles images */}
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Ajouter des images
                    </Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;

                          // Créer un FormData pour uploader les images
                          const formData = new FormData();
                          Array.from(files).forEach(file => {
                            formData.append('images', file);
                          });

                          try {
                            toast.promise(
                              fetch('/api/upload-images', {
                                method: 'POST',
                                body: formData,
                              }).then(res => res.json()),
                              {
                                loading: 'Upload des images...',
                                success: (data) => {
                                  if (data.paths && data.paths.length > 0) {
                                    setEditFormData({
                                      ...editFormData,
                                      images: [...editFormData.images, ...data.paths]
                                    });
                                    return `${data.paths.length} image(s) ajoutée(s)`;
                                  }
                                  throw new Error('Erreur lors de l\'upload');
                                },
                                error: 'Erreur lors de l\'upload des images',
                              }
                            );
                            // Reset le input
                            e.target.value = '';
                          } catch (error) {
                            console.error('Erreur upload:', error);
                          }
                        }}
                        className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500">
                        Sélectionnez une ou plusieurs images (JPG, PNG, etc.)
                      </p>
                    </div>
                  </div>

                 
                </div>
              </div>

              {/* Prix et type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  Prix et type d'annonce
                </h3>
                
                <div className="grid grid-cols-2 gap-4 pl-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prix" className="text-sm font-semibold text-gray-700">
                      Prix (FCFA) *
                    </Label>
                    <Input
                      id="edit-prix"
                      type="text"
                      value={formatNumberWithSpaces(editFormData.prix_vente)}
                      onChange={(e) => {
                        const formatted = formatNumberWithSpaces(e.target.value);
                        setEditFormData({ ...editFormData, prix_vente: formatted });
                      }}
                      placeholder="Ex: 3 000 000"
                      className="h-11 text-lg font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-type" className="text-sm font-semibold text-gray-700">
                      Type d'annonce *
                    </Label>
                    <Select
                      value={editFormData.type_annonce}
                      onValueChange={(value) => setEditFormData({ ...editFormData, type_annonce: value })}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="louer">À louer</SelectItem>
                        <SelectItem value="acheter">À acheter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                  Caractéristiques du bien
                </h3>
                
                <div className="grid grid-cols-3 gap-4 pl-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-surface" className="text-sm font-semibold text-gray-700">
                      Surface (m²)
                    </Label>
                    <Input
                      id="edit-surface"
                      type="number"
                      value={editFormData.surface}
                      onChange={(e) => setEditFormData({ ...editFormData, surface: Number(e.target.value) })}
                      placeholder="Ex: 150"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-pieces" className="text-sm font-semibold text-gray-700">
                      Pièces *
                    </Label>
                    <Input
                      id="edit-pieces"
                      type="number"
                      value={editFormData.piece}
                      onChange={(e) => setEditFormData({ ...editFormData, piece: Number(e.target.value) })}
                      placeholder="Ex: 5"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-chambres" className="text-sm font-semibold text-gray-700">
                      Chambres
                    </Label>
                    <Input
                      id="edit-chambres"
                      type="number"
                      value={editFormData.chambre}
                      onChange={(e) => setEditFormData({ ...editFormData, chambre: Number(e.target.value) })}
                      placeholder="Ex: 3"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-3 pt-6 border-t sticky bottom-0 bg-white">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setEditDialog({ open: false, annonce: null })}
                className="flex-1 h-11"
              >
                Annuler
              </Button>
              <Button 
                type="button"
                onClick={handleUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-11 text-base font-semibold"
                disabled={!editFormData.nom || !editFormData.prix_vente}
              >
                <Edit className="h-4 w-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, annonce: null })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                {deleteDialog.annonce && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="font-medium">{deleteDialog.annonce.nom}</p>
                    <p className="text-sm text-gray-600">{formatPrice(deleteDialog.annonce.prix_vente)}</p>
                  </div>
                )}
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
      </div>
    </AdminLayout>
  );
}
