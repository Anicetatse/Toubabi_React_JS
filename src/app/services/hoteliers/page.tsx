'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function HoteliersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: hoteliers = [], isLoading } = useQuery({
    queryKey: ['hoteliers', searchQuery],
    queryFn: () => serviceService.getHoteliers(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Hôteliers"
        services={hoteliers}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={hoteliers.length}
      />
    </MainLayout>
  );
}

