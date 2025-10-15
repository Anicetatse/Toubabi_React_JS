import { MainLayout } from '@/components/layout/MainLayout';
import Image from 'next/image';

export default function MotDuPresidentPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mt-5">
          <h1 className="text-center text-3xl font-bold">Mot du Président</h1>
        </div>

        <div className="mx-auto mt-8 max-w-6xl" id="mot-du-president">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Image
                src="/images/equipe/president.jpg"
                alt="Président"
                width={400}
                height={500}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="lg:col-span-8">
              <p className="text-justify leading-relaxed text-gray-700">
                " Chers visiteurs, chers utilisateurs,
                <br /><br />
                C'est avec un immense plaisir que je vous accueille sur notre plateforme Toubabi, 
                née de la volonté de révolutionner le secteur immobilier en Côte d'Ivoire.
                <br /><br />
                Notre mission est simple mais ambitieuse : faciliter l'accès à l'information immobilière 
                et rendre transparent le marché du foncier et de l'immobilier ivoirien.
                <br /><br />
                Grâce à notre cartographie interactive des prix et à notre large base de données de biens, 
                nous vous offrons les outils nécessaires pour prendre des décisions éclairées.
                <br /><br />
                <b>La toubabi</b> s'inscrit dans la continuité de <b>PADEV</b> (PADEV), 
                notre programme d'accompagnement au développement.
                <br /><br />
                Lancée en <b>2006</b> et consolidée en <b>2007</b> à <b>Lomé</b>, <b>Togo</b>, 
                notre vision est de contribuer au développement harmonieux de notre continent."
                <br /><br />
                <h5 className="mt-6 font-bold">KOFFI KOUADIO/Mr</h5>
                <h5 className="font-semibold text-gray-600">Président</h5>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

