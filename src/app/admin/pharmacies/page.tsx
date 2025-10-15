'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminPharmaciesPage() {
  const pharmacies = [
    {
      id: 1,
      nom: 'Pharmacie Centrale',
      commune: 'Plateau',
      contact: '+225 07 00 00 00 01',
      description: 'Pharmacie ouverte 24/7',
    },
    {
      id: 2,
      nom: 'Pharmacie du Nord',
      commune: 'Cocody',
      contact: '+225 07 00 00 00 02',
      description: 'Pharmacie de quartier',
    },
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
        title="Gestion des pharmacies"
        data={pharmacies}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/pharmacies/new"
        searchPlaceholder="Rechercher une pharmacie..."
      />
    </AdminLayout>
  );
}

