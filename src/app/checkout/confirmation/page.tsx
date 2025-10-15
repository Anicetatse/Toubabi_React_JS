'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutConfirmationPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white p-8 shadow-lg">
              <div className="text-center">
                {/* Icône de succès */}
                <div className="mb-6 flex justify-center">
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </div>

                {/* Message principal */}
                <h4 className="mb-4 text-2xl font-bold text-gray-900">
                  Merci pour votre confiance!
                </h4>

                <hr className="my-6" />

                {/* Message secondaire */}
                <p className="mb-8 text-gray-600">
                  Votre demande a été prise en compte.
                </p>

                {/* Bouton */}
                <Button asChild className="bg-gray-600 hover:bg-gray-700">
                  <Link href="/biens">
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Voir d'autres biens
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

