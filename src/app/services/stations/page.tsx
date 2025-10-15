'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function StationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stations = [], isLoading } = useQuery({
    queryKey: ['stations', searchQuery],
    queryFn: () => serviceService.getStations(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Stations-service"
        services={stations}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={stations.length}
      />
    </MainLayout>
  );
}

