import { MainLayout } from '@/components/layout/MainLayout';

export default function ConfidentialitePage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-900 pb-3 pt-3">
          <h1 className="text-center text-3xl font-bold">Politique de confidentialité</h1>
        </div>

        <div className="prose prose-gray mx-auto max-w-4xl py-8">
          <h2>1. Collecte des informations</h2>
          <p>
            Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, publiez une annonce, ou nous contactez.
          </p>

          <h2>2. Utilisation des informations</h2>
          <p>
            Les informations collectées sont utilisées pour :
          </p>
          <ul>
            <li>Gérer votre compte</li>
            <li>Traiter vos transactions</li>
            <li>Améliorer nos services</li>
            <li>Vous envoyer des communications importantes</li>
          </ul>

          <h2>3. Protection des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles.
          </p>

          <h2>4. Partage des informations</h2>
          <p>
            Nous ne vendons pas vos informations personnelles. Nous pouvons les partager uniquement dans les cas suivants :
          </p>
          <ul>
            <li>Avec votre consentement</li>
            <li>Pour se conformer à la loi</li>
            <li>Pour protéger nos droits</li>
          </ul>

          <h2>5. Cookies</h2>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience utilisateur et analyser l'utilisation de notre site.
          </p>

          <h2>6. Vos droits</h2>
          <p>
            Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles. Contactez-nous à contact@toubabi.com
          </p>

          <h2>7. Modifications</h2>
          <p>
            Cette politique peut être mise à jour. Nous vous informerons des changements importants.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

