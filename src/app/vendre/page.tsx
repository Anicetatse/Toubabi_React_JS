import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VendrePage() {
  return (
    <MainLayout>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Vendre sereinement <br />
              <span className="text-yellow-400">son bien</span>
            </h2>
          </div>
        </div>
      </section>

      {/* À propos de la vente */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <Image
                src="/assets/images/immo2.jpeg"
                alt="Vendre un bien"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h3 className="mb-6 text-center text-2xl font-bold uppercase">
                Les différentes étapes pour vendre
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Vendre un bien immobilier nécessite une bonne préparation. Toubabi vous accompagne à chaque étape.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les 5 étapes */}
      <section className="bg-green-600 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Les 5 étapes</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Étape 1 : Évaluation',
                description: 'Estimer le prix de votre bien avec notre outil',
              },
              {
                title: 'Étape 2 : Préparation',
                description: 'Préparer les documents et photos de qualité',
              },
              {
                title: 'Étape 3 : Publication',
                description: 'Publier votre annonce sur Toubabi',
              },
              {
                title: 'Étape 4 : Visites',
                description: 'Organiser les visites avec les acheteurs intéressés',
              },
              {
                title: 'Étape 5 : Vente',
                description: 'Finaliser la transaction avec l\'acheteur',
              },
            ].map((etape, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow-lg">
                <h4 className="mb-3 font-bold text-green-600">{etape.title}</h4>
                <p className="text-gray-700">{etape.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild className="bg-white text-green-600 hover:bg-gray-100">
              <Link href="/deposer-annonce">Déposer mon annonce</Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

