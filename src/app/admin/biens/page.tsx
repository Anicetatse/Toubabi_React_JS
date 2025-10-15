'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { produitService } from '@/services/produitService';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminBiensPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-biens', page, search],
    queryFn: () => produitService.getAll(page, { search }),
  });

  const deleteMutation = useMutation({
    mutationFn: produitService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-biens'] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des biens</h1>
            <p className="text-gray-600">
              Gérez tous les biens immobiliers de la plateforme
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/biens/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau bien
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un bien..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : data?.data.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center text-gray-400">
                Aucun bien trouvé
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">ID</th>
                        <th className="pb-3 font-medium">Titre</th>
                        <th className="pb-3 font-medium">Prix</th>
                        <th className="pb-3 font-medium">Localisation</th>
                        <th className="pb-3 font-medium">Statut</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data?.data.map((bien) => (
                        <tr key={bien.id} className="text-sm">
                          <td className="py-3">#{bien.id}</td>
                          <td className="py-3">
                            <div className="font-medium">{bien.titre}</div>
                            <div className="text-xs text-gray-500">
                              {bien.categorie?.nom}
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-blue-600">
                            {formatPrice(bien.prix)}
                          </td>
                          <td className="py-3">
                            {bien.quartier?.nom || 'N/A'}
                            {bien.quartier?.commune && (
                              <div className="text-xs text-gray-500">
                                {bien.quartier.commune.nom}
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            {bien.statut === 'actif' ? (
                              <Badge className="bg-green-100 text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="mr-1 h-3 w-3" />
                                {bien.statut}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">
                              {bien.type_annonce?.nom}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <Link href={`/biens/${bien.id}`} target="_blank">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <Link href={`/admin/biens/${bien.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(bien.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data && data.last_page > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page {page} sur {data.last_page}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                      disabled={page === data.last_page}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

