'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminPaysPage() {
  const pays = [
    { id: 1, nom: 'Côte d\'Ivoire', code: 'CI' },
    { id: 2, nom: 'Sénégal', code: 'SN' },
    { id: 3, nom: 'Mali', code: 'ML' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'code', label: 'Code' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des pays"
        data={pays}
        columns={columns}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/pays/new"
      />
    </AdminLayout>
  );
}

