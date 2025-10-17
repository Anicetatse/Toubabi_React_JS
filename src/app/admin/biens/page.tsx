'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Plus,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { useAdminBiens, useToggleBienStatus, useDeleteBien } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';
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

export default function AdminBiensPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; bienId?: number }>({ open: false });

  const { data: biensData, isLoading, error } = useAdminBiens(page, 10, search);
  const toggleStatusMutation = useToggleBienStatus();
  const deleteMutation = useDeleteBien();

  const handleToggleStatus = (bienId: number, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id: bienId, enabled: !currentStatus });
  };

  const handleDelete = (bienId: number) => {
    setDeleteDialog({ open: true, bienId });
  };

  const confirmDelete = () => {
    if (deleteDialog.bienId) {
      deleteMutation.mutate(deleteDialog.bienId);
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
          Erreur lors du chargement des biens
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Biens</h1>
            <p className="text-gray-600">
              Gérez tous les biens immobiliers de la plateforme
            </p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Bien
          </Button>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, client, commune..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Biens Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {biensData?.biens.filter(b => b.enabled).length || 0}
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
                  <p className="text-sm font-medium text-gray-600">Biens Inactifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {biensData?.biens.filter(b => !b.enabled).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Biens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {biensData?.total || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des biens */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Biens ({biensData?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bien</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Prix</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Localisation</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {biensData?.biens?.length ? (
                    biensData.biens.map((bien) => (
                      <tr key={bien.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{bien.nom}</p>
                            <p className="text-sm text-gray-600">#{bien.code}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{bien.client_nom || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">
                            {formatPrice(bien.prix_vente)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">
                            {bien.commune_nom || 'N/A'}
                          </p>
                          {bien.quartier_nom && (
                            <p className="text-xs text-gray-600">{bien.quartier_nom}</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            variant={bien.enabled ? "default" : "secondary"}
                            className={bien.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {bien.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(bien.created_at).toLocaleDateString('fr-FR')}
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
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(bien.id, bien.enabled)}
                              >
                                {bien.enabled ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(bien.id)}
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
                        Aucun bien trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {biensData && biensData.total > 10 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} sur {Math.ceil(biensData.total / 10)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(biensData.total / 10)}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.
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