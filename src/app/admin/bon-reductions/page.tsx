'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminBonReductionsPage() {
  const bonReductions = [
    {
      id: 1,
      code: 'PROMO2024',
      pourcentage: 10,
      valeur_max: 1000000,
      actif: true,
      date_expiration: '2024-12-31',
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Code' },
    {
      key: 'pourcentage',
      label: 'Réduction',
      render: (value: number) => `${value}%`,
    },
    {
      key: 'valeur_max',
      label: 'Valeur max',
      render: (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`,
    },
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
    {
      key: 'date_expiration',
      label: 'Expiration',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des bons de réduction"
        data={bonReductions}
        columns={columns}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/bon-reductions/new"
      />
    </AdminLayout>
  );
}

