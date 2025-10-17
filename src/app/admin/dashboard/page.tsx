'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ShoppingCart, Heart, TrendingUp, Package, MapPin, Globe, Eye, EyeOff } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: dashboardData, isLoading, error } = useDashboardStats();

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
    console.error('Erreur dashboard:', error);
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erreur lors du chargement des statistiques</h2>
            <p className="text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Une erreur est survenue'}
            </p>
            <p className="text-sm text-gray-600">
              Vérifiez que vous êtes bien connecté et que vous avez les droits d'accès admin.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      title: 'Total Biens',
      value: dashboardData?.biens.total.toString() || '0',
      icon: Building2,
      color: 'bg-blue-500',
      description: `${dashboardData?.biens.actifs || 0} actifs, ${dashboardData?.biens.inactifs || 0} inactifs`,
    },
    {
      title: 'Utilisateurs',
      value: dashboardData?.utilisateurs.total.toString() || '0',
      icon: Users,
      color: 'bg-green-500',
      description: `${dashboardData?.utilisateurs.admins || 0} admins`,
    },
    {
      title: 'Commandes',
      value: dashboardData?.commandes.total.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-orange-500',
      description: `${dashboardData?.commandes.enAttente || 0} en attente`,
    },
    {
      title: 'Géographie',
      value: `${dashboardData?.geographie.communes || 0} communes`,
      icon: MapPin,
      color: 'bg-purple-500',
      description: `${dashboardData?.geographie.quartiers || 0} quartiers`,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Vue d'ensemble de votre plateforme immobilière
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <p className="mt-2 text-sm text-gray-600">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Dernières annonces */}
          <Card>
            <CardHeader>
              <CardTitle>Dernières annonces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.derniersBiens?.length ? (
                  dashboardData.derniersBiens.map((bien) => (
                    <div
                      key={bien.id}
                      className="flex items-center justify-between border-b pb-3 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{bien.nom}</p>
                        <p className="text-xs text-gray-600">
                          {bien.client_nom} • {bien.commune_nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(bien.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={bien.enabled ? "default" : "secondary"}
                          className={bien.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {bien.enabled ? 'Actif' : 'Inactif'}
                        </Badge>
                        <span className="text-xs font-medium text-gray-900">
                          {formatPrice(bien.prix_vente)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune annonce récente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.activitesRecentes?.length ? (
                  dashboardData.activitesRecentes.map((activite, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 border-b pb-3 last:border-b-0"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activite.action}</p>
                        <p className="text-xs text-gray-600">{activite.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activite.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques par commune */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par commune</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dashboardData?.statsParCommune?.length ? (
                dashboardData.statsParCommune.map((commune) => (
                  <div
                    key={commune.id}
                    className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{commune.nom}</h3>
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total biens:</span>
                        <span className="font-medium">{commune.total_biens}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Actifs:</span>
                        <span className="font-medium text-green-600">{commune.biens_actifs}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">En attente:</span>
                        <span className="font-medium text-orange-600">{commune.biens_en_attente}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center col-span-full py-8">
                  Aucune statistique par commune disponible
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

