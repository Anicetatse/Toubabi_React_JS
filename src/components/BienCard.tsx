'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Produit } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Maximize, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlistService';

interface BienCardProps {
  bien: Produit;
}

export function BienCard({ bien }: BienCardProps) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const toggleWishlistMutation = useMutation({
    mutationFn: () => wishlistService.toggle(bien.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const mainImage = bien.images?.[0]?.url || '/placeholder-property.jpg';

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/biens/${bien.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage}
            alt={bien.titre}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute left-2 top-2 flex gap-2">
            <Badge className="bg-blue-600">{bien.type_annonce?.nom}</Badge>
            {bien.statut === 'actif' && (
              <Badge variant="secondary">Disponible</Badge>
            )}
          </div>
          {isAuthenticated && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 opacity-90 hover:opacity-100"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlistMutation.mutate();
              }}
              disabled={toggleWishlistMutation.isPending}
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/biens/${bien.id}`}>
          <div className="mb-2">
            <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {bien.titre}
            </h3>
            {bien.quartier && (
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <MapPin className="mr-1 h-4 w-4" />
                {bien.quartier.nom}
                {bien.quartier.commune && `, ${bien.quartier.commune.nom}`}
              </div>
            )}
          </div>

          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {bien.description}
          </p>

          <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-600">
            {bien.surface && (
              <div className="flex items-center">
                <Maximize className="mr-1 h-4 w-4" />
                {bien.surface} m²
              </div>
            )}
            {bien.nombre_chambres && (
              <div className="flex items-center">
                <Bed className="mr-1 h-4 w-4" />
                {bien.nombre_chambres} ch.
              </div>
            )}
            {bien.nombre_salles_bain && (
              <div className="flex items-center">
                <Bath className="mr-1 h-4 w-4" />
                {bien.nombre_salles_bain} sdb
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(bien.prix)}
            </div>
            {bien.categorie && (
              <Badge variant="outline">{bien.categorie.nom}</Badge>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

