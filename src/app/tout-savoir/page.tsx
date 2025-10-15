import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function ToutSavoirPage() {
  // Mock data - À remplacer par vraie requête
  const templates = [
    {
      id: 1,
      slug: 'acquerir-terrain-securite',
      titre: 'Acquérir un terrain en toute sécurité',
      description: 'Guide complet pour acheter un terrain en Côte d\'Ivoire',
      image: '/assets/images/templates/Acquérir un terrain en toute sécurité.jpeg',
    },
    {
      id: 2,
      slug: 'titre-foncier',
      titre: 'Le titre foncier',
      description: 'Tout savoir sur le titre foncier en Côte d\'Ivoire',
      image: '/assets/images/templates/TF illustration.jpeg',
    },
    {
      id: 3,
      slug: 'compromis-notaire',
      titre: 'Le compromis chez le notaire',
      description: 'Comprendre le rôle du notaire dans l\'achat immobilier',
      image: '/assets/images/templates/compromisnotaire noir.jpg',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Tout savoir sur l'immobilier
            </h1>
            <p className="text-lg text-gray-600">
              Guides, conseils et informations pratiques pour vos projets immobiliers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Link key={template.id} href={`/tout-savoir/${template.slug}`}>
                <Card className="group h-full transition-all hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={template.image}
                      alt={template.titre}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-blue-600">
                      {template.titre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-gray-600">
                      {template.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-blue-600">
                      Lire la suite
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

