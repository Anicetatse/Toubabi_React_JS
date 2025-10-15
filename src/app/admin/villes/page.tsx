'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminVillesPage() {
  const villes = [
    { id: 1, nom: 'Abidjan', pays: 'Côte d\'Ivoire', enabled: true },
    { id: 2, nom: 'Yamoussoukro', pays: 'Côte d\'Ivoire', enabled: true },
    { id: 3, nom: 'Bouaké', pays: 'Côte d\'Ivoire', enabled: true },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'pays', label: 'Pays' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des villes"
        data={villes}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/villes/new"
        searchPlaceholder="Rechercher une ville..."
      />
    </AdminLayout>
  );
}

