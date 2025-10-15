'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminArticlesPage() {
  const articles = [
    {
      id: 1,
      titre: 'Guide achat immobilier 2024',
      auteur: 'Admin',
      statut: 'publié',
      created_at: '2024-10-15',
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'auteur', label: 'Auteur' },
    {
      key: 'statut',
      label: 'Statut',
      render: (value: string) => (
        <Badge className="bg-green-100 text-green-600">{value}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des articles"
        data={articles}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/articles/new"
        searchPlaceholder="Rechercher un article..."
      />
    </AdminLayout>
  );
}

