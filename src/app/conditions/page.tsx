import { MainLayout } from '@/components/layout/MainLayout';

export default function ConditionsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-900 pb-3 pt-3">
          <h1 className="text-center text-3xl font-bold">Conditions d'utilisation</h1>
        </div>

        <div className="prose prose-gray mx-auto max-w-4xl py-8">
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant la plateforme Toubabi, vous acceptez d'être lié par ces conditions d'utilisation.
          </p>

          <h2>2. Services proposés</h2>
          <p>
            Toubabi est une plateforme immobilière qui permet la mise en relation entre acheteurs, vendeurs et locataires de biens immobiliers en Côte d'Ivoire.
          </p>

          <h2>3. Création de compte</h2>
          <p>
            Pour utiliser certaines fonctionnalités de Toubabi, vous devez créer un compte. Vous êtes responsable de maintenir la confidentialité de vos identifiants.
          </p>

          <h2>4. Publication d'annonces</h2>
          <p>
            Les utilisateurs peuvent publier des annonces immobilières. Toutes les annonces doivent être exactes et conformes aux lois en vigueur.
          </p>

          <h2>5. Responsabilités</h2>
          <p>
            Toubabi agit en tant qu'intermédiaire et n'est pas responsable des transactions effectuées entre les utilisateurs.
          </p>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            Tous les contenus présents sur la plateforme sont protégés par les droits d'auteur.
          </p>

          <h2>7. Modification des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements.
          </p>

          <h2>8. Contact</h2>
          <p>
            Pour toute question concernant ces conditions, contactez-nous à : contact@toubabi.com
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

