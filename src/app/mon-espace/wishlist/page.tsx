'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { BienCard } from '@/components/BienCard';
import { wishlistService } from '@/services/wishlistService';
import { Loader2, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getAll,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (wishlist.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <Heart className="mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Votre liste de favoris est vide
            </h2>
            <p className="mb-6 text-gray-600">
              Explorez nos biens et ajoutez-les à vos favoris
            </p>
            <Button asChild>
              <Link href="/biens">Voir les biens disponibles</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">Mes favoris</h1>

          <div className="mb-4 text-gray-600">
            {wishlist.length} bien{wishlist.length > 1 ? 's' : ''} dans vos favoris
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) =>
              item.produit ? (
                <BienCard key={item.id} bien={item.produit} />
              ) : null
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

