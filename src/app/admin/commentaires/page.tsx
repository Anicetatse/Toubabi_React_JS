'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import Link from 'next/link';

export default function AdminCommentairesPage() {
  const commentaires = [
    {
      id: 1,
      user: 'Jean Kouassi',
      produit: 'Villa Cocody',
      contenu: 'Très beau bien !',
      created_at: '2024-10-15',
    },
    {
      id: 2,
      user: 'Marie Diallo',
      produit: 'Appartement Marcory',
      contenu: 'Intéressant...',
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
      key: 'contenu',
      label: 'Commentaire',
      render: (value: string) => (
        <span className="line-clamp-1">{value}</span>
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
        title="Gestion des commentaires"
        data={commentaires}
        columns={columns}
        onDelete={(id) => console.log('Delete:', id)}
        searchPlaceholder="Rechercher un commentaire..."
      />
    </AdminLayout>
  );
}

