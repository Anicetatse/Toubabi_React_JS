'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminCrudTable } from '@/components/admin/AdminCrudTable';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminImagesPage() {
  const images = [
    {
      id: 1,
      url: '/placeholder-property.jpg',
      produit: 'Villa Cocody',
      produit_id: 1,
      alt: 'Villa moderne',
    },
    {
      id: 2,
      url: '/placeholder-property.jpg',
      produit: 'Appartement Marcory',
      produit_id: 2,
      alt: 'Appartement 3 pièces',
    },
  ];

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'url',
      label: 'Image',
      render: (value: string) => (
        <div className="relative h-12 w-16 overflow-hidden rounded">
          <Image src={value} alt="Image" fill className="object-cover" />
        </div>
      ),
    },
    {
      key: 'produit',
      label: 'Bien',
      render: (value: string, row: any) => (
        <Link href={`/biens/${row.produit_id}`} className="text-blue-600 hover:underline">
          {value}
        </Link>
      ),
    },
    { key: 'alt', label: 'Alt text' },
  ];

  return (
    <AdminLayout>
      <AdminCrudTable
        title="Gestion des images"
        data={images}
        columns={columns}
        onSearch={(query) => console.log('Search:', query)}
        onDelete={(id) => console.log('Delete:', id)}
        searchPlaceholder="Rechercher une image..."
      />
    </AdminLayout>
  );
}

