'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Pagination } from '@/components/admin/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye, 
  Heart,
  User,
  Calendar,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface Wishlist {
  id: number;
  id_client: number;
  code_produit: string;
  created_at: string;
  client_nom: string;
  client_email: string;
  produit_nom: string;
}

export default function AdminWishlistsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'client_nom' | 'produit_nom' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/wishlists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlists(data.wishlists || []);
      } else {
        toast.error('Erreur lors du chargement des favoris');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      toast.error('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce favori ?')) {
      return;
    }

    const loadingToast = toast.loading('Suppression en cours...');

    try {
      const response = await fetch(`/api/admin/wishlists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });

      if (response.ok) {
        setWishlists(wishlists.filter(w => w.id !== id));
        toast.success('Favori supprimé avec succès', { id: loadingToast });
      } else {
        toast.error('Erreur lors de la suppression', { id: loadingToast });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression', { id: loadingToast });
    }
  };

  // Fonction de tri
  const handleSort = (field: 'client_nom' | 'produit_nom' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtrer les favoris côté client
  const filteredWishlists = wishlists.filter(wishlist => {
    const searchLower = searchInput.toLowerCase();
    return searchInput === '' || 
      wishlist.client_nom?.toLowerCase().includes(searchLower) ||
      wishlist.produit_nom?.toLowerCase().includes(searchLower) ||
      wishlist.code_produit?.toLowerCase().includes(searchLower);
  });

  // Trier les favoris
  const sortedWishlists = [...filteredWishlists].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedWishlists.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWishlists = sortedWishlists.slice(startIndex, endIndex);

  // Réinitialiser la page quand on filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput]);

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Favoris</h1>
          <p className="text-gray-600">
            Consultez tous les favoris des utilisateurs
          </p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Favoris</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredWishlists.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs uniques</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(wishlists.map(w => w.id_client)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par client, bien..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('client_nom')}
                    >
                      <div className="flex items-center gap-2">
                        Client
                        {sortField === 'client_nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('produit_nom')}
                    >
                      <div className="flex items-center gap-2">
                        Bien
                        {sortField === 'produit_nom' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-2">
                        Date d'ajout
                        {sortField === 'created_at' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        ) : <ArrowUpDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWishlists.length > 0 ? (
                    paginatedWishlists.map((wishlist) => (
                      <tr key={wishlist.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900 font-medium">{wishlist.client_nom}</p>
                          <p className="text-xs text-gray-600">{wishlist.client_email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Link 
                            href={`/biens/${wishlist.code_produit}`}
                            target="_blank"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span className="truncate max-w-[200px]">{wishlist.produit_nom}</span>
                            <Eye className="h-3 w-3 flex-shrink-0" />
                          </Link>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>
                              {new Date(wishlist.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                              {' à '}
                              {new Date(wishlist.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(wishlist.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        Aucun favori trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Pro */}
            {sortedWishlists.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={sortedWishlists.length}
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
