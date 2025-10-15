'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { locationService } from '@/services/locationService';
import { Quartier } from '@/types';
import { Search, Loader2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Chargement dynamique du composant MapDirect pour éviter les erreurs SSR
const MapComponent = dynamic(
  () => import('@/components/MapDirect').then((mod) => ({ default: mod.MapDirect })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    ),
  }
);

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null);

  // Récupérer les quartiers avec leurs prix depuis la BDD
  const { data: quartiers = [], isLoading } = useQuery({
    queryKey: ['quartiers-with-prices'],
    queryFn: async () => {
      const response = await fetch('/api/quartiers');
      const result = await response.json();
      return result.data || [];
    },
  });

  // Filtrer les quartiers selon la recherche
  const filteredQuartiers = quartiers.filter((quartier: Quartier) =>
    quartier.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuartierClick = (quartier: Quartier) => {
    setSelectedQuartier(quartier);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const computeCoutEstimatif = (quartier: Quartier | null) => {
    if (!quartier) return null;
    const moyen = quartier.prix_moyen ? parseFloat(quartier.prix_moyen) : NaN;
    const marchand = quartier.prix_marchand ? parseFloat(quartier.prix_marchand) : NaN;
    const venal = quartier.prix_venal ? parseFloat(quartier.prix_venal) : NaN;
    if (!isNaN(moyen)) return moyen;
    if (!isNaN(marchand)) return marchand;
    if (!isNaN(venal)) return venal;
    return null;
  };

  return (
    <MainLayout>
      <div className="relative h-[calc(100vh-4rem)]">
        {/* Barre de recherche */}
        <div className="absolute left-4 right-4 top-4 z-10 md:left-8 md:right-auto md:w-96">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un quartier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && filteredQuartiers.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-md border bg-white">
                  {filteredQuartiers.slice(0, 10).map((quartier: Quartier) => (
                    <button
                      key={quartier.id}
                      onClick={() => {
                        handleQuartierClick(quartier);
                        setSearchQuery('');
                      }}
                      className="w-full border-b px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 last:border-b-0"
                    >
                      <div className="font-medium">{quartier.nom}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panneau d'information */}
        {selectedQuartier && (
          <div className="absolute bottom-4 left-4 right-4 z-10 md:left-8 md:right-auto md:w-96">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedQuartier.nom}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left font-semibold">
                            Valeur Vénale * (FCFA)
                          </th>
                          <th className="border border-gray-300 p-2 text-left font-semibold">
                            Valeur Marchande * (FCFA)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-3 text-blue-700 font-bold text-lg">
                            {selectedQuartier.prix_venal 
                              ? formatPrice(parseFloat(selectedQuartier.prix_venal)) 
                              : '-'}
                          </td>
                          <td className="border border-gray-300 p-3 text-green-700 font-bold text-lg">
                            {selectedQuartier.prix_marchand 
                              ? formatPrice(parseFloat(selectedQuartier.prix_marchand)) 
                              : '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="rounded-lg bg-gray-50 p-3 border-l-4 border-gray-400">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Coût estimatif actualisé ** (FCFA)
                    </p>
                    <p className="text-xl font-bold text-gray-600">
                      {(() => {
                        const v = computeCoutEstimatif(selectedQuartier);
                        return v ? formatPrice(v) : '-';
                      })()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-900 mb-2">
                      <strong>*Ces données sont des planchers indicatifs</strong> fournis par le Service
                      Cadastre de la Direction Générale des Impôts et peuvent ne pas
                      refléter la réalité du marché dans plusieurs zones géographiques. 
                      Contactez nos équipes pour plus d'informations.
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-2">NOUS CONTACTER</p>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        contact@toubabi.com
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +225 05 85 32 50 50
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedQuartier(null)}
                  >
                    Fermer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Carte */}
        {isLoading ? (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        ) : (
          <MapComponent
            quartiers={quartiers}
            onQuartierClick={handleQuartierClick}
            selectedQuartier={selectedQuartier}
          />
        )}

        {/* Bannière d'information retirée */}
      </div>
    </MainLayout>
  );
}
