'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminHospitaliersPage() {
  const hospitaliers = [
    { id: 1, nom: 'CHU Cocody', commune: 'Cocody', contact: '+225 07 00 00 00 01' },
    { id: 2, nom: 'Clinique Farah', commune: 'Plateau', contact: '+225 07 00 00 00 02' },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'commune', label: 'Commune' },
    { key: 'contact', label: 'Contact' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des établissements hospitaliers"
        data={hospitaliers}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/hospitaliers/new"
        searchPlaceholder="Rechercher un établissement..."
      />
    </AdminLayout>
  );
}

