'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, ShoppingCart, Heart, TrendingUp, Package, MapPin, Globe, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Vérifier l'authentification côté client uniquement
    if (typeof window !== 'undefined') {
      setIsAuthenticated(!!localStorage.getItem('admin_token'));
    }
  }, []);

  const { data: dashboardData, isLoading, error } = useDashboardStats();
  
  // Charger le graphique séparément comme Laravel (ligne 31)
  const { data: chartData } = useQuery({
    queryKey: ['admin', 'chart', 'nouvelles-entrees'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('/api/admin/charts/nouvelles-entrees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Charger les données SMS Orange (lignes 39-45)
  const { data: smsData } = useQuery({
    queryKey: ['admin', 'sms', 'balance'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('/api/admin/sms/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: isAuthenticated,
  });

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

  // EXACTEMENT les mêmes widgets que Laravel (lignes 48-137)
  const stats = [
    // Widget 1 - Commandes non traitées (ligne 50-56)
    {
      title: 'Commande(s) non traitée(s)',
      value: dashboardData?.commandes.nonTraitees.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      progress: dashboardData?.commandes.nonTraitees || 0,
    },
    // Widget 2 - Commandes traitées (ligne 58-64)
    {
      title: 'Commande(s) traitée(s)',
      value: dashboardData?.commandes.traitees.toString() || '0',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      progress: dashboardData?.commandes.traitees || 0,
    },
    // Widget 3 - Utilisateurs (ligne 66-72)
    {
      title: 'Utilisateurs',
      value: dashboardData?.utilisateurs.total.toString() || '0',
      icon: Users,
      color: 'bg-yellow-500',
      progress: dashboardData?.utilisateurs.total || 0,
    },
    // Widget 4 - Admin (ligne 75-82)
    {
      title: 'Admin',
      value: dashboardData?.utilisateurs.admins.toString() || '0',
      icon: Users,
      color: 'bg-yellow-500',
      progress: dashboardData?.utilisateurs.admins || 0,
    },
    // Widget 5 - Biens actifs (ligne 84-91)
    {
      title: 'Biens actifs',
      value: dashboardData?.biens.actifs.toString() || '0',
      icon: Building2,
      color: 'bg-gray-500',
      progress: dashboardData?.biens.actifs || 0,
    },
    // Widget 6 - Biens non actifs (ligne 93-100)
    {
      title: 'Biens non actifs',
      value: dashboardData?.biens.nonActifs.toString() || '0',
      icon: Building2,
      color: 'bg-gray-500',
      progress: dashboardData?.biens.nonActifs || 0,
    },
    // Widget 7 - Villes (ligne 102-109)
    {
      title: 'Villes',
      value: dashboardData?.geographie.villes.toString() || '0',
      icon: MapPin,
      color: 'bg-gray-800',
      progress: dashboardData?.geographie.villes || 0,
    },
    // Widget 8 - Communes (ligne 111-118)
    {
      title: 'Communes',
      value: dashboardData?.geographie.communes.toString() || '0',
      icon: MapPin,
      color: 'bg-gray-800',
      progress: dashboardData?.geographie.communes || 0,
    },
    // Widget 9 - Quartiers (ligne 121-128)
    {
      title: 'Quartiers',
      value: dashboardData?.geographie.quartiers.toString() || '0',
      icon: MapPin,
      color: 'bg-gray-800',
      progress: dashboardData?.geographie.quartiers || 0,
    },
    // Widget 10 - SMS Restant (ligne 129-137)
    {
      title: smsData?.date_expiration 
        ? `SMS Restant jusqu'au ${new Date(smsData.date_expiration).toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric'
          })} à ${new Date(smsData.date_expiration).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}` 
        : 'SMS Restant',
      value: smsData?.balance.toString() || '0',
      icon: MessageSquare,
      color: 'bg-blue-400',
      progress: smsData?.balance || 0,
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

        {/* Statistiques - Avec barres de progression comme Laravel */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            // Calcul EXACT comme Laravel : 100 * valeur / 1000 (lignes 56, 136)
            const progressPercent = Math.min((100 * stat.progress) / 1000, 100);
            
            return (
              <Card key={stat.title} className={`border-0 text-white ${stat.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-6 w-6 text-white opacity-80" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs opacity-90 mb-2 min-h-[2rem]">{stat.title}</div>
                  {/* Barre de progression EXACTEMENT comme Laravel */}
                  <div className="w-full bg-white/20 rounded-sm h-1.5">
                    <div 
                      className="bg-white h-1.5 rounded-sm transition-all duration-300" 
                      style={{ width: `${progressPercent}%` }}
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

       
        {/* Graphique Nouvelles Entrées - EXACTEMENT comme Laravel (ligne 157-166) */}
        <Card>
          <CardHeader>
            <CardTitle>Nouvelles Entrées</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData ? (
              <div className="h-80">
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                      title: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    },
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-400">Chargement du graphique...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques sur les communes - EXACTEMENT comme Laravel (lignes 176-199) */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Statistiques sur les communes</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardData?.statsParCommune?.length ? (
              dashboardData.statsParCommune.map((commune) => (
                <Card key={commune.id} className="border-0 text-white bg-gray-800">
                  <CardContent className="p-6">
                    {/* Nom de la commune - ligne 183 */}
                    <div className="text-xl font-bold mb-2">{commune.nom}</div>
                    
                    {/* Total biens - ligne 184 */}
                    <div className="text-2xl font-bold mb-3">
                      {commune.total_biens} bien(s)
                    </div>
                    
                    {/* Biens approuvés - ligne 186 */}
                    <div className="text-sm mb-1">
                      {commune.biens_approuves} approuvé(s)
                    </div>
                    
                    {/* Biens en attente - ligne 187 */}
                    <div className="text-sm">
                      {commune.biens_en_attente} en attente(s)
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full py-8">
                Aucune statistique par commune disponible
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

