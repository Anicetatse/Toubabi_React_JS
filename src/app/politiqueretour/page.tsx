import { MainLayout } from '@/components/layout/MainLayout';

export default function PolitiqueRetourPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-900 pb-3 pt-3">
          <h1 className="text-center text-3xl font-bold">Politique de retour</h1>
        </div>

        <div className="prose prose-gray mx-auto max-w-4xl py-8">
          <h2>1. Conditions de retour</h2>
          <p>
            Compte tenu de la nature des biens immobiliers, les transactions ne sont généralement pas révocables une fois finalisées.
          </p>

          <h2>2. Annulation avant signature</h2>
          <p>
            Vous pouvez annuler une demande d'information ou une réservation avant la signature d'un contrat définitif.
          </p>

          <h2>3. Délai de rétractation</h2>
          <p>
            Conformément à la législation ivoirienne, un délai de rétractation peut s'appliquer dans certains cas spécifiques.
          </p>

          <h2>4. Procédure d'annulation</h2>
          <p>
            Pour annuler une demande, contactez-nous par email à contact@toubabi.com ou par téléphone au +225 05 85 32 50 50.
          </p>

          <h2>5. Remboursement</h2>
          <p>
            Les frais de service payés sont remboursables selon les conditions suivantes :
          </p>
          <ul>
            <li>Annulation dans les 24h : remboursement intégral</li>
            <li>Annulation entre 24h et 72h : remboursement partiel (50%)</li>
            <li>Annulation après 72h : aucun remboursement</li>
          </ul>

          <h2>6. Litiges</h2>
          <p>
            En cas de litige, nous nous engageons à trouver une solution amiable. Si aucun accord n'est trouvé, le litige sera soumis aux tribunaux compétents de Côte d'Ivoire.
          </p>

          <h2>7. Contact</h2>
          <p>
            Pour toute question concernant notre politique de retour, contactez notre service client à contact@toubabi.com
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

