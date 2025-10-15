'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminStationsPage() {
  const stations = [
    { id: 1, nom: 'Total Cocody', commune: 'Cocody', contact: '+225 07 00 00 00 01' },
    { id: 2, nom: 'Shell Plateau', commune: 'Plateau', contact: '+225 07 00 00 00 02' },
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
        title="Gestion des stations-service"
        data={stations}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/stations/new"
        searchPlaceholder="Rechercher une station..."
      />
    </AdminLayout>
  );
}

