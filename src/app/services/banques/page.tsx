'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function BanquesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: banques = [], isLoading } = useQuery({
    queryKey: ['banques', searchQuery],
    queryFn: () => serviceService.getBanques(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Banques"
        services={banques}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={banques.length}
      />
    </MainLayout>
  );
}

