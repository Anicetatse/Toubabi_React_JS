'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';
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

interface SousCategorie {
  code: string;
  code_cat: string;
  categorie_nom?: string;
  position: number | null;
  nom: string;
  image: string | null;
  enabled: number;
  created_at: string;
}

interface Categorie {
  code: string;
  nom: string;
}

export default function AdminSousCategoriesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'categorie_nom'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editDialog, setEditDialog] = useState<{ open: boolean; sousCategorie?: SousCategorie }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; code?: string }>({ open: false });
  
  const [formData, setFormData] = useState({
    nom: '',
    code_cat: '',
    image: '',
    position: 0,
    enabled: true
  });

  useEffect(() => {
    fetchSousCategories();
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  const fetchSousCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/souscategories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSousCategories(data);
      } else {
        toast.error('Erreur lors du chargement des sous-catégories');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des sous-catégories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((c: any) => ({ code: c.code, nom: c.nom })));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSort = (field: 'nom' | 'categorie_nom') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredSousCategories = sousCategories.filter(sc => 
    sc.nom.toLowerCase().includes(searchInput.toLowerCase()) ||
    sc.categorie_nom?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const sortedSousCategories = [...filteredSousCategories].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedSousCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSousCategories = sortedSousCategories.slice(startIndex, endIndex);

  const handleCreate = async () => {
    const loadingToast = toast.loading('Création en cours...');
    
    try {
      const response = await fetch('/api/admin/souscategories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Sous-catégorie créée avec succès', { id: loadingToast });
        setCreateDialog(false);
        setFormData({ nom: '', code_cat: '', image: '', position: 0, enabled: true });
        fetchSousCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la création', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Erreur lors de la création', { id: loadingToast });
    }
  };

  const handleEdit = (sousCategorie: SousCategorie) => {
    setFormData({
      nom: sousCategorie.nom,
      code_cat: sousCategorie.code_cat,
      image: sousCategorie.image || '',
      position: sousCategorie.position || 0,
      enabled: sousCategorie.enabled === 1
    });
    setEditDialog({ open: true, sousCategorie });
  };

  const handleUpdate = async () => {
    if (!editDialog.sousCategorie) return;
    
    const loadingToast = toast.loading('Mise à jour en cours...');
    
    try {
      const response = await fetch(`/api/admin/souscategories/${editDialog.sousCategorie.code}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Sous-catégorie mise à jour avec succès', { id: loadingToast });
        setEditDialog({ open: false });
        setFormData({ nom: '', code_cat: '', image: '', position: 0, enabled: true });
        fetchSousCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la mise à jour', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour', { id: loadingToast });
    }
  };

  const handleDelete = async (code: string) => {
    const loadingToast = toast.loading('Suppression en cours...');
    
    try {
      const response = await fetch(`/api/admin/souscategories/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        toast.success('Sous-catégorie supprimée avec succès', { id: loadingToast });
        setDeleteDialog({ open: false });
        fetchSousCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la suppression', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Sous-Catégories</h1>
            <p className="text-gray-600">
              Gérez toutes les sous-catégories de biens immobiliers
            </p>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Sous-Catégorie
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou catégorie..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Sous-Catégories ({filteredSousCategories.length})</CardTitle>
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
                        Sous Catégorie
                        {sortField === 'nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('categorie_nom')}
                    >
                      <div className="flex items-center gap-2">
                        Catégorie
                        {sortField === 'categorie_nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSousCategories.length > 0 ? (
                    paginatedSousCategories.map((sousCategorie) => (
                      <tr key={sousCategorie.code} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{sousCategorie.nom}</p>
                        </td>
                       
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {sousCategorie.categorie_nom || 'N/A'}
                          </Badge>
                        </td>
                       
                        <td className="py-4 px-4">
                          {sousCategorie.enabled === 1 ? (
                            <Badge className="bg-green-100 text-green-800">Actif</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactif</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(sousCategorie)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteDialog({ open: true, code: sousCategorie.code })}
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
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Aucune sous-catégorie trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedSousCategories.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedSousCategories.length}
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
                Nouvelle Sous-Catégorie
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Créez une nouvelle sous-catégorie de bien immobilier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                  Sous Catégorie *
                </Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Saisissez le nom de la sous-catégorie"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code_cat" className="text-sm font-semibold text-gray-700">
                  Catégorie *
                </Label>
                <Select
                  value={formData.code_cat}
                  onValueChange={(value) => setFormData({ ...formData, code_cat: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {cat.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    Activée
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
                disabled={!formData.nom || !formData.code_cat}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de modification */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                Modifier la Sous-Catégorie
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Modifiez les informations de la sous-catégorie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-nom" className="text-sm font-semibold text-gray-700">
                  Sous Catégorie *
                </Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Saisissez le nom de la sous-catégorie"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code_cat" className="text-sm font-semibold text-gray-700">
                  Catégorie *
                </Label>
                <Select
                  value={formData.code_cat}
                  onValueChange={(value) => setFormData({ ...formData, code_cat: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.code} value={cat.code}>
                        {cat.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    Activée
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
                disabled={!formData.nom || !formData.code_cat}
              >
                <Edit className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de suppression */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette sous-catégorie ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialog.code && handleDelete(deleteDialog.code)}
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
