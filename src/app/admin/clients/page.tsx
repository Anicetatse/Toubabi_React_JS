'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Trash2, 
  MoreHorizontal,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Mail,
  Phone,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAdminClients, useToggleClientStatus, useDeleteClient, useUpdateClient } from '@/hooks/useAdmin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

// Fonction pour afficher le libellé du type de compte
const getTypeCompteLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    'client': 'Particulier',
    'agent_professionnel': 'Agent immobilier',
    'agent_informel': 'Agent informel',
    'agence': 'Agence immobilière'
  };
  return labels[type] || type;
};

export default function AdminClientsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'nom' | 'email' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; clientId?: number }>({ open: false });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; client?: any }>({ open: false });
  const [editDialog, setEditDialog] = useState<{ open: boolean; client?: any }>({ open: false });
  const [editFormData, setEditFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    type_compte: 'client'
  });

  // Charger tous les clients
  const { data: clientsData, isLoading, error } = useAdminClients(1, 1000, '');
  const toggleStatusMutation = useToggleClientStatus();
  const deleteMutation = useDeleteClient();
  const updateMutation = useUpdateClient();

  // Réinitialiser la page quand on change la recherche ou le filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, statusFilter]);

  // Fonction de tri
  const handleSort = (field: 'nom' | 'email' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les clients
  const filteredClients = clientsData?.clients.filter(client => {
    const searchLower = searchInput.toLowerCase();
    const matchesSearch = searchInput === '' || 
      client.nom?.toLowerCase().includes(searchLower) ||
      client.prenom?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.telephone?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && client.enabled) ||
      (statusFilter === 'inactive' && !client.enabled);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Trier les clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'created_at') {
      aValue = new Date(a.created_at).getTime();
      bValue = new Date(b.created_at).getTime();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination côté client
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = sortedClients.slice(startIndex, endIndex);

  const handleToggleStatus = (clientId: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id: clientId, enabled: !currentStatus });
  };

  const handleDelete = (clientId: number) => {
    setDeleteDialog({ open: true, clientId });
  };

  const handleEdit = (client: any) => {
    setEditFormData({
      nom: client.nom || '',
      prenom: client.prenom || '',
      email: client.email || '',
      telephone: client.telephone || '',
      type_compte: client.type_compte || 'client'
    });
    setEditDialog({ open: true, client });
  };

  const handleUpdate = () => {
    if (editDialog.client) {
      updateMutation.mutate({
        id: editDialog.client.id,
        data: editFormData
      }, {
        onSuccess: () => {
          setEditDialog({ open: false });
        }
      });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.clientId) {
      deleteMutation.mutate(deleteDialog.clientId);
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
          Erreur lors du chargement des clients
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des annonceurs</h1>
          <p className="text-gray-600">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[200px] h-11">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs uniquement</SelectItem>
                  <SelectItem value="inactive">Inactifs uniquement</SelectItem>
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
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredClients.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clientsData?.clients.filter(c => c.enabled).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserX className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clients Inactifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clientsData?.clients.filter(c => !c.enabled).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des clients */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Clients ({filteredClients.length})</CardTitle>
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
                        Nom et Prénom
                        {sortField === 'nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Email
                        {sortField === 'email' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Téléphone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type de compte</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Date d'inscription
                        {sortField === 'created_at' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.length > 0 ? (
                    paginatedClients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.nom} {client.prenom}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{client.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{client.telephone || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">
                            {getTypeCompteLabel(client.role)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={client.enabled ? "default" : "secondary"}
                            className={client.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {client.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            <div>{new Date(client.created_at).toLocaleDateString('fr-FR')}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(client.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, client })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(client)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(client.id, client.enabled)}
                              >
                                {client.enabled ? (
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
                                onClick={() => handleDelete(client.id)}
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
                        Aucun client trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedClients.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedClients.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialog de visualisation */}
        <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open })}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                Détails du Client
              </DialogTitle>
            </DialogHeader>
            {viewDialog.client && (
              <div className="space-y-5 py-4">
                {/* Informations personnelles */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="text-base font-semibold text-gray-900">
                        {viewDialog.client.prenom} {viewDialog.client.nom}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Type de compte</p>
                      <Badge variant="outline">
                        {getTypeCompteLabel(viewDialog.client.role)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </p>
                      <p className="text-sm text-gray-900">{viewDialog.client.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Téléphone
                      </p>
                      <p className="text-sm text-gray-900">{viewDialog.client.telephone || 'Non fourni'}</p>
                    </div>
                  </div>
                </div>

                {/* Statut et dates */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Statut et dates</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Statut</p>
                      <Badge 
                        variant={viewDialog.client.enabled ? "default" : "secondary"}
                        className={viewDialog.client.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {viewDialog.client.enabled ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Inscription
                      </p>
                      <p className="text-xs text-gray-900">
                        {new Date(viewDialog.client.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(viewDialog.client.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Dernière MAJ</p>
                      <p className="text-xs text-gray-900">
                        {new Date(viewDialog.client.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(viewDialog.client.updated_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
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
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom *</Label>
                <Input
                  id="edit-nom"
                  value={editFormData.nom}
                  onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-prenom">Prénom *</Label>
                <Input
                  id="edit-prenom"
                  value={editFormData.prenom}
                  onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                  placeholder="Prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telephone">Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={editFormData.telephone}
                  onChange={(e) => setEditFormData({ ...editFormData, telephone: e.target.value })}
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type de compte</Label>
                <Select 
                  value={editFormData.type_compte} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, type_compte: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Pour un particulier</SelectItem>
                    <SelectItem value="agent_professionnel">Pour un agent immobilier (individuel)</SelectItem>
                    <SelectItem value="agent_informel">Pour un agent informel</SelectItem>
                    <SelectItem value="agence">Pour une agence immobilière (société)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditDialog({ open: false })}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {updateMutation.isPending ? 'Modification...' : 'Modifier'}
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
                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
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