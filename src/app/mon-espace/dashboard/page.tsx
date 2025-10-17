'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { produitService } from '@/services/produitService';
import { wishlistService } from '@/services/wishlistService';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Heart, Clock, Edit, CheckCircle, PlusCircle, Eye, Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClientTopBar } from '@/components/ClientTopBar';

export default function DashboardPage() {
  const { user } = useAuth();

  // Charger les statistiques
  const { data: stats } = useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      const res = await fetch('/api/client/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await res.json();
      return data.success ? data.data : { total: 0, approuvees: 0, enAttente: 0, aModifier: 0, totalVues: 0 };
    },
  });

  // Charger les annonces récentes (pour l'affichage)
  const { data: response } = useQuery({
    queryKey: ['my-annonces-recent'],
    queryFn: async () => {
      const res = await fetch('/api/client/annonces?page=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await res.json();
      return data.success ? data.data : { data: [], total: 0 };
    },
  });

  const annonces = response?.data || [];

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getAll,
  });

  // Utiliser les stats de l'API
  const annoncesApprouvees = stats?.approuvees || 0;
  const annoncesEnAttente = stats?.enAttente || 0;
  const annoncesAModifier = stats?.aModifier || 0;
  const totalAnnoncesClient = stats?.total || 0;
  const totalVues = stats?.totalVues || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          <ClientTopBar />

          {/* Contenu principal pleine largeur */}
          <div className="flex-1">
            {/* Statistiques - 3 widgets */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {/* Annonces approuvées */}
              <Link href="/mon-espace/annonces?status=approved">
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-bold text-green-600 mb-2">
                          {annoncesApprouvees}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Annonce(s) approuvée(s)
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-full p-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* En attente */}
              <Link href="/mon-espace/annonces?status=pending">
                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-bold text-orange-600 mb-2">
                          {annoncesEnAttente}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          En attente d'approbation
                        </p>
                      </div>
                      <div className="bg-orange-100 rounded-full p-4">
                        <Clock className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* À modifier */}
              <Link href="/mon-espace/annonces?status=draft">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-bold text-blue-600 mb-2">
                          {annoncesAModifier}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          Annonce(s) à modifier
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-full p-4">
                        <Edit className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Mes annonces récentes */}
            {annonces.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">Mes annonces récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(annonces) && annonces.slice(0, 5).map((annonce: any) => (
                      <div
                        key={annonce.code}
                        className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Image */}
                        <div className="w-24 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative">
                          {annonce.image ? (
                            <Image
                              src={annonce.image.startsWith('/') ? annonce.image : `/${annonce.image}`}
                              alt={annonce.nom || ''}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {annonce.nom || 'Annonce'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {annonce.enabled === 1 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Approuvée
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                                <Clock className="h-3 w-3" />
                                En attente
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Prix: {annonce.prix_vente ? formatPrice(annonce.prix_vente) : 'N/A'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          <Link href={`/biens/${annonce.code || annonce.id}`} target="_blank">
                            <Button size="sm" variant="ghost" title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/mon-espace/annonces/${annonce.code || annonce.id}`}>
                            <Button size="sm" variant="ghost" title="Modifier" className="text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" title="Booster" className="text-yellow-600">
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {totalAnnoncesClient > 5 && (
                      <div className="pt-4 border-t">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/mon-espace/annonces">
                            Voir toutes mes annonces ({totalAnnoncesClient})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message si pas d'annonces */}
            {annonces.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                    <Package className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    Aucune annonce pour le moment
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Commencez par déposer votre première annonce et touchez des milliers de clients
                  </p>
                  <Link href="/deposer-annonce">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Déposer une annonce
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Favoris */}
            {wishlist.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Mes favoris
                    </CardTitle>
                    <Link href="/mon-espace/wishlist">
                      <Button variant="ghost" size="sm">
                        Voir tout ({wishlist.length})
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Vous avez {wishlist.length} bien(s) en favoris
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
