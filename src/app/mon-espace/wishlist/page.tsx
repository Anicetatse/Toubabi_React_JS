'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BienCard } from '@/components/BienCard';
import { wishlistService } from '@/services/wishlistService';
import { Loader2, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { ClientTopBar } from '@/components/ClientTopBar';

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getAll,
  });

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          <ClientTopBar />

          <div className="flex-1">
            <h1 className="mb-8 text-3xl font-bold">Mes favoris</h1>
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : wishlist.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center bg-white rounded-lg shadow-sm p-12">
                <Heart className="mb-4 h-16 w-16 text-gray-300" />
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Votre liste de favoris est vide</h2>
                <p className="mb-6 text-gray-600">Explorez nos biens et ajoutez-les à vos favoris</p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/biens">Voir les biens disponibles</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  {wishlist.length} bien{wishlist.length > 1 ? 's' : ''} dans vos favoris
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {wishlist.map((item) => (item.produit ? <BienCard key={item.id} bien={item.produit} /> : null))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

