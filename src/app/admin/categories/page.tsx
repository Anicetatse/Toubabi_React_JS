'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function AdminCategoriesPage() {
  // Vraies données depuis la BDD
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      return result.data || [];
    },
  });

  const categories = categoriesData || [];

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'image',
      label: 'Image',
      render: (value: string) =>
        value ? (
          <div className="relative h-12 w-16 overflow-hidden rounded">
            <Image src={value} alt="Catégorie" fill className="object-cover" />
          </div>
        ) : (
          'N/A'
        ),
    },
    { key: 'nom', label: 'Nom' },
    { key: 'description', label: 'Description' },
    {
      key: 'enabled',
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
        title="Gestion des catégories"
        data={categories}
        columns={columns}
        isLoading={isLoading}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/categories/new"
        searchPlaceholder="Rechercher une catégorie..."
      />
    </AdminLayout>
  );
}

