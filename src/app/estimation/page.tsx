'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Info } from 'lucide-react';

const estimationSchema = z.object({
  type_construction: z.string().min(1, 'Type de construction requis'),
  surface: z.number().min(1, 'Surface requise'),
  nombre_etages: z.number().min(1, 'Nombre d\'étages requis'),
  finition: z.enum(['economique', 'standard', 'haut_de_gamme']),
  email: z.string().email('Email invalide').optional(),
});

type EstimationForm = z.infer<typeof estimationSchema>;

export default function EstimationPage() {
  const [result, setResult] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EstimationForm>({
    resolver: zodResolver(estimationSchema),
    defaultValues: {
      nombre_etages: 1,
    },
  });

  const finition = watch('finition');

  // Prix indicatifs au m² en XOF selon la finition
  const prixParM2: Record<string, number> = {
    economique: 150000, // 150k XOF/m²
    standard: 250000,   // 250k XOF/m²
    haut_de_gamme: 400000, // 400k XOF/m²
  };

  const onSubmit = (data: EstimationForm) => {
    const prixM2 = prixParM2[data.finition];
    const montantBase = data.surface * prixM2;
    
    // Majoration pour les étages supplémentaires (5% par étage)
    const majorationEtages = data.nombre_etages > 1 
      ? montantBase * (data.nombre_etages - 1) * 0.05 
      : 0;
    
    const montantTotal = montantBase + majorationEtages;
    setResult(montantTotal);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Estimation de projet de construction
            </h1>
            <p className="text-gray-600">
              Obtenez une estimation rapide du coût de votre projet de construction
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Renseignez les détails de votre projet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="type_construction">Type de construction</Label>
                      <Select
                        onValueChange={(value) => setValue('type_construction', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maison_individuelle">
                            Maison individuelle
                          </SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="immeuble">Immeuble</SelectItem>
                          <SelectItem value="commerce">Commerce</SelectItem>
                          <SelectItem value="bureaux">Bureaux</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type_construction && (
                        <p className="text-sm text-red-600">
                          {errors.type_construction.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="surface">Surface (m²)</Label>
                        <Input
                          id="surface"
                          type="number"
                          placeholder="Ex: 150"
                          {...register('surface', { valueAsNumber: true })}
                        />
                        {errors.surface && (
                          <p className="text-sm text-red-600">
                            {errors.surface.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nombre_etages">Nombre d'étages</Label>
                        <Input
                          id="nombre_etages"
                          type="number"
                          min="1"
                          placeholder="Ex: 1"
                          {...register('nombre_etages', { valueAsNumber: true })}
                        />
                        {errors.nombre_etages && (
                          <p className="text-sm text-red-600">
                            {errors.nombre_etages.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="finition">Niveau de finition</Label>
                      <Select
                        onValueChange={(value: any) => setValue('finition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez la finition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economique">
                            Économique - {formatPrice(prixParM2.economique)}/m²
                          </SelectItem>
                          <SelectItem value="standard">
                            Standard - {formatPrice(prixParM2.standard)}/m²
                          </SelectItem>
                          <SelectItem value="haut_de_gamme">
                            Haut de gamme - {formatPrice(prixParM2.haut_de_gamme)}/m²
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.finition && (
                        <p className="text-sm text-red-600">
                          {errors.finition.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (optionnel)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        {...register('email')}
                      />
                      <p className="text-xs text-gray-500">
                        Recevez l'estimation par email
                      </p>
                    </div>

                    <Button type="submit" className="w-full">
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculer l'estimation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Résultat */}
            <div className="lg:col-span-1">
              {result !== null ? (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      Estimation de votre projet
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-green-50 p-6 text-center">
                      <div className="mb-2 text-sm text-gray-600">
                        Coût estimé
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {formatPrice(result)}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                        <div className="text-xs text-amber-900">
                          <p className="mb-2 font-semibold">
                            Cette estimation est indicative
                          </p>
                          <ul className="list-inside list-disc space-y-1">
                            <li>Prix basés sur le marché actuel</li>
                            <li>Peut varier selon le quartier</li>
                            <li>N'inclut pas le coût du terrain</li>
                            <li>Consultez un expert pour plus de précision</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" asChild>
                      <a href="mailto:contact@toubabi.com">
                        Demander un devis détaillé
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>À propos de l'estimation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm text-gray-600">
                      <p>
                        Notre outil vous permet d'obtenir une estimation rapide du coût
                        de construction de votre projet.
                      </p>
                      <div className="space-y-2">
                        <p className="font-semibold">Niveaux de finition :</p>
                        <ul className="list-inside list-disc space-y-1">
                          <li>
                            <strong>Économique :</strong> Matériaux standards,
                            finitions simples
                          </li>
                          <li>
                            <strong>Standard :</strong> Bon rapport qualité/prix
                          </li>
                          <li>
                            <strong>Haut de gamme :</strong> Matériaux premium,
                            finitions luxueuses
                          </li>
                        </ul>
                      </div>
                      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                        Remplissez le formulaire pour obtenir votre estimation
                        personnalisée.
                      </p>
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

