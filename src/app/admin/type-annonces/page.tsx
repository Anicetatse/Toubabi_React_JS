'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminTypeAnnoncesPage() {
  const typeAnnonces = [
    { id: 1, nom: 'Vente', description: 'Bien à vendre' },
    { id: 2, nom: 'Location', description: 'Bien à louer' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des types d'annonces"
        data={typeAnnonces}
        columns={columns}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/type-annonces/new"
      />
    </AdminLayout>
  );
}

