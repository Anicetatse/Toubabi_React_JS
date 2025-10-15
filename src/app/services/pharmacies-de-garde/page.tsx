'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function PharmaciesDeGardePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['pharmacies-de-garde', searchQuery],
    queryFn: () => serviceService.getPharmaciesDeGarde(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Pharmacies de Garde"
        services={pharmacies}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={pharmacies.length}
      />
    </MainLayout>
  );
}

