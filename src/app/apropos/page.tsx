import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';

export default function AProposPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-900 pb-3 pt-3">
          <h1 className="text-center text-3xl font-bold">Qui sommes-nous?</h1>
        </div>

        <div className="pt-8">
          <div className="flex flex-col items-center lg:flex-row lg:items-start">
            <div className="mb-6 lg:float-right lg:mb-0 lg:ml-6">
              <Image
                src="/logo.jpeg"
                alt="Toubabi Logo"
                width={300}
                height={300}
                className="rounded-lg"
              />
            </div>
            <div className="text-gray-700">
              <p className="mb-4">
                Notre mission est d'améliorer le quotidien des ivoiriens en proposant
                aux consommateurs des services en ligne innovants, pratiques et abordables
                tout en soutenant le développement d'entreprises ayant recours à notre plateforme
                pour satisfaire leurs clients.
              </p>
              <p className="mb-4">
                Notre plateforme réunit une MarketPlace, qui connecte vendeurs et acheteurs,
                un réseau logistique, qui permet la livraison de colis, et un service
                de paiement, qui facilite les transactions de nos clients dans la plupart de nos
                marchés.
              </p>
              <p>
                Nous ouvrons le champ des possibles pour une nouvelle génération de talents en
                créant des opportunités de carrière et en accompagnant le développement de
                nouvelles compétences sur le continent.
              </p>
            </div>
          </div>
        </div>

        <div className="pb-3 pt-8">
          <div className="ml-5">
            <h3 className="text-2xl font-bold">
              <li>Nos ambitions</li>
            </h3>
          </div>
          <div className="mt-4">
            <p className="text-gray-700">
              Créé en Novembre 2020, toubabi est un des sites émergents de e-commerce en Côte d'Ivoire.
              Nous proposons à nos clients un large assortiment de produits, des prix
              compétitifs et des délais de livraison toujours plus réduits, dans le but d'offrir
              une expérience client de qualité.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

