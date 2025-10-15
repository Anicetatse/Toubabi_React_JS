'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';

export default function AdminSousCategoriesPage() {
  // Mock data
  const sousCategories = [
    { id: 1, nom: 'Villa', categorie: 'Maison', enabled: true },
    { id: 2, nom: 'Duplex', categorie: 'Appartement', enabled: true },
    { id: 3, nom: 'Studio', categorie: 'Appartement', enabled: true },
    { id: 4, nom: 'Boutique', categorie: 'Commerce', enabled: true },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nom', label: 'Nom' },
    { key: 'categorie', label: 'Catégorie' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des sous-catégories"
        data={sousCategories}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/sous-categories/new"
        searchPlaceholder="Rechercher une sous-catégorie..."
      />
    </AdminLayout>
  );
}

