'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminCommercesPage() {
  const commerces = [
    { id: 1, nom: 'Supermarché Casino', commune: 'Cocody', contact: '+225 07 00 00 00 01' },
    { id: 2, nom: 'Cap Sud', commune: 'Marcory', contact: '+225 07 00 00 00 02' },
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
        title="Gestion des commerces"
        data={commerces}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/commerces/new"
        searchPlaceholder="Rechercher un commerce..."
      />
    </AdminLayout>
  );
}

