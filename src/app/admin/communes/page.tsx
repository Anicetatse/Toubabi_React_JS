'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminCommunesPage() {
  const communes = [
    { id: 1, nom: 'Cocody', ville: 'Abidjan', enabled: true },
    { id: 2, nom: 'Plateau', ville: 'Abidjan', enabled: true },
    { id: 3, nom: 'Marcory', ville: 'Abidjan', enabled: true },
    { id: 4, nom: 'Yopougon', ville: 'Abidjan', enabled: true },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'ville', label: 'Ville' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des communes"
        data={communes}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/communes/new"
        searchPlaceholder="Rechercher une commune..."
      />
    </AdminLayout>
  );
}

