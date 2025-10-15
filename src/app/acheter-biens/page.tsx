import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AcheterBiensPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Acheter un bien immobilier
        </h1>

        <div className="prose prose-lg mx-auto max-w-4xl">
          <p className="lead">
            Acheter un bien immobilier en Côte d'Ivoire nécessite une bonne connaissance du marché et des démarches administratives.
          </p>

          <h2>Les étapes clés pour acheter</h2>
          
          <h3>1. Définir votre projet</h3>
          <p>
            Déterminez vos besoins (type de bien, localisation, budget) et utilisez notre outil de recherche pour trouver les biens correspondants.
          </p>

          <h3>2. Rechercher le bien idéal</h3>
          <p>
            Consultez nos annonces, utilisez nos filtres de recherche avancés et sauvegardez vos biens favoris.
          </p>

          <h3>3. Visiter les biens</h3>
          <p>
            Contactez les vendeurs pour organiser des visites et vérifier l'état du bien.
          </p>

          <h3>4. Vérifications juridiques</h3>
          <p>
            Faites vérifier les documents de propriété (titre foncier, certificat foncier) par un notaire.
          </p>

          <h3>5. Négociation et offre</h3>
          <p>
            Négociez le prix et faites une offre d'achat en précisant vos conditions.
          </p>

          <h3>6. Signature et paiement</h3>
          <p>
            Signez le compromis de vente puis l'acte définitif chez le notaire. Effectuez le paiement selon les modalités convenues.
          </p>

          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link href="/biens">Voir les biens disponibles</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

