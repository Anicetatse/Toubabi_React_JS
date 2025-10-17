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
  UserCog, 
  Shield, 
  Trash2, 
  MoreHorizontal,
  Users,
  Plus,
  Eye,
  Edit,
  Mail,
  ShieldCheck,
  Calendar,
  EyeOff,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAdminUsers, useCreateAdminUser, useUpdateAdminUser, useDeleteAdminUser, useRoles, useRole } from '@/hooks/useAdmin';
import Link from 'next/link';
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

// Fonction pour afficher le libellé du rôle
const getRoleLabel = (role: string) => {
  const labels: { [key: string]: string } = {
    'admin': 'Administrateur',
    'superviseur': 'Superviseur',
    'gestionnaire': 'Gestionnaire'
  };
  return labels[role] || role;
};

// Couleur du badge selon le rôle
const getRoleBadgeColor = (role: string) => {
  const colors: { [key: string]: string } = {
    'admin': 'bg-blue-100 text-blue-800',
    'superviseur': 'bg-purple-100 text-purple-800',
    'gestionnaire': 'bg-green-100 text-green-800'
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export default function AdminUtilisateursPage() {
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId?: number }>({ open: false });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; user?: any }>({ open: false });
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user?: any }>({ open: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'admin'
  });

  // Charger tous les utilisateurs et les rôles
  const { data: usersData, isLoading, error } = useAdminUsers(1, 1000, '');
  const { data: rolesData } = useRoles();
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();
  const deleteMutation = useDeleteAdminUser();

  // Charger les détails du rôle avec permissions pour le viewDialog
  const currentRoleId = viewDialog.user && rolesData?.roles ? 
    rolesData.roles.find(r => r.name === viewDialog.user.role)?.id : 0;
  const { data: currentRoleDetails } = useRole(currentRoleId || 0);

  // Fonction pour obtenir le nombre de permissions d'un rôle
  const getRolePermissionsCount = (roleName: string) => {
    const role = rolesData?.roles.find(r => r.name === roleName);
    return role?.permissions_count || 0;
  };

  // Réinitialiser la page quand on change la recherche
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

  // Filtrage des utilisateurs
  const filteredUsers = usersData?.users?.filter((user) => {
    if (!searchInput) return true;
    const search = searchInput.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      getRoleLabel(user.role).toLowerCase().includes(search)
    );
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      role: 'admin'
    });
  };

  const handleCreate = () => {
    if (formData.password !== formData.confirm_password) {
      return;
    }
    
    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    }, {
      onSuccess: () => {
        setCreateDialog(false);
        resetForm();
      }
    });
  };

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      confirm_password: '',
      role: user.role || 'admin'
    });
    setEditDialog({ open: true, user });
  };

  const handleUpdate = () => {
    if (formData.password && formData.password !== formData.confirm_password) {
      return;
    }

    if (editDialog.user) {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      updateMutation.mutate({
        id: editDialog.user.id,
        data: updateData
      }, {
        onSuccess: () => {
          setEditDialog({ open: false });
          resetForm();
        }
      });
    }
  };

  const handleDelete = (userId: number) => {
    setDeleteDialog({ open: true, userId });
  };

  const confirmDelete = () => {
    if (deleteDialog.userId) {
      deleteMutation.mutate(deleteDialog.userId);
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
          Erreur lors du chargement des administrateurs
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Administrateurs</h1>
            <p className="text-gray-600">
              Gérez les administrateurs et leurs rôles
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
            Nouvel Administrateur
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou rôle..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredUsers.length}
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
                  <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usersData?.users.filter(u => u.role === 'admin').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserCog className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Superviseurs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usersData?.users.filter(u => u.role === 'superviseur').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gestionnaires</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usersData?.users.filter(u => u.role === 'gestionnaire').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des administrateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Administrateurs ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Permissions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date de création</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{user.name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{user.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-purple-100 text-purple-800">
                            <Lock className="h-3 w-3 mr-1" />
                            {getRolePermissionsCount(user.role)} permission{getRolePermissionsCount(user.role) > 1 ? 's' : ''}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            <div>{new Date(user.created_at).toLocaleDateString('fr-FR')}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(user.created_at).toLocaleTimeString('fr-FR', { 
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
                              <DropdownMenuItem onClick={() => setViewDialog({ open: true, user })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(user.id)}
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
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Aucun administrateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de création */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvel Administrateur</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte administrateur
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nom *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-confirm-password">Confirmer le mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="create-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && formData.confirm_password && formData.password !== formData.confirm_password && (
                  <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Rôle</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="superviseur">Superviseur</SelectItem>
                    <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={createMutation.isPending || formData.name.trim() === '' || formData.email.trim() === '' || formData.password.trim() === '' || formData.password !== formData.confirm_password}
                className="bg-red-600 hover:bg-red-700"
              >
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition - similaire au dialog de création */}
        <Dialog open={editDialog.open} onOpenChange={(open: boolean) => setEditDialog({ open })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier l'administrateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'administrateur (laissez le mot de passe vide pour ne pas le changer)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Nouveau mot de passe (optionnel)</Label>
                <div className="relative">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {formData.password && (
                <div className="space-y-2">
                  <Label htmlFor="edit-confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="edit-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && formData.confirm_password && formData.password !== formData.confirm_password && (
                    <p className="text-sm text-red-600">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-role">Rôle</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="superviseur">Superviseur</SelectItem>
                    <SelectItem value="gestionnaire">Gestionnaire</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={updateMutation.isPending || formData.name.trim() === '' || formData.email.trim() === '' || (formData.password.trim() !== '' && formData.password !== formData.confirm_password)}
                className="bg-red-600 hover:bg-red-700"
              >
                {updateMutation.isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={viewDialog.open} onOpenChange={(open: boolean) => setViewDialog({ open })}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'administrateur</DialogTitle>
              <DialogDescription>
                Informations complètes de l'administrateur
              </DialogDescription>
            </DialogHeader>
            {viewDialog.user && (
              <div className="space-y-4">
                {/* Informations principales et permissions côte à côte */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Informations principales */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <p className="text-sm font-medium text-gray-500">Nom</p>
                        <p className="text-base font-semibold text-gray-900">
                          {viewDialog.user.name}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email
                        </p>
                        <p className="text-sm text-gray-900">{viewDialog.user.email}</p>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <p className="text-sm font-medium text-gray-500">Rôle</p>
                        <Badge className={getRoleBadgeColor(viewDialog.user.role)}>
                          {getRoleLabel(viewDialog.user.role)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Nombre de permissions
                        </p>
                        <Badge className="bg-purple-100 text-purple-800">
                          {getRolePermissionsCount(viewDialog.user.role)} permission{getRolePermissionsCount(viewDialog.user.role) > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Permissions du rôle */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Permissions
                      </h3>
                      <Link 
                        href="/admin/roles" 
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs"
                      >
                        <Shield className="h-3 w-3" />
                        Gérer →
                      </Link>
                    </div>
                    {currentRoleDetails?.role.permissions && currentRoleDetails.role.permissions.length > 0 ? (
                      <div className="space-y-2">
                        {currentRoleDetails.role.permissions.map((perm) => (
                          <div key={perm.id} className="flex items-center gap-2 p-2 bg-white rounded border border-purple-200">
                            <Lock className="h-3 w-3 text-purple-600" />
                            <span className="text-sm text-gray-900">{perm.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucune permission attribuée à ce rôle</p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Création
                      </p>
                      <p className="text-xs text-gray-900">
                        {new Date(viewDialog.user.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(viewDialog.user.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-500">Dernière MAJ</p>
                      <p className="text-xs text-gray-900">
                        {new Date(viewDialog.user.updated_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(viewDialog.user.updated_at).toLocaleTimeString('fr-FR', { 
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

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open: boolean) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.
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

