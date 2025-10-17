'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
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
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
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
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'id' | 'nom' | 'email' | 'status' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  // Charger toutes les commandes (limite élevée pour avoir toutes les données)
  const { data: commandesData, isLoading, error } = useAdminCommandes(1, 1000, '', undefined);
  const updateStatusMutation = useUpdateCommandeStatus();
  const [commandeToDelete, setCommandeToDelete] = useState<number | null>(null);

  // Réinitialiser la page à 1 quand on change les filtres
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, statusFilter]);

  // Fonction de tri
  const handleSort = (field: 'id' | 'nom' | 'email' | 'status' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les commandes côté client (sans actualiser la page)
  const filteredCommandes = commandesData?.commandes.filter(commande => {
    // Filtre par recherche
    const searchLower = searchInput.toLowerCase();
    const matchSearch = searchInput === '' || 
      commande.nom?.toLowerCase().includes(searchLower) ||
      commande.email?.toLowerCase().includes(searchLower) ||
      commande.numero?.toLowerCase().includes(searchLower) ||
      commande.code_produit?.toLowerCase().includes(searchLower);

    // Filtre par statut
    const matchStatus = statusFilter === undefined || commande.status === statusFilter;

    return matchSearch && matchStatus;
  }) || [];

  // Trier les commandes
  const sortedCommandes = [...filteredCommandes].sort((a, b) => {
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

  // Pagination côté client sur les données triées
  const totalPages = Math.ceil(sortedCommandes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommandes = sortedCommandes.slice(startIndex, endIndex);

  const handleStatusChange = (commandeId: number, newStatus: number) => {
    updateStatusMutation.mutate({ id: commandeId, status: newStatus });
  };

  const handleDelete = async (commandeId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      return;
    }
    
    const loadingToast = toast.loading('Suppression en cours...');
    
    try {
      const response = await fetch(`/api/admin/commandes/${commandeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        toast.success('Commande supprimée avec succès', { id: loadingToast });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Erreur lors de la suppression de la commande', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de la commande', { id: loadingToast });
    }
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
    total: filteredCommandes.length,
    enAttente: filteredCommandes.filter(c => c.status === 0).length,
    traitees: filteredCommandes.filter(c => c.status === 1).length,
    annulees: filteredCommandes.filter(c => c.status === 2).length,
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
            <div className= "flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par numéro, client, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-2">
                        N° Commande
                        {sortField === 'id' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('nom')}
                    >
                      <div className="flex items-center gap-2">
                        Client
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
                        Contact
                        {sortField === 'email' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bien</th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Statut
                        {sortField === 'status' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortField === 'created_at' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCommandes.length > 0 ? (
                    paginatedCommandes.map((commande) => (
                      <tr key={commande.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">Numéro de commande : {commande.id}</p>
                            
                          </div>
                      </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900 font-medium">{commande.nom}</p>
                      </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">{commande.email || 'N/A'}</p>
                            <p className="text-sm text-gray-900">{commande.numero || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Link 
                            href={`/biens/${commande.code_produit}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium inline-flex items-center gap-1"
                            title={`Code: ${commande.code_produit}`}
                          >
                            <span className="truncate max-w-[150px]">{commande.code_produit}</span>
                            <Eye className="h-3 w-3 flex-shrink-0" />
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          {getStatutBadge(commande.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-900">
                            <p>
                              {new Date(commande.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              à {new Date(commande.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
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
                              <DropdownMenuItem asChild>
                                <a 
                                  href={`/biens/${commande.code_produit}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir le bien
                                </a>
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
                              <DropdownMenuItem
                                onClick={() => handleDelete(commande.id)}
                                className="text-red-600 focus:text-red-600"
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
                        Aucune commande trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedCommandes.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedCommandes.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}