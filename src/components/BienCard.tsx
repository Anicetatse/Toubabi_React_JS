'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Produit } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WishlistButton } from '@/components/WishlistButton';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface BienCardProps {
  bien: Produit;
}

export function BienCard({ bien }: BienCardProps) {

  const formatPrice = (price: number | undefined) => {
    if (!price || isNaN(Number(price))) {
      return 'Prix non renseigné';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  // Fonction pour nettoyer le HTML et extraire le texte brut
  const stripHtml = (html: string): string => {
    if (!html) return '';
    // Remplacer les balises HTML par des espaces et décoder les entités HTML
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&eacute;/g, 'é')
      .replace(/&egrave;/g, 'è')
      .replace(/&agrave;/g, 'à')
      .replace(/&ccedil;/g, 'ç')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const mainImage = bien.images?.[0]?.url || '/assets/img/nofound.jpg';

  // Utiliser le code du produit pour l'URL et le wishlist
  const produitCode = bien.code || bien.id?.toString() || '';
  const bienUrl = `/biens/${produitCode}`;
  
  // S'assurer qu'il y a toujours un alt text valide
  const altText = bien.titre || stripHtml(bien.description) || 'Bien immobilier';
  
  // Nettoyer la description pour l'affichage
  const cleanDescription = stripHtml(bien.description);

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={bienUrl}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage}
            alt={altText}
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
          {produitCode && (
            <div className="absolute right-2 top-2">
              <WishlistButton 
                produitCode={produitCode}
                variant="secondary"
                className="opacity-90 hover:opacity-100"
              />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={bienUrl}>
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
            {cleanDescription}
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
              {formatPrice(bien.prix || bien.prix_vente)}
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

