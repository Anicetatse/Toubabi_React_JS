'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function PanierPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Votre panier est vide
            </h2>
            <p className="mb-6 text-gray-600">
              Explorez nos biens et ajoutez-les à votre panier
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
          <h1 className="mb-8 text-3xl font-bold">Mon panier</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Liste des articles */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Articles ({items.length})</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    Vider le panier
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => {
                    const mainImage =
                      item.produit.images?.[0]?.url || '/placeholder-property.jpg';
                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b pb-4 last:border-b-0"
                      >
                        <Link
                          href={`/biens/${item.produit_id}`}
                          className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg"
                        >
                          <Image
                            src={mainImage}
                            alt={item.produit.titre}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/biens/${item.produit_id}`}
                              className="font-semibold hover:text-blue-600"
                            >
                              {item.produit.titre}
                            </Link>
                            {item.produit.quartier && (
                              <p className="text-sm text-gray-600">
                                {item.produit.quartier.nom}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-lg font-semibold text-blue-600">
                                {formatPrice(item.produit.prix * item.quantity)}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Résumé de la commande */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frais de service</span>
                      <span>Gratuit</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>

                  <Button className="w-full" asChild>
                    <Link href="/checkout">Procéder au paiement</Link>
                  </Button>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/biens">Continuer mes achats</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

