'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminTemplatesPage() {
  const templates = [
    {
      id: 1,
      titre: 'Acquérir un terrain en toute sécurité',
      slug: 'acquerir-terrain-securite',
      actif: true,
    },
    {
      id: 2,
      titre: 'Le titre foncier',
      slug: 'titre-foncier',
      actif: true,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'actif',
      label: 'Statut',
      render: (value: boolean) =>
        value ? (
          <Badge className="bg-green-100 text-green-600">Actif</Badge>
        ) : (
          <Badge variant="secondary">Inactif</Badge>
        ),
    },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des templates/articles"
        data={templates}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/templates/new"
        searchPlaceholder="Rechercher un template..."
      />
    </AdminLayout>
  );
}

