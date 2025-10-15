'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { produitService } from '@/services/produitService';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistService } from '@/services/wishlistService';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  ShoppingCart,
  Loader2,
  User,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BienDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const bienId = Number(resolvedParams.id);
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [comment, setComment] = useState('');

  const { data: bien, isLoading } = useQuery({
    queryKey: ['bien', bienId],
    queryFn: () => produitService.getById(bienId),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', bienId],
    queryFn: () => produitService.getComments(bienId),
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: () => wishlistService.toggle(bienId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (contenu: string) => produitService.addComment(bienId, contenu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', bienId] });
      setComment('');
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (bien) {
      addToCart(bien);
    }
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      addCommentMutation.mutate(comment);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (!bien) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">Bien non trouvé</h1>
            <p className="text-gray-600">Ce bien n'existe pas ou a été supprimé</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const images = bien.images || [];
  const mainImage = images[selectedImage]?.url || '/placeholder-property.jpg';

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Images et détails */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-0">
                  {/* Image principale */}
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={mainImage}
                      alt={bien.titre}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <Badge className="bg-blue-600">{bien.type_annonce?.nom}</Badge>
                      <Badge variant="secondary">{bien.statut}</Badge>
                    </div>
                  </div>

                  {/* Galerie */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto p-4">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            selectedImage === index
                              ? 'border-blue-600'
                              : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2 text-2xl">{bien.titre}</CardTitle>
                      {bien.quartier && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="mr-1 h-4 w-4" />
                          {bien.quartier.nom}
                          {bien.quartier.commune && `, ${bien.quartier.commune.nom}`}
                          {bien.quartier.commune?.ville && `, ${bien.quartier.commune.ville.nom}`}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatPrice(bien.prix)}
                      </div>
                      {bien.categorie && (
                        <Badge variant="outline" className="mt-2">
                          {bien.categorie.nom}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Caractéristiques */}
                  <div className="mb-6 flex flex-wrap gap-6 border-b pb-6">
                    {bien.surface && (
                      <div className="flex items-center gap-2">
                        <Maximize className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Surface</div>
                          <div className="font-semibold">{bien.surface} m²</div>
                        </div>
                      </div>
                    )}
                    {bien.nombre_chambres && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Chambres</div>
                          <div className="font-semibold">{bien.nombre_chambres}</div>
                        </div>
                      </div>
                    )}
                    {bien.nombre_salles_bain && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Salles de bain</div>
                          <div className="font-semibold">{bien.nombre_salles_bain}</div>
                        </div>
                      </div>
                    )}
                    {bien.nombre_pieces && (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 text-gray-400">🏠</div>
                        <div>
                          <div className="text-sm text-gray-600">Pièces</div>
                          <div className="font-semibold">{bien.nombre_pieces}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="mb-3 text-lg font-semibold">Description</h3>
                    <p className="whitespace-pre-line text-gray-600">{bien.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Commentaires */}
              <Card>
                <CardHeader>
                  <CardTitle>Commentaires ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAuthenticated && (
                    <div className="mb-6">
                      <Input
                        placeholder="Ajouter un commentaire..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mb-2"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!comment.trim() || addCommentMutation.isPending}
                      >
                        {addCommentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          'Publier'
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4 last:border-b-0">
                        <div className="mb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">{comment.user?.name}</span>
                          <span className="text-sm text-gray-400">
                            <Calendar className="inline h-3 w-3" />
                            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-gray-600">{comment.contenu}</p>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-center text-gray-400">Aucun commentaire pour le moment</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Ajouter au panier
                  </Button>

                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toggleWishlistMutation.mutate()}
                      disabled={toggleWishlistMutation.isPending}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Ajouter aux favoris
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+2250585325050">Contacter le vendeur</a>
                  </Button>
                </CardContent>
              </Card>

              {bien.user && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Annonceur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{bien.user.name}</div>
                        <div className="text-sm text-gray-600">{bien.user.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

