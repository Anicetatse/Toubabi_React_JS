'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function CommercesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: commerces = [], isLoading } = useQuery({
    queryKey: ['commerces', searchQuery],
    queryFn: () => serviceService.getCommerces(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Commerces"
        services={commerces}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={commerces.length}
      />
    </MainLayout>
  );
}

