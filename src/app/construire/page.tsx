import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';

export default function ConstruirePage() {
  return (
    <MainLayout>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="mb-4 text-4xl font-bold text-white">
              Construire sereinement <br />
              <span className="text-yellow-400">en Côte d'Ivoire</span>
            </h2>
          </div>
        </div>
      </section>

      {/* À propos de la construction */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <Image
                src="/assets/images/immo2.jpeg"
                alt="Construction"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h3 className="mb-6 text-center text-2xl font-bold uppercase">
                Les différentes étapes pour construire
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Construire en Côte d'Ivoire nécessite une bonne préparation et une connaissance des étapes clés du processus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Les étapes */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">Les 5 étapes</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Étape 1 : Acquisition du terrain',
                description: 'Choisir et acheter le terrain idéal pour votre projet',
              },
              {
                title: 'Étape 2 : Études techniques',
                description: 'Réaliser les études de sol et les plans architecturaux',
              },
              {
                title: 'Étape 3 : Obtention des autorisations',
                description: 'Demander le permis de construire et les autorisations nécessaires',
              },
              {
                title: 'Étape 4 : Construction',
                description: 'Démarrer les travaux avec des professionnels qualifiés',
              },
              {
                title: 'Étape 5 : Réception et finitions',
                description: 'Contrôler les travaux et effectuer les finitions',
              },
            ].map((etape, index) => (
              <div key={index} className="rounded-lg bg-white p-6 shadow-lg">
                <h4 className="mb-3 font-bold text-blue-600">{etape.title}</h4>
                <p className="text-gray-700">{etape.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

