'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { Quartier } from '@/types';
import { Loader2 } from 'lucide-react';

// Carte Biens (bâti): tableaux par type de bien
const MapComponent = dynamic(
  () => import('@/components/MapBiens'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    ),
  }
);

export default function CartographieBatiPage() {
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null);

  // Données détaillées par type (pour Bâti/Construction)
  const { data: quartiers = [], isLoading } = useQuery({
    queryKey: ['quartiers-carto'],
    queryFn: async () => {
      const response = await fetch('/api/quartiers-carto');
      const result = await response.json();
      return result.data || [];
    },
  });

  return (
    <MainLayout>
      <div className="relative h-[calc(100vh-4rem)]">
        <div className="w-full h-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <MapComponent quartiers={quartiers} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}


