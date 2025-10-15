'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { produitService } from '@/services/produitService';
import { locationService } from '@/services/locationService';
import { Loader2, Upload, X } from 'lucide-react';

const annonceSchema = z.object({
  titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  prix: z.number().min(1, 'Le prix est requis'),
  surface: z.number().optional(),
  nombre_pieces: z.number().optional(),
  nombre_chambres: z.number().optional(),
  nombre_salles_bain: z.number().optional(),
  categorie_id: z.number().min(1, 'La catégorie est requise'),
  type_annonce_id: z.number().min(1, 'Le type d\'annonce est requis'),
  quartier_id: z.number().min(1, 'Le quartier est requis'),
});

type AnnonceForm = z.infer<typeof annonceSchema>;

export default function DeposerAnnoncePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AnnonceForm>({
    resolver: zodResolver(annonceSchema),
  });

  // Récupérer les données pour les selects
  const { data: quartiers = [] } = useQuery({
    queryKey: ['quartiers'],
    queryFn: () => locationService.getQuartiers(),
  });

  const createAnnonceMutation = useMutation({
    mutationFn: async (data: AnnonceForm) => {
      const formData = new FormData();
      
      // Ajouter les données du formulaire
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Ajouter les images
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      return produitService.create(formData);
    },
    onSuccess: (data) => {
      router.push(`/biens/${data.id}`);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);

    // Créer les previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: AnnonceForm) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    createAnnonceMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <h2 className="mb-4 text-2xl font-bold">Connexion requise</h2>
              <p className="mb-6 text-gray-600">
                Vous devez être connecté pour déposer une annonce
              </p>
              <Button asChild>
                <a href="/login">Se connecter</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Déposer une annonce
            </h1>
            <p className="text-gray-600">
              Remplissez le formulaire pour publier votre bien immobilier
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Formulaire principal */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titre">Titre de l'annonce *</Label>
                      <Input
                        id="titre"
                        placeholder="Ex: Belle villa moderne à Cocody"
                        {...register('titre')}
                      />
                      {errors.titre && (
                        <p className="text-sm text-red-600">{errors.titre.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez votre bien en détail..."
                        rows={6}
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type_annonce_id">Type d'annonce *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue('type_annonce_id', Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Vente</SelectItem>
                            <SelectItem value="2">Location</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type_annonce_id && (
                          <p className="text-sm text-red-600">
                            {errors.type_annonce_id.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="categorie_id">Catégorie *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue('categorie_id', Number(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Terrain</SelectItem>
                            <SelectItem value="2">Maison</SelectItem>
                            <SelectItem value="3">Appartement</SelectItem>
                            <SelectItem value="4">Commerce</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.categorie_id && (
                          <p className="text-sm text-red-600">
                            {errors.categorie_id.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Détails du bien</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prix">Prix (FCFA) *</Label>
                        <Input
                          id="prix"
                          type="number"
                          placeholder="0"
                          {...register('prix', { valueAsNumber: true })}
                        />
                        {errors.prix && (
                          <p className="text-sm text-red-600">{errors.prix.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="surface">Surface (m²)</Label>
                        <Input
                          id="surface"
                          type="number"
                          placeholder="0"
                          {...register('surface', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre_pieces">Pièces</Label>
                        <Input
                          id="nombre_pieces"
                          type="number"
                          placeholder="0"
                          {...register('nombre_pieces', { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nombre_chambres">Chambres</Label>
                        <Input
                          id="nombre_chambres"
                          type="number"
                          placeholder="0"
                          {...register('nombre_chambres', { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nombre_salles_bain">Salles de bain</Label>
                        <Input
                          id="nombre_salles_bain"
                          type="number"
                          placeholder="0"
                          {...register('nombre_salles_bain', { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quartier_id">Quartier *</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue('quartier_id', Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un quartier" />
                        </SelectTrigger>
                        <SelectContent>
                          {quartiers.map((quartier) => (
                            <SelectItem
                              key={quartier.id}
                              value={quartier.id.toString()}
                            >
                              {quartier.nom}
                              {quartier.commune && ` - ${quartier.commune.nom}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.quartier_id && (
                        <p className="text-sm text-red-600">
                          {errors.quartier_id.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="images">Ajouter des photos</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('images')?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Choisir des images
                        </Button>
                        <input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                        <span className="text-sm text-gray-600">
                          {selectedImages.length} image(s) sélectionnée(s)
                        </span>
                      </div>
                    </div>

                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-32 w-full rounded-lg object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Publication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                      <p className="font-medium">Avant de publier</p>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Vérifiez toutes les informations</li>
                        <li>Ajoutez des photos de qualité</li>
                        <li>Décrivez précisément le bien</li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createAnnonceMutation.isPending}
                    >
                      {createAnnonceMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publication...
                        </>
                      ) : (
                        'Publier l\'annonce'
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.back()}
                    >
                      Annuler
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

