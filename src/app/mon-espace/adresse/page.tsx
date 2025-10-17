'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/Header';
import { ClientTopBar } from '@/components/ClientTopBar';
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locationService } from '@/services/locationService';
import { Loader2, Check } from 'lucide-react';
import { useState } from 'react';

const adresseSchema = z.object({
  ville: z.string().min(1, 'La ville est requise'),
  commune: z.string().min(1, 'La commune est requise'),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
});

type AdresseForm = z.infer<typeof adresseSchema>;

export default function AdressePage() {
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: villes = [] } = useQuery({
    queryKey: ['villes'],
    queryFn: () => locationService.getVilles(),
  });

  const { data: communes = [] } = useQuery({
    queryKey: ['communes'],
    queryFn: () => locationService.getCommunes(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AdresseForm>({
    resolver: zodResolver(adresseSchema),
  });

  const updateAdresseMutation = useMutation({
    mutationFn: async (data: AdresseForm) => {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const onSubmit = (data: AdresseForm) => {
    updateAdresseMutation.mutate(data);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          <ClientTopBar />

          <Card>
            <CardHeader>
              <p className="text-xl font-bold">Adresse</p>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 lg:w-3/4"
              >
                {success && (
                  <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-600">
                    <Check className="h-5 w-5" />
                    Adresse mise à jour avec succès
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Select
                      onValueChange={(value) => setValue('ville', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {villes.map((v: any) => (
                          <SelectItem key={v.id} value={v.nom}>
                            {v.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.ville && (
                      <p className="text-sm text-red-600">
                        {errors.ville.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commune">Commune</Label>
                    <Select
                      onValueChange={(value) => setValue('commune', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une commune" />
                      </SelectTrigger>
                      <SelectContent>
                        {communes.map((c: any) => (
                          <SelectItem key={c.id} value={c.code || c.nom}>
                            {c.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.commune && (
                      <p className="text-sm text-red-600">
                        {errors.commune.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Détail</Label>
                  <Textarea
                    id="description"
                    placeholder="Détails de votre adresse..."
                    maxLength={255}
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={updateAdresseMutation.isPending}
                  >
                    {updateAdresseMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

