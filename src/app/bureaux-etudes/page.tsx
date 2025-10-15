import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building, PenTool, Hammer } from 'lucide-react';

export default function BureauxEtudesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Bureaux d'études
        </h1>

        <div className="mx-auto max-w-4xl">
          <p className="mb-12 text-center text-lg text-gray-700">
            Toubabi travaille avec les meilleurs bureaux d'études pour vous accompagner dans vos projets de construction.
          </p>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Building className="mx-auto mb-2 h-12 w-12 text-blue-600" />
                <CardTitle className="text-center">Architecture</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-gray-600">
                Conception et plans architecturaux adaptés à vos besoins
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <PenTool className="mx-auto mb-2 h-12 w-12 text-green-600" />
                <CardTitle className="text-center">Études techniques</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-gray-600">
                Études de sol, topographie et faisabilité
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Hammer className="mx-auto mb-2 h-12 w-12 text-orange-600" />
                <CardTitle className="text-center">Suivi de chantier</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-sm text-gray-600">
                Accompagnement et contrôle tout au long des travaux
              </CardContent>
            </Card>
          </div>

          <div className="prose prose-lg mx-auto">
            <h2>Nos partenaires bureaux d'études</h2>
            <p>
              Nous collaborons avec des bureaux d'études certifiés et expérimentés pour garantir la qualité de vos projets.
            </p>

            <h3>Services proposés</h3>
            <ul>
              <li>Conception architecturale et plans</li>
              <li>Études de sol et topographie</li>
              <li>Calculs de structure</li>
              <li>Études d'impact environnemental</li>
              <li>Suivi et contrôle des travaux</li>
              <li>Coordination des corps d'état</li>
            </ul>

            <div className="mt-8 text-center">
              <Button size="lg" asChild>
                <Link href="/contactez-nous">Demander un devis</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

