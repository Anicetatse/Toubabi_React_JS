'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminPrixPage() {
  const prix = [
    {
      id: 1,
      quartier: 'Cocody',
      prix_non_bati: 150000,
      prix_bati: 350000,
      annee: 2024,
    },
    {
      id: 2,
      quartier: 'Plateau',
      prix_non_bati: 200000,
      prix_bati: 450000,
      annee: 2024,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'quartier', label: 'Quartier' },
    {
      key: 'prix_non_bati',
      label: 'Prix non bâti (FCFA/m²)',
      render: (value: number) => new Intl.NumberFormat('fr-FR').format(value),
    },
    {
      key: 'prix_bati',
      label: 'Prix bâti (FCFA/m²)',
      render: (value: number) => new Intl.NumberFormat('fr-FR').format(value),
    },
    { key: 'annee', label: 'Année' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des prix indicatifs"
        data={prix}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        searchPlaceholder="Rechercher un quartier..."
      />
    </AdminLayout>
  );
}

