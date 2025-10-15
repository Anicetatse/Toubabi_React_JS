'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { locationService } from '@/services/locationService';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const checkoutSchema = z.object({
  telephone: z.string().min(8, 'Téléphone invalide'),
  pays: z.string().min(1, 'Le pays est requis'),
  ville: z.string().min(2, 'La ville est requise'),
  adresse: z.string().min(5, 'L\'adresse est requise'),
  code_bp: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      telephone: user?.telephone || '',
    },
  });

  // Récupérer la liste des pays
  const { data: pays = [] } = useQuery({
    queryKey: ['pays'],
    queryFn: () => locationService.getPays(),
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { id: Math.random(), ...data };
    },
    onSuccess: () => {
      clearCart();
      router.push('/checkout/confirmation');
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate(data);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow">
            <h2 className="mb-4 text-2xl font-bold">Connexion requise</h2>
            <p className="mb-6 text-gray-600">
              Vous devez être connecté pour passer une commande
            </p>
            <Button asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow">
            <h2 className="mb-4 text-2xl font-bold">Panier vide</h2>
            <p className="mb-6 text-gray-600">
              Ajoutez des articles à votre panier avant de passer commande
            </p>
            <Button asChild>
              <Link href="/biens">Voir les biens</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4">
          <nav className="mb-6 flex text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li>
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Accueil
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-500">Checkout</li>
            </ol>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Formulaire - 7 colonnes */}
              <div className="lg:col-span-7">
                {/* Informations personnelles */}
                <div className="mb-6 rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-6 text-xl font-bold">
                    Information personnelle
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        value={user?.name?.split(' ')[0] || ''}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        value={user?.name?.split(' ').slice(1).join(' ') || ''}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      placeholder="EX: +225 0707070707"
                      {...register('telephone')}
                    />
                    {errors.telephone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.telephone.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-6 text-xl font-bold">Adresse de Livraison</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="pays">Pays *</Label>
                      <Select
                        onValueChange={(value) => setValue('pays', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {pays.map((p: any) => (
                            <SelectItem key={p.id} value={p.code || p.nom}>
                              {p.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.pays && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.pays.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ville">Ville *</Label>
                      <Input
                        id="ville"
                        placeholder="EX: Abidjan"
                        {...register('ville')}
                      />
                      {errors.ville && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ville.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="adresse">Adresse *</Label>
                    <Input
                      id="adresse"
                      placeholder="Ex: 6 Rue de Beauburg"
                      {...register('adresse')}
                    />
                    {errors.adresse && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adresse.message}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="code_bp">Code postal</Label>
                    <Input
                      id="code_bp"
                      placeholder="EX: 00225"
                      {...register('code_bp')}
                    />
                  </div>

                  <div className="mt-6">
                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        'CONFIRMER LA COMMANDE'
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Résumé de la commande - 5 colonnes */}
              <div className="lg:col-span-5">
                <div className="sticky top-4 rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-6 text-xl font-bold">Votre commande</h3>

                  {/* En-tête */}
                  <div className="mb-4 flex justify-between border-b pb-3 font-bold">
                    <div>Articles</div>
                    <div>TOTAL</div>
                  </div>

                  {/* Liste des produits */}
                  <div className="space-y-3 border-b pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.produit.titre}</span>
                          <span className="ml-2 text-gray-600">
                            {item.quantity}x
                          </span>
                        </div>
                        <div className="font-medium">
                          {formatPrice(item.produit.prix * item.quantity)} FCFA
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Livraison */}
                  <div className="mt-4 flex justify-between border-b pb-4">
                    <div>Livraison</div>
                    <div className="font-bold">Gratuit</div>
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex justify-between text-lg">
                    <div className="font-bold">TOTAL</div>
                    <div className="text-2xl font-bold text-orange-500">
                      {formatPrice(total)} FCFA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
