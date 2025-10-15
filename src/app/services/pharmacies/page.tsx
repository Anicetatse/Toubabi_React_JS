'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function PharmaciesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['pharmacies', searchQuery],
    queryFn: () => serviceService.getPharmacies(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Liste des Pharmacies"
        services={pharmacies}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={pharmacies.length}
      />
    </MainLayout>
  );
}

