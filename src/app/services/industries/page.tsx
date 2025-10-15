'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function IndustriesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['industries', searchQuery],
    queryFn: () => serviceService.getIndustries(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Industries"
        services={industries}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={industries.length}
      />
    </MainLayout>
  );
}

