'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminServicesPage() {
  const serviceTypes = [
    { name: 'Pharmacies', count: 45, href: '/services/pharmacies' },
    { name: 'Pharmacies de garde', count: 12, href: '/services/pharmacies-de-garde' },
    { name: 'Hôpitaux', count: 23, href: '/services/hospitaliers' },
    { name: 'Hôtels', count: 67, href: '/services/hoteliers' },
    { name: 'Stations-service', count: 34, href: '/services/stations' },
    { name: 'Services publics', count: 28, href: '/services/services-publics' },
    { name: 'Enseignement', count: 89, href: '/services/enseignements' },
    { name: 'Commerces', count: 156, href: '/services/commerces' },
    { name: 'Banques', count: 42, href: '/services/banques' },
    { name: 'Industries', count: 31, href: '/services/industries' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des services</h1>
            <p className="text-gray-600">
              Gérez tous les services de la plateforme
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau service
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceTypes.map((service) => (
            <Card key={service.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{service.name}</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {service.count}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link href={service.href} target="_blank">
                      Voir la liste
                    </Link>
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

