'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminSousMenusPage() {
  const sousMenus = [
    {
      id: 1,
      titre: 'Acquérir un terrain',
      menu: 'Tout savoir',
      ordre: 1,
    },
    {
      id: 2,
      titre: 'Le titre foncier',
      menu: 'Tout savoir',
      ordre: 2,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'menu', label: 'Menu parent' },
    { key: 'ordre', label: 'Ordre' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des sous-menus"
        data={sousMenus}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/sous-menus/new"
        searchPlaceholder="Rechercher un sous-menu..."
      />
    </AdminLayout>
  );
}

