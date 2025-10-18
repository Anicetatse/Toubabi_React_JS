'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';
import { 
  Building2, 
  Cross, 
  Briefcase, 
  ShoppingBag, 
  GraduationCap,
  Fuel,
  Factory,
  Landmark
} from 'lucide-react';

const categories = [
  {
    id: 'hoteliers',
    titre: 'Hôtels',
    description: 'Trouvez les meilleurs établissements hôteliers',
    icon: Building2,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    count: 0
  },
  {
    id: 'pharmacies',
    titre: 'Pharmacies de Garde',
    description: 'Localisez les pharmacies de garde près de chez vous',
    icon: Cross,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    count: 0
  },
  {
    id: 'banques',
    titre: 'Banques',
    description: 'Découvrez les banques et institutions financières',
    icon: Landmark,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    count: 0
  },
  {
    id: 'commerces',
    titre: 'Commerces',
    description: 'Explorez les commerces et boutiques',
    icon: ShoppingBag,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    count: 0
  },
  {
    id: 'enseignements',
    titre: 'Établissements d\'Enseignement',
    description: 'Trouvez écoles, collèges et universités',
    icon: GraduationCap,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    count: 0
  },
  {
    id: 'hospitaliers',
    titre: 'Centres Hospitaliers',
    description: 'Localisez les hôpitaux et cliniques',
    icon: Cross,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconColor: 'text-teal-600',
    count: 0
  },
  {
    id: 'services-publics',
    titre: 'Services Publics',
    description: 'Accédez aux services administratifs',
    icon: Briefcase,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconColor: 'text-indigo-600',
    count: 0
  },
  {
    id: 'stations',
    titre: 'Stations Service',
    description: 'Trouvez les stations essence à proximité',
    icon: Fuel,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    count: 0
  },
  {
    id: 'industries',
    titre: 'Industries',
    description: 'Découvrez le secteur industriel',
    icon: Factory,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-600',
    count: 0
  }
];

export default function MobilitesPage() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* En-tête */}
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Mobilités Urbaines
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Découvrez tous les services et établissements à proximité pour faciliter votre quotidien
            </p>
          </div>

          {/* Grille des catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {categories.map((categorie) => {
              const Icon = categorie.icon;
              return (
                <Link 
                  key={categorie.id}
                  href={`/mobilites/${categorie.id}`}
                  className="group"
                >
                  <div className={`relative h-full p-6 rounded-2xl border-2 ${categorie.borderColor} ${categorie.bgColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                    {/* Icône */}
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${categorie.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Contenu */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {categorie.titre}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {categorie.description}
                    </p>

                    {/* Flèche */}
                    <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                      <span>Explorer</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Section informative */}
          <div className="mt-16 max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              À propos des mobilités urbaines
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Cette section vous permet d'accéder facilement à tous les services essentiels de la ville. 
              Que vous recherchiez un hôtel, une pharmacie de garde, une banque ou tout autre service, 
              vous trouverez ici toutes les informations nécessaires avec leur localisation précise.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

