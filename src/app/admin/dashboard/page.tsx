'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ShoppingCart, Heart, TrendingUp, Package } from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock data - À remplacer par de vraies requêtes API
  const stats = [
    {
      title: 'Total Biens',
      value: '247',
      icon: Building2,
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Utilisateurs',
      value: '1,834',
      icon: Users,
      change: '+18%',
      changeType: 'positive',
    },
    {
      title: 'Commandes',
      value: '156',
      icon: ShoppingCart,
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Annonces actives',
      value: '89',
      icon: Package,
      change: '-3%',
      changeType: 'negative',
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
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p
                    className={`mt-1 text-xs ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change} ce mois
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">Villa moderne à Cocody</p>
                      <p className="text-sm text-gray-600">Il y a 2 heures</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                      Actif
                    </span>
                  </div>
                ))}
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
                {[
                  'Nouvel utilisateur inscrit',
                  'Commande #1234 passée',
                  'Bien #567 modifié',
                  'Nouveau commentaire',
                  'Bien #890 publié',
                ].map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border-b pb-3 last:border-b-0"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity}</p>
                      <p className="text-xs text-gray-600">Il y a {i + 1}h</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center bg-gray-50">
              <p className="text-gray-400">
                Graphiques à venir (intégrer Chart.js ou Recharts)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

