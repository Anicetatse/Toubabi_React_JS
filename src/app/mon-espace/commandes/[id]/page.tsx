'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientMenu } from '@/components/ClientMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CommandeDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const commandeId = Number(resolvedParams.id);

  // Mock data - À remplacer par vraie requête
  const { data: commande, isLoading } = useQuery({
    queryKey: ['commande', commandeId],
    queryFn: async () => {
      return {
        id: commandeId,
        quantite: 2,
        montant: 45000000,
        created_at: '2024-10-10',
        articles: [
          {
            code_prod: 'BN001',
            nom: 'Villa moderne à Cocody',
            quantite: 1,
            prix_vente: 35000000,
            image: '/placeholder-property.jpg',
          },
          {
            code_prod: 'BN002',
            nom: 'Appartement 3 pièces',
            quantite: 1,
            prix_vente: 10000000,
            image: '/placeholder-property.jpg',
          },
        ],
        methode_paiement: 'Paypal',
      };
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Menu latéral - 3 colonnes */}
            <div className="lg:col-span-3">
              <ClientMenu />
            </div>

            {/* Contenu principal - 8 colonnes */}
            <div className="lg:col-span-8">
              {isLoading ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-white shadow">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="mb-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/mon-espace/commandes">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour
                        </Link>
                      </Button>
                    </div>
                    <p className="text-2xl font-bold">Détails commande</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Info commande */}
                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                      <span className="block text-xl font-semibold text-red-600">
                        Commande n° {commande.id}
                      </span>
                      <span className="mt-1 block text-gray-700">
                        {commande.quantite} article{commande.quantite > 1 ? 's' : ''}
                      </span>
                      <span className="mt-1 block text-gray-700">
                        Montant : {formatPrice(commande.montant)} FCFA
                      </span>
                    </div>

                    {/* Articles commandés */}
                    <Card>
                      <CardHeader className="bg-white">
                        <div className="text-xl font-bold text-red-600">
                          Articles commandés
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        {commande.articles.map((article: any, index: number) => (
                          <div
                            key={article.code_prod}
                            className={`flex items-center gap-4 p-4 ${
                              index < commande.articles.length - 1 ? 'border-b' : ''
                            }`}
                          >
                            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded">
                              <Image
                                src={article.image}
                                alt={article.nom}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <span className="block text-lg font-bold text-gray-900">
                                {article.nom}
                              </span>
                              <span className="mt-1 block text-sm text-gray-600">
                                Quantité : {article.quantite}
                              </span>
                              <span className="mt-1 block text-sm text-gray-600">
                                Prix : {formatPrice(article.prix_vente)} FCFA
                              </span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Méthode de paiement */}
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <Card>
                        <CardHeader className="bg-white">
                          <div className="text-xl font-bold text-red-600">
                            Méthode de paiement
                          </div>
                        </CardHeader>
                        <CardContent>
                          <strong>{commande.methode_paiement}</strong>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

