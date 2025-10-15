'use client';

import { use } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { MainLayout } from '@/components/layout/MainLayout';
import { ClientMenu } from '@/components/ClientMenu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { produitService } from '@/services/produitService';
import { locationService } from '@/services/locationService';
import { Loader2, Save } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ModifierAnnoncePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const annonceId = Number(resolvedParams.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: annonce, isLoading } = useQuery({
    queryKey: ['annonce', annonceId],
    queryFn: () => produitService.getById(annonceId),
  });

  const { data: quartiers = [] } = useQuery({
    queryKey: ['quartiers'],
    queryFn: () => locationService.getQuartiers(),
  });

  const { register, handleSubmit, setValue } = useForm();

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      return produitService.update(annonceId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annonce', annonceId] });
      router.push('/mon-espace/annonces');
    },
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

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <ClientMenu />
            </div>

            <div className="lg:col-span-9">
              <Card>
                <CardHeader>
                  <CardTitle>Modifier mon annonce</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Vous souhaitez ...</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border-2 border-gray-200 p-4 text-center">
                          <input
                            type="radio"
                            id="louer"
                            value="louer"
                            {...register('type')}
                            defaultChecked={annonce?.type_annonce?.nom === 'Location'}
                            className="sr-only peer"
                          />
                          <label
                            htmlFor="louer"
                            className="cursor-pointer peer-checked:text-blue-600 peer-checked:font-bold"
                          >
                            Mettre en location
                          </label>
                        </div>
                        <div className="rounded-lg border-2 border-gray-200 p-4 text-center">
                          <input
                            type="radio"
                            id="acheter"
                            value="acheter"
                            {...register('type')}
                            defaultChecked={annonce?.type_annonce?.nom === 'Vente'}
                            className="sr-only peer"
                          />
                          <label
                            htmlFor="acheter"
                            className="cursor-pointer peer-checked:text-blue-600 peer-checked:font-bold"
                          >
                            Vendre
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Type de bien</Label>
                        <Select
                          defaultValue={annonce?.categorie_id?.toString()}
                          onValueChange={(value) => setValue('categorie_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Terrain</SelectItem>
                            <SelectItem value="2">Maison</SelectItem>
                            <SelectItem value="3">Appartement</SelectItem>
                            <SelectItem value="4">Commerce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quartier</Label>
                        <Select
                          defaultValue={annonce?.quartier_id?.toString()}
                          onValueChange={(value) => setValue('quartier_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {quartiers.map((q: any) => (
                              <SelectItem key={q.id} value={q.id.toString()}>
                                {q.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Titre</Label>
                      <Input
                        defaultValue={annonce?.titre}
                        {...register('titre')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        defaultValue={annonce?.description}
                        rows={6}
                        {...register('description')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prix (FCFA)</Label>
                        <Input
                          type="number"
                          defaultValue={annonce?.prix}
                          {...register('prix')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Surface (m²)</Label>
                        <Input
                          type="number"
                          defaultValue={annonce?.surface}
                          {...register('surface')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Pièces</Label>
                        <Input
                          type="number"
                          defaultValue={annonce?.nombre_pieces}
                          {...register('nombre_pieces')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chambres</Label>
                        <Input
                          type="number"
                          defaultValue={annonce?.nombre_chambres}
                          {...register('nombre_chambres')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Salles de bain</Label>
                        <Input
                          type="number"
                          defaultValue={annonce?.nombre_salles_bain}
                          {...register('nombre_salles_bain')}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer les modifications
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

