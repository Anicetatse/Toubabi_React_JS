'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Shield, 
  Plus,
  Trash2, 
  MoreHorizontal,
  Edit,
  Eye,
  Lock
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
import { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole, useUpdateRolePermissions, usePermissions } from '@/hooks/useAdmin';
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

export default function AdminRolesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; roleId?: number }>({ open: false });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; roleId?: number }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; roleId?: number }>({ open: false });
  const [permissionsDialog, setPermissionsDialog] = useState<{ open: boolean; roleId?: number }>({ open: false });
  
  const [formData, setFormData] = useState({
    name: '',
    guard_name: 'web'
  });

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  // Charger les rôles et permissions
  const { data: rolesData, isLoading, error } = useRoles();
  const { data: permissionsData } = usePermissions();
  const { data: roleDetails } = useRole(viewDialog.roleId || 0);
  const { data: rolePermDetails } = useRole(permissionsDialog.roleId || 0);
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const updatePermissionsMutation = useUpdateRolePermissions();

  // Charger les permissions actuelles quand on ouvre le dialog
  useEffect(() => {
    if (permissionsDialog.roleId && rolePermDetails?.role.permissions) {
      setSelectedPermissions(rolePermDetails.role.permissions.map(p => p.id));
    }
  }, [permissionsDialog.roleId, rolePermDetails]);

  // Filtrage des rôles
  const filteredRoles = rolesData?.roles?.filter((role) => {
    if (!searchInput) return true;
    const search = searchInput.toLowerCase();
    return role.name.toLowerCase().includes(search);
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

  const handleEdit = (roleId: number) => {
    const role = rolesData?.roles.find(r => r.id === roleId);
    if (role) {
      setFormData({
        name: role.name,
        guard_name: role.guard_name
      });
      setEditDialog({ open: true, roleId });
    }
  };

  const handleUpdate = () => {
    if (editDialog.roleId) {
      updateMutation.mutate({
        id: editDialog.roleId,
        data: { name: formData.name }
      }, {
        onSuccess: () => {
          setEditDialog({ open: false });
          resetForm();
        }
      });
    }
  };

  const handleOpenPermissions = (roleId: number) => {
    setPermissionsDialog({ open: true, roleId });
    // Les permissions seront chargées par useEffect
  };

  const handleUpdatePermissions = () => {
    if (permissionsDialog.roleId) {
      updatePermissionsMutation.mutate({
        roleId: permissionsDialog.roleId,
        permissionIds: selectedPermissions
      }, {
        onSuccess: () => {
          setPermissionsDialog({ open: false });
          setSelectedPermissions([]);
        }
      });
    }
  };

  const handleDelete = (roleId: number) => {
    setDeleteDialog({ open: true, roleId });
  };

  const confirmDelete = () => {
    if (deleteDialog.roleId) {
      deleteMutation.mutate(deleteDialog.roleId);
      setDeleteDialog({ open: false });
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
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
          Erreur lors du chargement des rôles
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Rôles</h1>
            <p className="text-gray-600">
              Gérez les rôles et leurs permissions
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
            Nouveau Rôle
          </Button>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un rôle..."
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rôles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredRoles.length}
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
                  <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {permissionsData?.permissions.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Permissions Moyennes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rolesData?.roles.length ? Math.round(rolesData.roles.reduce((acc, r) => acc + r.permissions_count, 0) / rolesData.roles.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des rôles */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Rôles ({filteredRoles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nom du rôle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Permissions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date de création</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <tr key={role.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <p className="font-medium text-gray-900 capitalize">{role.name}</p>
                          </div>
                        </td>
                       
                        <td className="py-4 px-4">
                          <Badge className="bg-purple-100 text-purple-800">
                            {role.permissions_count} permission{role.permissions_count > 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(role.created_at).toLocaleDateString('fr-FR')}
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, roleId: role.id })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(role.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenPermissions(role.id)}>
                                <Lock className="h-4 w-4 mr-2" />
                                Gérer les permissions
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(role.id)}
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
                        Aucun rôle trouvé
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
              <DialogTitle>Nouveau Rôle</DialogTitle>
              <DialogDescription>
                Créez un nouveau rôle pour le système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nom du rôle *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: gestionnaire"
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
              <DialogTitle>Modifier le rôle</DialogTitle>
              <DialogDescription>
                Modifiez les informations du rôle
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du rôle *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: gestionnaire"
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

        {/* Dialog des permissions */}
        <Dialog open={permissionsDialog.open} onOpenChange={(open: boolean) => setPermissionsDialog({ open })}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gérer les permissions du rôle</DialogTitle>
              <DialogDescription>
                {permissionsDialog.roleId && rolesData?.roles && (
                  <span>
                    Permissions pour le rôle <strong className="capitalize">{rolesData.roles.find(r => r.id === permissionsDialog.roleId)?.name}</strong>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>{selectedPermissions.length}</strong> permission{selectedPermissions.length > 1 ? 's' : ''} sélectionnée{selectedPermissions.length > 1 ? 's' : ''}
                </p>
              </div>
              {permissionsData?.permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                  <Checkbox
                    id={`perm-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => togglePermission(permission.id)}
                  />
                  <Label htmlFor={`perm-${permission.id}`} className="flex-1 cursor-pointer">
                    <div>
                      <p className="font-medium">{permission.name}</p>
                    </div>
                  </Label>
                  <Badge variant="outline">{permission.roles_count} rôle{permission.roles_count > 1 ? 's' : ''}</Badge>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setPermissionsDialog({ open: false });
                  setSelectedPermissions([]);
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUpdatePermissions}
                disabled={updatePermissionsMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {updatePermissionsMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du rôle</DialogTitle>
              <DialogDescription>
                Informations complètes du rôle
              </DialogDescription>
            </DialogHeader>
            {roleDetails && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Informations du rôle</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Nom</p>
                      <p className="text-base font-semibold text-gray-900 capitalize">
                        {roleDetails.role.name}
                      </p>
                    </div>
                    
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Permissions ({roleDetails.role.permissions.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {roleDetails.role.permissions.length > 0 ? (
                      roleDetails.role.permissions.map((perm) => (
                        <Badge key={perm.id} className="bg-purple-100 text-purple-800">
                          {perm.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucune permission attribuée</p>
                    )}
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
                Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible et le rôle ne peut être supprimé s'il est attribué à des utilisateurs.
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

