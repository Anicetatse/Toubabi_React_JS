'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminCaracteristiquesPage() {
  const caracteristiques = [
    {
      id: 1,
      nom: 'Piscine',
      type: 'checkbox',
      actif: true,
    },
    {
      id: 2,
      nom: 'Nombre de chambres',
      type: 'number',
      actif: true,
    },
    {
      id: 3,
      nom: 'Climatisation',
      type: 'checkbox',
      actif: true,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'type', label: 'Type' },
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
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des caractéristiques"
        data={caracteristiques}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/caracteristiques/new"
        searchPlaceholder="Rechercher une caractéristique..."
      />
    </AdminLayout>
  );
}

