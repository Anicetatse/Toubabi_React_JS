'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function AdminSlidersPage() {
  const sliders = [
    {
      id: 1,
      titre: 'Bienvenue sur Toubabi',
      sous_titre: 'Trouvez votre bien idéal',
      image: '/assets/images/banner-1.jpg',
      ordre: 1,
      actif: true,
    },
    {
      id: 2,
      titre: 'Construction sereine',
      sous_titre: 'Nous vous accompagnons',
      image: '/assets/images/banner-2.jpg',
      ordre: 2,
      actif: true,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'image',
      label: 'Image',
      render: (value: string) => (
        <div className="relative h-12 w-24 overflow-hidden rounded">
          <Image src={value} alt="Slider" fill className="object-cover" />
        </div>
      ),
    },
    { key: 'titre', label: 'Titre' },
    { key: 'sous_titre', label: 'Sous-titre' },
    { key: 'ordre', label: 'Ordre' },
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
        title="Gestion des sliders"
        data={sliders}
        columns={columns}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/sliders/new"
      />
    </AdminLayout>
  );
}

