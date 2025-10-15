'use client';

import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { produitService } from '@/services/produitService';
import { wishlistService } from '@/services/wishlistService';
import Link from 'next/link';
import { Package, Heart, User, PlusCircle, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: annonces = [] } = useQuery({
    queryKey: ['my-annonces'],
    queryFn: produitService.getMine,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getAll,
  });

  const stats = [
    {
      title: 'Mes annonces',
      value: annonces.length,
      icon: Package,
      link: '/mon-espace/annonces',
      color: 'blue',
    },
    {
      title: 'Mes favoris',
      value: wishlist.length,
      icon: Heart,
      link: '/mon-espace/wishlist',
      color: 'red',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">
              Bienvenue, {user?.name} 👋
            </h1>
            <p className="text-gray-600">
              Gérez vos annonces et suivez vos favoris
            </p>
          </div>

          {/* Statistiques */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Link key={stat.title} href={stat.link}>
                <Card className="transition-shadow hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon
                      className={`h-5 w-5 text-${stat.color}-600`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            <Card className="bg-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Nouvelle annonce
                </CardTitle>
                <PlusCircle className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm opacity-90">
                  Déposez une nouvelle annonce immobilière
                </p>
                <Button variant="secondary" asChild>
                  <Link href="/deposer-annonce">Déposer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mes annonces récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {annonces.length > 0 ? (
                  <div className="space-y-3">
                    {annonces.slice(0, 3).map((annonce) => (
                      <Link
                        key={annonce.id}
                        href={`/biens/${annonce.id}`}
                        className="block rounded-lg border p-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="font-semibold">{annonce.titre}</div>
                        <div className="text-sm text-gray-600">
                          {annonce.statut}
                        </div>
                      </Link>
                    ))}
                    {annonces.length > 3 && (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/mon-espace/annonces">
                          Voir toutes mes annonces
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    Aucune annonce pour le moment
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Mon profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Nom</div>
                  <div className="font-medium">{user?.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{user?.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Téléphone</div>
                  <div className="font-medium">
                    {user?.telephone || 'Non renseigné'}
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/mon-espace/profile">
                    Modifier mon profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

