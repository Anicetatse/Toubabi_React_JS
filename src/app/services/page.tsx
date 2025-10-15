'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  Building,
  Hotel,
  Fuel,
  School,
  ShoppingCart,
  Landmark,
  Factory,
  Cross,
  Pill,
} from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      title: 'Pharmacies',
      description: 'Trouvez les pharmacies proches de vous',
      icon: Pill,
      link: '/services/pharmacies',
      color: 'green',
    },
    {
      title: 'Pharmacies de garde',
      description: 'Pharmacies ouvertes en dehors des heures normales',
      icon: Cross,
      link: '/services/pharmacies-de-garde',
      color: 'red',
    },
    {
      title: 'Établissements hospitaliers',
      description: 'Hôpitaux et cliniques',
      icon: Building,
      link: '/services/hospitaliers',
      color: 'blue',
    },
    {
      title: 'Hôtels',
      description: 'Hébergement et hôtellerie',
      icon: Hotel,
      link: '/services/hoteliers',
      color: 'purple',
    },
    {
      title: 'Stations-service',
      description: 'Stations d\'essence et carburant',
      icon: Fuel,
      link: '/services/stations',
      color: 'orange',
    },
    {
      title: 'Services publics',
      description: 'Administrations et services publics',
      icon: Landmark,
      link: '/services/services-publics',
      color: 'indigo',
    },
    {
      title: 'Enseignement',
      description: 'Écoles, collèges et universités',
      icon: School,
      link: '/services/enseignements',
      color: 'yellow',
    },
    {
      title: 'Commerces',
      description: 'Magasins et commerces',
      icon: ShoppingCart,
      link: '/services/commerces',
      color: 'pink',
    },
    {
      title: 'Banques',
      description: 'Agences bancaires',
      icon: Landmark,
      link: '/services/banques',
      color: 'cyan',
    },
    {
      title: 'Industries',
      description: 'Zones industrielles et entreprises',
      icon: Factory,
      link: '/services/industries',
      color: 'gray',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Services
            </h1>
            <p className="text-gray-600">
              Découvrez tous les services disponibles en Côte d'Ivoire
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.title} href={service.link}>
                  <Card className="group h-full transition-all hover:shadow-lg">
                    <CardHeader>
                      <div
                        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${service.color}-100 text-${service.color}-600 transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="group-hover:text-blue-600">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

