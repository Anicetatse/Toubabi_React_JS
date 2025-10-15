'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { produitService } from '@/services/produitService';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Eye, Loader2, Package } from 'lucide-react';

export default function MesAnnoncesPage() {
  const queryClient = useQueryClient();

  const { data: annonces = [], isLoading } = useQuery({
    queryKey: ['my-annonces'],
    queryFn: produitService.getMine,
  });

  const deleteMutation = useMutation({
    mutationFn: produitService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-annonces'] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
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
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
              <p className="text-gray-600">
                Gérez toutes vos annonces immobilières
              </p>
            </div>
            <Button asChild>
              <Link href="/deposer-annonce">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle annonce
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          ) : annonces.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 text-gray-300">
                  <Package className="mx-auto h-16 w-16" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Aucune annonce
                </h3>
                <p className="mb-6 text-gray-600">
                  Vous n'avez pas encore publié d'annonce
                </p>
                <Button asChild>
                  <Link href="/deposer-annonce">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer ma première annonce
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {annonces.map((annonce) => {
                const mainImage =
                  annonce.images?.[0]?.url || '/placeholder-property.jpg';
                return (
                  <Card key={annonce.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <Link
                          href={`/biens/${annonce.id}`}
                          className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg"
                        >
                          <Image
                            src={mainImage}
                            alt={annonce.titre}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <Link
                                  href={`/biens/${annonce.id}`}
                                  className="text-xl font-semibold hover:text-blue-600"
                                >
                                  {annonce.titre}
                                </Link>
                                {annonce.quartier && (
                                  <p className="mt-1 text-sm text-gray-600">
                                    {annonce.quartier.nom}
                                    {annonce.quartier.commune &&
                                      `, ${annonce.quartier.commune.nom}`}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  {formatPrice(annonce.prix)}
                                </div>
                                <Badge
                                  variant={
                                    annonce.statut === 'actif'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="mt-2"
                                >
                                  {annonce.statut}
                                </Badge>
                              </div>
                            </div>

                            <p className="line-clamp-2 text-sm text-gray-600">
                              {annonce.description}
                            </p>

                            <div className="mt-2 flex gap-4 text-sm text-gray-600">
                              {annonce.surface && (
                                <span>{annonce.surface} m²</span>
                              )}
                              {annonce.nombre_chambres && (
                                <span>{annonce.nombre_chambres} chambres</span>
                              )}
                              {annonce.categorie && (
                                <span>{annonce.categorie.nom}</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/biens/${annonce.id}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/mon-espace/annonces/${annonce.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDelete(annonce.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

