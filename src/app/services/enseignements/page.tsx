'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function EnseignementsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: enseignements = [], isLoading } = useQuery({
    queryKey: ['enseignements', searchQuery],
    queryFn: () => serviceService.getEnseignements(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Établissements d'Enseignement"
        services={enseignements}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={enseignements.length}
      />
    </MainLayout>
  );
}

