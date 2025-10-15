'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminQuartiersPage() {
  const quartiers = [
    {
      id: 1,
      nom: 'Cocody',
      commune: 'Cocody',
      prix_non_bati: 150000,
      prix_bati: 350000,
    },
    {
      id: 2,
      nom: 'Plateau',
      commune: 'Plateau',
      prix_non_bati: 200000,
      prix_bati: 450000,
    },
    {
      id: 3,
      nom: 'Marcory',
      commune: 'Marcory',
      prix_non_bati: 100000,
      prix_bati: 250000,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'commune', label: 'Commune' },
    {
      key: 'prix_non_bati',
      label: 'Prix non bâti (FCFA/m²)',
      render: (value: number) =>
        value ? new Intl.NumberFormat('fr-FR').format(value) : 'N/A',
    },
    {
      key: 'prix_bati',
      label: 'Prix bâti (FCFA/m²)',
      render: (value: number) =>
        value ? new Intl.NumberFormat('fr-FR').format(value) : 'N/A',
    },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des quartiers"
        data={quartiers}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/quartiers/new"
        searchPlaceholder="Rechercher un quartier..."
      />
    </AdminLayout>
  );
}

