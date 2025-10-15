import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Building2, MapPin, DollarSign } from 'lucide-react';

export default function StatsPage() {
  const stats = [
    {
      title: 'Total Biens',
      value: '247',
      icon: Building2,
      color: 'blue',
    },
    {
      title: 'Quartiers',
      value: '156',
      icon: MapPin,
      color: 'green',
    },
    {
      title: 'Prix moyen',
      value: '25M FCFA',
      icon: DollarSign,
      color: 'orange',
    },
    {
      title: 'Croissance',
      value: '+18%',
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-center text-4xl font-bold">
            Statistiques du marché immobilier
          </h1>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution des prix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-96 items-center justify-center bg-gray-50">
                <p className="text-gray-400">
                  Graphiques de statistiques à intégrer (Chart.js ou Recharts)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

