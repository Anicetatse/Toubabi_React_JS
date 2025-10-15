'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminIndustriesPage() {
  const industries = [
    { id: 1, nom: 'Zone Industrielle Yopougon', commune: 'Yopougon', contact: '+225 07 00 00 00 01' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'commune', label: 'Commune' },
    { key: 'contact', label: 'Contact' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des industries"
        data={industries}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/industries/new"
        searchPlaceholder="Rechercher une industrie..."
      />
    </AdminLayout>
  );
}

