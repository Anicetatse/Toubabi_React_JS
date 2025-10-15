'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import { Badge } from '@/components/ui/badge';

export default function AdminVideosPage() {
  const videos = [
    {
      id: 1,
      titre: 'Visite virtuelle Villa',
      url: '/assets/videos/video1.mp4',
      actif: true,
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'titre', label: 'Titre' },
    {
      key: 'url',
      label: 'URL',
      render: (value: string) => (
        <a href={value} target="_blank" className="text-blue-600 hover:underline">
          Voir la vidéo
        </a>
      ),
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
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des vidéos"
        data={videos}
        columns={columns}
        onEdit={(id) => console.log('Edit:', id)}
        onDelete={(id) => console.log('Delete:', id)}
        createLink="/admin/videos/new"
      />
    </AdminLayout>
  );
}

