'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import Link from 'next/link';

export default function AdminWishlistsPage() {
  const wishlists = [
    {
      id: 1,
      user: 'Jean Kouassi',
      produit: 'Villa Cocody',
      produit_id: 1,
      created_at: '2024-10-15',
    },
    {
      id: 2,
      user: 'Marie Diallo',
      produit: 'Appartement Marcory',
      produit_id: 2,
      created_at: '2024-10-14',
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user', label: 'Utilisateur' },
    {
      key: 'produit',
      label: 'Bien',
      render: (value: string, row: any) => (
        <Link href={`/biens/${row.produit_id}`} className="text-blue-600 hover:underline">
          {value}
        </Link>
      ),
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
        title="Gestion des favoris"
        data={wishlists}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onDelete={(id) => console.log('Delete:', id)}
        searchPlaceholder="Rechercher un favori..."
      />
    </AdminLayout>
  );
}

