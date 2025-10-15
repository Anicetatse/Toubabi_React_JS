'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminEnseignementsPage() {
  const enseignements = [
    { id: 1, nom: 'Université Félix Houphouët-Boigny', commune: 'Cocody', contact: '+225 07 00 00 00 01' },
    { id: 2, nom: 'Lycée Classique', commune: 'Plateau', contact: '+225 07 00 00 00 02' },
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
        title="Gestion des établissements d'enseignement"
        data={enseignements}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/enseignements/new"
        searchPlaceholder="Rechercher un établissement..."
      />
    </AdminLayout>
  );
}

