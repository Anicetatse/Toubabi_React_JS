'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminEstimationsPage() {
  const estimations = [
    {
      id: 1,
      email: 'jean@example.com',
      type_construction: 'Maison individuelle',
      surface: 150,
      nombre_etages: 1,
      finition: 'Standard',
      montant_estime: 37500000,
      created_at: '2024-10-15',
    },
    {
      id: 2,
      email: 'marie@example.com',
      type_construction: 'Villa',
      surface: 250,
      nombre_etages: 2,
      finition: 'Haut de gamme',
      montant_estime: 100000000,
      created_at: '2024-10-14',
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'type_construction', label: 'Type' },
    {
      key: 'surface',
      label: 'Surface',
      render: (value: number) => `${value} m²`,
    },
    {
      key: 'montant_estime',
      label: 'Montant estimé',
      render: (value: number) =>
        `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`,
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
        title="Gestion des estimations"
        data={estimations}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onDelete={(id) => console.log('Delete:', id)}
        searchPlaceholder="Rechercher une estimation..."
      />
    </AdminLayout>
  );
}

