'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Lock, 
  Plus,
  Trash2, 
  MoreHorizontal,
  Edit,
  Eye,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { usePermissions, useCreatePermission, useUpdatePermission, useDeletePermission } from '@/hooks/useAdmin';
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

export default function AdminPermissionsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; permId?: number }>({ open: false });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; permission?: any }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; permId?: number }>({ open: false });
  
  const [formData, setFormData] = useState({
    name: '',
    guard_name: 'web'
  });

  // Charger les permissions
  const { data: permissionsData, isLoading, error } = usePermissions();
  const createMutation = useCreatePermission();
  const updateMutation = useUpdatePermission();
  const deleteMutation = useDeletePermission();

  // Filtrage des permissions
  const filteredPermissions = permissionsData?.permissions?.filter((perm) => {
    if (!searchInput) return true;
    const search = searchInput.toLowerCase();
    return perm.name.toLowerCase().includes(search);
  }) || [];

  const resetForm = () => {
    setFormData({
      name: '',
      guard_name: 'web'
    });
  };

  const handleCreate = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setCreateDialog(false);
        resetForm();
      }
    });
  };

  const handleEdit = (permId: number) => {
    const permission = permissionsData?.permissions.find(p => p.id === permId);
    if (permission) {
      setFormData({
        name: permission.name,
        guard_name: permission.guard_name
      });
      setEditDialog({ open: true, permId });
    }
  };

  const handleUpdate = () => {
    if (editDialog.permId) {
      updateMutation.mutate({
        id: editDialog.permId,
        data: { name: formData.name }
      }, {
        onSuccess: () => {
          setEditDialog({ open: false });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (permId: number) => {
    setDeleteDialog({ open: true, permId });
  };

  const confirmDelete = () => {
    if (deleteDialog.permId) {
      deleteMutation.mutate(deleteDialog.permId);
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
          Erreur lors du chargement des permissions
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions</h1>
            <p className="text-gray-600">
              Gérez les permissions du système
            </p>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setCreateDialog(true);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Permission
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une permission..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredPermissions.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rôles Moyens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {permissionsData?.permissions.length ? Math.round(permissionsData.permissions.reduce((acc, p) => acc + p.roles_count, 0) / permissionsData.permissions.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Permissions Actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {permissionsData?.permissions.filter(p => p.roles_count > 0).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Permissions ({filteredPermissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nom de la permission</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rôles</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date de création</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions.length > 0 ? (
                    filteredPermissions.map((permission) => (
                      <tr key={permission.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-purple-600" />
                            <p className="font-medium text-gray-900">{permission.name}</p>
                          </div>
                        </td>
                       
                        <td className="py-4 px-4">
                          <Badge className={permission.roles_count > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                            {permission.roles_count} rôle{permission.roles_count > 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(permission.created_at).toLocaleDateString('fr-FR')}
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, permission })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(permission.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(permission.id)}
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
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Aucune permission trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de création */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle Permission</DialogTitle>
              <DialogDescription>
                Créez une nouvelle permission pour le système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nom de la permission *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Gestion des annonces"
                />
              </div>
              
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCreateDialog(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending || formData.name.trim() === ''}
                className="bg-red-600 hover:bg-red-700"
              >
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition */}
        <Dialog open={editDialog.open} onOpenChange={(open: boolean) => setEditDialog({ open })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier la permission</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la permission
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom de la permission *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Gestion des annonces"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditDialog({ open: false });
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateMutation.isPending || formData.name.trim() === ''}
                className="bg-red-600 hover:bg-red-700"
              >
                {updateMutation.isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la permission</DialogTitle>
              <DialogDescription>
                Informations complètes de la permission
              </DialogDescription>
            </DialogHeader>
            {viewDialog.permission && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations de la permission</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Nom</p>
                      <p className="text-base font-semibold text-gray-900">
                        {viewDialog.permission.name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Rôles assignés</p>
                      <Badge className={viewDialog.permission.roles_count > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                        {viewDialog.permission.roles_count} rôle{viewDialog.permission.roles_count > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Statut</p>
                      <Badge className={viewDialog.permission.roles_count > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {viewDialog.permission.roles_count > 0 ? 'Active' : 'Non utilisée'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Création</p>
                      <p className="text-xs text-gray-900">
                        {new Date(viewDialog.permission.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Dernière MAJ</p>
                      <p className="text-xs text-gray-900">
                        {new Date(viewDialog.permission.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
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

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette permission ? Cette action est irréversible et la permission ne peut être supprimée si elle est attribuée à des rôles.
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

