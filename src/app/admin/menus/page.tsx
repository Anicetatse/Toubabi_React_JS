'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminMenusPage() {
  const menus = [
    { id: 1, titre: 'Accueil', lien: '/', ordre: 1, actif: true },
    { id: 2, titre: 'Biens', lien: '/biens', ordre: 2, actif: true },
    { id: 3, titre: 'Services', lien: '/services', ordre: 3, actif: true },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    { key: 'lien', label: 'Lien' },
    { key: 'ordre', label: 'Ordre' },
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
        title="Gestion des menus"
        data={menus}
        columns={columns}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/menus/new"
      />
    </AdminLayout>
  );
}

