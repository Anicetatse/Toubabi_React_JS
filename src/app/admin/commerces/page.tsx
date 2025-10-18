'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  useAdminCommerces,
  usePrixReferences,
  useCreateCommerce,
  useUpdateCommerce,
  useDeleteCommerce
} from '@/hooks/useAdmin';
import { Pagination } from '@/components/admin/Pagination';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Phone,
  Building2,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface Commerce {
  id: number;
  id_commune?: number;
  nom?: string;
  description?: string;
  contact?: string;
  active: number;
  created_at?: string;
  updated_at?: string;
  commune?: {
    id: number;
    nom: string;
  };
}

interface Commune {
  id: number;
  nom: string;
}

export default function AdminCommercesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'commune'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const itemsPerPage = 10;
  
  const [commercess, setCommerces] = useState<Commerce[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  
  // Hooks React Query
  const { data: commercessData, isLoading } = useAdminCommerces(1, 1000, '');
  const { data: referencesData } = usePrixReferences(); // Pour charger les communes
  const createMutation = useCreateCommerce();
  const updateMutation = useUpdateCommerce();
  const deleteMutation = useDeleteCommerce();
  
  // États pour les dialogues
  const [createDialog, setCreateDialog] = useState({ open: false });
  const [editDialog, setEditDialog] = useState({ open: false, commerces: null as Commerce | null });
  const [viewDialog, setViewDialog] = useState({ open: false, commerces: null as Commerce | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, commerces: null as Commerce | null });
  const [importDialog, setImportDialog] = useState({ open: false });
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    id_commune: '',
    nom: '',
    description: '',
    contact: '',
    active: '1'
  });

  // États pour l'importation
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importCommune, setImportCommune] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  // Fonction de tri
  const handleSort = (field: 'nom' | 'commune') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les commercess
  const filteredCommerces = commercess.filter((p: Commerce) => 
    p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.commune?.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contact?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trier les commercess
  const sortedCommerces = [...filteredCommerces].sort((a, b) => {
    let aValue: any = sortField === 'nom' ? a.nom : a.commune?.nom;
    let bValue: any = sortField === 'nom' ? b.nom : b.commune?.nom;

    if (!aValue) return 1;
    if (!bValue) return -1;
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedCommerces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommerces = sortedCommerces.slice(startIndex, endIndex);

  // Statistiques
  const stats = {
    total_commercess: filteredCommerces.length,
    commercess_actives: filteredCommerces.filter((p: Commerce) => p.active === 1).length,
    communes_couvertes: new Set(filteredCommerces.filter((p: Commerce) => p.commune).map((p: Commerce) => p.commune?.nom)).size
  };

  // Charger les données depuis les hooks
  useEffect(() => {
    if (commercessData?.data) {
      setCommerces(commercessData.data);
    }
  }, [commercessData]);

  useEffect(() => {
    if (referencesData?.data?.quartiers) {
      // Extraire les communes uniques des quartiers
      const uniqueCommunes: Commune[] = Array.from(
        new Map(
          referencesData.data.quartiers.map((q: any) => [q.commune_id, { id: q.commune_id, nom: q.commune }])
        ).values()
      ) as Commune[];
      setCommunes(uniqueCommunes);
    }
  }, [referencesData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const resetForm = () => {
    setFormData({
      id_commune: '',
      nom: '',
      description: '',
      contact: '',
      active: '1'
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
    if (!editDialog.commerces) return;
    
    try {
      await updateMutation.mutateAsync({ 
        id: editDialog.commerces.id, 
        data: formData 
      });
      setEditDialog({ open: false, commerces: null });
      resetForm();
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.commerces) return;
    
    try {
      await deleteMutation.mutateAsync(deleteDialog.commerces.id);
      setDeleteDialog({ open: false, commerces: null });
    } catch (error) {
      // L'erreur est déjà gérée par le hook
    }
  };

  const openEditDialog = (commerces: Commerce) => {
    setFormData({
      id_commune: commerces.id_commune?.toString() || '',
      nom: commerces.nom || '',
      description: commerces.description || '',
      contact: commerces.contact || '',
      active: commerces.active.toString()
    });
    setEditDialog({ open: true, commerces });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    // Créer un vrai fichier Excel avec XLSX
    const data = [
      ['nom', 'contact', 'description', 'active'],
      ['Commerce Exemple', '77 123 45 67', 'Description de la commerces', '1'],
      ['Commerce Express', '77 987 65 43', 'Autre description', '1']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Styliser les en-têtes (première ligne)
    ws['!cols'] = [
      { wch: 25 }, // nom
      { wch: 15 }, // contact
      { wch: 40 }, // description
      { wch: 8 }   // active
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Commerces');
    
    // Télécharger le fichier
    XLSX.writeFile(wb, 'template_commercess.xlsx');
  };

  const handleImport = async () => {
    if (!importFile || !importCommune) {
      toast.error('Veuillez sélectionner une commune et un fichier');
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);

    try {
      const arrayBuffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Prendre la première feuille
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir en JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      console.log('📊 Données brutes du fichier:', jsonData);
      
      if (jsonData.length < 2) {
        toast.error('Le fichier est vide ou invalide');
        setIsImporting(false);
        return;
      }

      // Extraire les en-têtes et les données
      const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
      console.log('📋 En-têtes:', headers);

      const data: any[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined && row[index] !== null 
            ? String(row[index]).trim() 
            : '';
        });
        
        // Ignorer les lignes sans nom
        if (obj.nom && obj.nom.trim()) {
          data.push(obj);
        }
      }

      console.log('📊 Données à importer:', data);

      if (data.length === 0) {
        toast.error('Aucune donnée valide trouvée dans le fichier');
        setIsImporting(false);
        return;
      }

      // Importer les commercess une par une (sans toast individuel)
      let imported = 0;
      let errors = 0;
      
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        const commercesData = {
          nom: item.nom,
          id_commune: importCommune,
          contact: item.contact || '',
          description: item.description || '',
          active: item.active || '1'
        };

        console.log(`➡️ Import ${i + 1}/${data.length}:`, commercesData);
        
        try {
          // Utiliser l'API directement sans passer par le hook pour éviter les toasts
          const token = localStorage.getItem('admin_token');
          await fetch('/api/admin/commercess', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(commercesData)
          });
          
          imported++;
        } catch (error) {
          console.error(`Erreur import ${i + 1}:`, error);
          errors++;
        }
        
        setImportProgress(Math.round(((imported + errors) / data.length) * 100));
      }

      // Fermer le dialogue d'abord
      setImportDialog({ open: false });
      setImportFile(null);
      setImportCommune('');
      setImportProgress(0);
      
      // Afficher le toast de succès
      if (errors > 0) {
        toast.success(`${imported} commerces(s) importée(s), ${errors} erreur(s)`, { duration: 5000 });
      } else {
        toast.success(`${imported} commerces(s) importée(s) avec succès`, { duration: 3000 });
      }
      
      // Recharger après un court délai pour laisser le temps au toast de s'afficher
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('❌ Erreur lors de l\'importation:', error);
      toast.error('Erreur lors de l\'importation: ' + (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="ml-4 text-gray-600">Chargement des commercess...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Commerces</h1>
            <p className="text-gray-600">
              Gérez les commercess commercial par commune
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => setImportDialog({ open: true })}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => setCreateDialog({ open: true })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Commerce
            </Button>
          </div>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une commerces (nom, commune, contact)..."
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
                  <p className="text-sm font-medium text-gray-600">Total Commerces</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_commercess}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commerces Actives</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.commercess_actives}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Communes Couvertes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.communes_couvertes}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des commercess */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commerces ({filteredCommerces.length})</CardTitle>
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
                      onClick={() => handleSort('commune')}
                    >
                      <div className="flex items-center gap-2">
                        Commune
                        {sortField === 'commune' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Actif</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCommerces.length > 0 ? (
                    paginatedCommerces.map((commerces: Commerce) => (
                      <tr key={commerces.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{commerces.nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{commerces.commune?.nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">{commerces.contact || '-'}</span>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          {commerces.description ? (
                            <div 
                              className="text-sm text-gray-700 line-clamp-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: commerces.description }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge 
                            variant="outline" 
                            className={commerces.active === 1 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                            }
                          >
                            {commerces.active === 1 ? 'Oui' : 'Non'}
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, commerces })}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(commerces)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, commerces })}
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
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Aucune commerces trouvée</p>
                        <p className="text-sm">Commencez par ajouter une commerces commercial</p>
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
                  totalItems={sortedCommerces.length}
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
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Plus className="h-5 w-5 text-red-600" />
              </div>
              Nouvelle Commerce
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Ajoutez une nouvelle commerces commercial
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-red-600" />
                Nom de la commerces *
              </Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Commerce Centrale"
                className="h-10"
              />
            </div>

            {/* Commune */}
            <div className="space-y-2">
              <Label htmlFor="id_commune" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Commune
              </Label>
              <SearchableSelect
                options={communes.map((commune: Commune) => ({ 
                  value: commune.id.toString(), 
                  label: commune.nom
                }))}
                value={formData.id_commune}
                onValueChange={(value) => setFormData({ ...formData, id_commune: value })}
                placeholder="Sélectionnez une commune"
                searchPlaceholder="Rechercher une commune..."
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                Contact
              </Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="27 33 XX XX XX"
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Description
              </Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Entrez la description de la commerces..."
              />
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Actif
              </Label>
              <div className="flex gap-3">
                <label 
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.active === '1' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="active"
                    value="1"
                    checked={formData.active === '1'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="text-sm font-medium">Oui</span>
                </label>
                <label 
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.active === '0' 
                      ? 'border-gray-500 bg-gray-50 text-gray-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="active"
                    value="0"
                    checked={formData.active === '0'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                    className="h-4 w-4 text-gray-600"
                  />
                  <span className="text-sm font-medium">Non</span>
                </label>
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
              disabled={!formData.nom || createMutation.isPending}
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
      <Dialog open={editDialog.open} onOpenChange={(open: boolean) => !open && setEditDialog({ open: false, commerces: null })}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              Modifier la Commerce
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Modifiez les informations de la commerces
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="edit_nom" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-red-600" />
                Nom de la commerces *
              </Label>
              <Input
                id="edit_nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Commerce Centrale"
                className="h-10"
              />
            </div>

            {/* Commune */}
            <div className="space-y-2">
              <Label htmlFor="edit_id_commune" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Commune
              </Label>
              <SearchableSelect
                options={communes.map((commune: Commune) => ({ 
                  value: commune.id.toString(), 
                  label: commune.nom
                }))}
                value={formData.id_commune}
                onValueChange={(value) => setFormData({ ...formData, id_commune: value })}
                placeholder="Sélectionnez une commune"
                searchPlaceholder="Rechercher une commune..."
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="edit_contact" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                Contact
              </Label>
              <Input
                id="edit_contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+221 33 XXX XX XX"
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Description
              </Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Entrez la description de la commerces..."
              />
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Actif
              </Label>
              <div className="flex gap-3">
                <label 
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.active === '1' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="edit_active"
                    value="1"
                    checked={formData.active === '1'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="text-sm font-medium">Oui</span>
                </label>
                <label 
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.active === '0' 
                      ? 'border-gray-500 bg-gray-50 text-gray-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="edit_active"
                    value="0"
                    checked={formData.active === '0'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                    className="h-4 w-4 text-gray-600"
                  />
                  <span className="text-sm font-medium">Non</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialog({ open: false, commerces: null });
                resetForm();
              }}
              className="px-6"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!formData.nom || updateMutation.isPending}
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
      <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open, commerces: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la commerces <strong>{deleteDialog.commerces?.nom}</strong> ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, commerces: null })}>
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
      <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open, commerces: null })}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              Détails de la Commerce
            </DialogTitle>
            <DialogDescription>
              Informations complètes de la commerces
            </DialogDescription>
          </DialogHeader>
          
          {viewDialog.commerces && (
            <div className="space-y-4 py-4">
              {/* Nom */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm text-gray-600 mb-1">Nom</p>
                <p className="font-semibold text-gray-900">{viewDialog.commerces.nom || 'N/A'}</p>
              </div>

              {/* Commune */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Commune</p>
                <p className="font-semibold text-gray-900">{viewDialog.commerces.commune?.nom || 'N/A'}</p>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-gray-600 mb-1">Contact</p>
                <p className="font-semibold text-gray-900">{viewDialog.commerces.contact || '-'}</p>
              </div>

              {/* Description */}
              {viewDialog.commerces.description && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600 mb-3">Description</p>
                  <div 
                    className="text-gray-900 prose prose-sm max-w-none prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
                    dangerouslySetInnerHTML={{ __html: viewDialog.commerces.description }}
                  />
                </div>
              )}

              {/* Statut */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 mb-2">Actif</p>
                <Badge 
                  variant="outline" 
                  className={viewDialog.commerces.active === 1 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {viewDialog.commerces.active === 1 ? 'Oui' : 'Non'}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewDialog({ open: false, commerces: null })}
              className="px-6"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'importation en masse */}
      <Dialog open={importDialog.open} onOpenChange={(open: boolean) => setImportDialog({ open })}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              Importation en Masse
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Importez plusieurs commercess depuis un fichier Excel
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Télécharger le modèle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Étape 1 : Télécharger le modèle Excel</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Téléchargez le modèle et remplissez-le avec vos données
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadTemplate}
                    className="border-blue-600 text-blue-600 hover:bg-blue-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le modèle
                  </Button>
                </div>
              </div>
            </div>

            {/* Sélection de la commune */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">Étape 2 : Sélectionner la commune</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Toutes les commercess importées seront assignées à cette commune
                  </p>
                  <SearchableSelect
                    options={communes.map((commune: Commune) => ({ 
                      value: commune.id.toString(), 
                      label: commune.nom
                    }))}
                    value={importCommune}
                    onValueChange={(value) => setImportCommune(value)}
                    placeholder="Sélectionnez une commune..."
                    searchPlaceholder="Rechercher une commune..."
                  />
                </div>
              </div>
            </div>

            {/* Format du fichier */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Format attendu (sans la colonne commune) :</h4>
              <div className="bg-white rounded border border-gray-200 p-3 font-mono text-xs text-gray-700 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-2 py-1 text-blue-600">nom</th>
                      <th className="text-left px-2 py-1 text-blue-600">contact</th>
                      <th className="text-left px-2 py-1 text-blue-600">description</th>
                      <th className="text-left px-2 py-1 text-blue-600">active</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-2 py-1">Commerce Centrale</td>
                      <td className="px-2 py-1">77 123 45 67</td>
                      <td className="px-2 py-1">Description...</td>
                      <td className="px-2 py-1">1</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1">Commerce Express</td>
                      <td className="px-2 py-1">77 987 65 43</td>
                      <td className="px-2 py-1">Autre description</td>
                      <td className="px-2 py-1">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note :</strong> Le champ "active" doit être 1 (Oui) ou 0 (Non). La commune est définie à l'étape 2.
              </p>
            </div>

            {/* Upload du fichier */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-600" />
                Étape 3 : Sélectionner le fichier Excel
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={isImporting || !importCommune}
                />
                {importFile && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {importFile.name}
                  </Badge>
                )}
              </div>
              {!importCommune && (
                <p className="text-xs text-orange-600">
                  ⚠️ Veuillez d'abord sélectionner une commune
                </p>
              )}
            </div>

            {/* Barre de progression */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Importation en cours...</span>
                  <span className="font-semibold text-red-600">{importProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                setImportDialog({ open: false });
                setImportFile(null);
                setImportCommune('');
                setImportProgress(0);
              }}
              disabled={isImporting}
              className="px-6"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importFile || !importCommune || isImporting}
              className="bg-red-600 hover:bg-red-700 px-6"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importation...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </AdminLayout>
  );
}
