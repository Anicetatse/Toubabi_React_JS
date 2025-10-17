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
  Filter,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { useAdminCommandes, useUpdateCommandeStatus } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUTS = [
  { value: 0, label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 1, label: 'Traitée', color: 'bg-green-100 text-green-800' },
  { value: 2, label: 'Annulée', color: 'bg-red-100 text-red-800' },
];

export default function AdminCommandesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const { data: commandesData, isLoading, error } = useAdminCommandes(page, 10, search, statusFilter);
  const updateStatusMutation = useUpdateCommandeStatus();

  const handleStatusChange = (commandeId: number, newStatus: number) => {
    updateStatusMutation.mutate({ id: commandeId, status: newStatus });
  };

  const getStatutBadge = (status: number) => {
    const statutConfig = STATUTS.find(s => s.value === status);
    if (!statutConfig) return null;
    
    return (
      <Badge className={statutConfig.color}>
        {statutConfig.label}
      </Badge>
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
          Erreur lors du chargement des commandes
        </div>
      </AdminLayout>
    );
  }

  const statsCommandes = {
    total: commandesData?.total || 0,
    enAttente: commandesData?.commandes.filter(c => c.status === 0).length || 0,
    traitees: commandesData?.commandes.filter(c => c.status === 1).length || 0,
    annulees: commandesData?.commandes.filter(c => c.status === 2).length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-600">
            Gérez toutes les commandes de la plateforme
          </p>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro, client, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter?.toString()} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : Number(value))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {STATUTS.map((statut) => (
                    <SelectItem key={statut.value} value={statut.value.toString()}>
                      {statut.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsCommandes.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsCommandes.enAttente}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Traitées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsCommandes.traitees}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsCommandes.annulees}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des commandes */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commandes ({commandesData?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">N° Commande</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bien</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commandesData?.commandes?.length ? (
                    commandesData.commandes.map((commande) => (
                      <tr key={commande.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{commande.numero_commande}</p>
                            <p className="text-sm text-gray-600">ID: #{commande.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{commande.client_nom}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">{commande.email || 'N/A'}</p>
                            <p className="text-xs text-gray-600">{commande.numero || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">
                            {commande.code_produit}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {getStatutBadge(commande.status)}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-600">
                            {new Date(commande.created_at).toLocaleDateString('fr-FR')}
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
                                Voir détails
                              </DropdownMenuItem>
                              {STATUTS.map((statut) => (
                                <DropdownMenuItem
                                  key={statut.value}
                                  onClick={() => handleStatusChange(commande.id, statut.value)}
                                  disabled={commande.status === statut.value}
                                >
                                  Marquer comme {statut.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Aucune commande trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {commandesData && commandesData.total > 10 && (
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
                  Page {page} sur {Math.ceil(commandesData.total / 10)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(commandesData.total / 10)}
                >
                  Suivant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}