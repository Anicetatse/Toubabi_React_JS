'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function ServicesPublicsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services-publics', searchQuery],
    queryFn: () => serviceService.getServicesPublics(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Services Publics"
        services={services}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={services.length}
      />
    </MainLayout>
  );
}

