'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ServiceList } from '@/components/ServiceList';
import { serviceService } from '@/services/serviceService';

export default function HospitaliersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: hospitaliers = [], isLoading } = useQuery({
    queryKey: ['hospitaliers', searchQuery],
    queryFn: () => serviceService.getHospitaliers(searchQuery),
  });

  return (
    <MainLayout>
      <ServiceList
        title="Établissements Hospitaliers"
        services={hospitaliers}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        total={hospitaliers.length}
      />
    </MainLayout>
  );
}

