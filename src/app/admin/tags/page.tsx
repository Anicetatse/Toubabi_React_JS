'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminTagsPage() {
  const tags = [
    { id: 1, nom: 'Piscine', count: 12 },
    { id: 2, nom: 'Jardin', count: 25 },
    { id: 3, nom: 'Garage', count: 18 },
    { id: 4, nom: 'Climatisé', count: 35 },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    {
      key: 'count',
      label: 'Utilisations',
      render: (value: number) => (
        <Badge variant="outline">{value} biens</Badge>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des tags"
        data={tags}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/tags/new"
        searchPlaceholder="Rechercher un tag..."
      />
    </AdminLayout>
  );
}

