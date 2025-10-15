'use client';

import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientMenu } from '@/components/ClientMenu';
import { Button } from '@/components/ui/button';
import { Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function CommandesPage() {
  // Mock data - À remplacer par vraie requête
  const { data: commandes = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      // Simuler un appel API
      return [
        {
          id: 1,
          quantite: 2,
          montant: 45000000,
          created_at: '2024-10-10',
        },
        {
          id: 2,
          quantite: 1,
          montant: 25000000,
          created_at: '2024-10-05',
        },
      ];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Menu latéral - 3 colonnes */}
            <div className="lg:col-span-3">
              <ClientMenu />
            </div>

            {/* Contenu principal - 8 colonnes */}
            <div className="lg:col-span-8">
              <div className="rounded-lg bg-white p-6 shadow">
                <h5 className="mb-6 text-xl font-bold uppercase">
                  Historique des achats
                </h5>

                {isLoading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : commandes.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    Vous n'avez pas encore passé de commande
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-900 text-white">
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            N° commande
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Libellé
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {commandes.map((cmd: any) => (
                          <tr key={cmd.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm" data-label="N°">
                              #{cmd.id}
                            </td>
                            <td className="px-4 py-3 text-sm" data-label="Nombre d'article">
                              {cmd.quantite} article{cmd.quantite > 1 ? 's' : ''}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold" data-label="Total">
                              {formatPrice(cmd.montant)} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm" data-label="Date">
                              {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3" data-label="">
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <Link href={`/mon-espace/commandes/${cmd.id}`}>
                                  <Eye className="mr-1 h-4 w-4" />
                                  Détail
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

