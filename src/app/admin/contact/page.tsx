'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminContactPage() {
  const messages = [
    {
      id: 1,
      nom: 'Jean Kouassi',
      email: 'jean@example.com',
      sujet: 'Question sur un bien',
      message: 'Je voudrais avoir plus d\'informations...',
      lu: false,
      created_at: '2024-10-15',
    },
    {
      id: 2,
      nom: 'Marie Diallo',
      email: 'marie@example.com',
      sujet: 'Demande de partenariat',
      message: 'Nous souhaitons devenir partenaires...',
      lu: true,
      created_at: '2024-10-14',
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'sujet', label: 'Sujet' },
    {
      key: 'lu',
      label: 'Statut',
      render: (value: boolean) =>
        value ? (
          <Badge variant="secondary">Lu</Badge>
        ) : (
          <Badge className="bg-blue-100 text-blue-600">Non lu</Badge>
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
        title="Messages de contact"
        data={messages}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onDelete={(id) => console.log('Delete:', id)}
        searchPlaceholder="Rechercher un message..."
      />
    </AdminLayout>
  );
}

