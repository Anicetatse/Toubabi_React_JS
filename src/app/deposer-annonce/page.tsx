'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { produitService } from '@/services/produitService';
import { locationService } from '@/services/locationService';
import { 
  Loader2, Upload, X
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClientTopBar } from '@/components/ClientTopBar';
import { Stepper } from '@/components/ui/stepper';
import { SearchableSelect } from '@/components/ui/searchable-select';
import toast from 'react-hot-toast';
import './deposer-annonce.css';

const annonceSchema = z.object({
  type: z.enum(['louer', 'acheter'], { 
    message: 'Veuillez sélectionner Louer ou Acheter' 
  }),
  categorie: z.string({ message: 'La catégorie est requise' }).min(1, 'La catégorie est requise'),
  souscategorie: z.string().optional(),
  meuble: z.string().optional(),
  piece: z.string().optional(),
  chambre: z.string().optional(),
  surface: z.number({ message: 'La surface doit être un nombre valide' }).positive('La surface doit être positive').optional(),
  prix: z.number({ message: 'Le prix doit être un nombre valide' }).min(1, 'Le prix est requis'),
  commune: z.number({ message: 'Veuillez sélectionner une commune' }).min(1, 'La commune est requise'),
  quartier: z.number({ message: 'Veuillez sélectionner un quartier' }).min(1, 'Le quartier est requis'),
  description: z.string({ message: 'La description est requise' }).min(20, 'La description doit contenir au moins 20 caractères'),
  caracteristiques: z.array(z.number()).optional(),
  approuve: z.boolean().refine(val => val === true, { message: 'Vous devez accepter les conditions RGPD' }),
});

type AnnonceForm = z.infer<typeof annonceSchema>;

export default function DeposerAnnoncePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Type de bien', description: 'Catégorie et détails' },
    { id: 2, title: 'Localisation', description: 'Commune et quartier' },
    { id: 3, title: 'Photos', description: 'Images du bien' },
    { id: 4, title: 'Description', description: 'Détails et caractéristiques' },
    { id: 5, title: 'Confirmation', description: 'Vérification finale' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    trigger,
  } = useForm<AnnonceForm>({
    resolver: zodResolver(annonceSchema),
    defaultValues: {
      type: 'acheter',
      meuble: '0',
      approuve: false,
    },
  });

  const categorieId = watch('categorie');
  const communeId = watch('commune');
  const typeAnnonce = watch('type');

  // Charger les quartiers quand une commune est sélectionnée
  const { data: quartiers = [], refetch: refetchQuartiers } = useQuery({
    queryKey: ['quartiers', communeId],
    queryFn: async () => {
      if (!communeId) return [];
      const response = await fetch(`/api/quartiers/${communeId}`);
      const data = await response.json();
      return data.success ? data.data : [];
    },
    enabled: !!communeId,
  });

  const { data: communes = [] } = useQuery({
    queryKey: ['communes'],
    queryFn: () => locationService.getCommunes(),
  });

  const { data: caracteristiques = [] } = useQuery({
    queryKey: ['caracteristiques'],
    queryFn: async () => {
      const response = await fetch('/api/caracteristiques');
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Logique pour charger les sous-catégories
  const { data: sousCategoriesData = [] } = useQuery({
    queryKey: ['sous-categories', categorieId],
    queryFn: async () => {
      if (!categorieId) return [];
      const response = await fetch(`/api/sous-categories?categorie=${categorieId}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!categorieId,
  });

  // Conditions d'affichage basées sur le fichier original
  const isTerrainOrImmeuble = categorieId === 'terrain' || categorieId === 'immeuble';
  const showMeubleField = !isTerrainOrImmeuble && categorieId;
  const showPiecesChambres = !isTerrainOrImmeuble && categorieId;

  const createAnnonceMutation = useMutation({
    mutationFn: async (data: AnnonceForm) => {
      console.log('Données du formulaire:', data);
      console.log('Images sélectionnées:', selectedImages.length);
      
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'caracteristiques' && Array.isArray(value)) {
            value.forEach((id, idx) => formData.append(`caracteristiques[${idx}]`, id.toString()));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Log du FormData pour debug
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      return produitService.create(formData);
    },
    onSuccess: () => {
      toast.success('Annonce créée avec succès !');
      router.push('/mon-espace/annonces');
    },
    onError: (error: any) => {
      console.error('Erreur création annonce:', error);
      console.error('Détails erreur:', error.response?.data);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Erreur lors de la création de l\'annonce';
      toast.error(errorMessage);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxPhotos = 8;
    const maxSize = 100 * 1024 * 1024; // 100 Mo en octets

    // Vérifier le nombre total de photos
    if (selectedImages.length + files.length > maxPhotos) {
      toast.error(`Vous ne pouvez sélectionner que ${maxPhotos} photos maximum`);
      e.target.value = '';
      return;
    }

    // Filtrer et valider chaque fichier
    const validFiles: File[] = [];

    files.forEach((file) => {
      // Vérifier la taille du fichier
      if (file.size > maxSize) {
        toast.error(`La photo "${file.name}" dépasse 100 Mo`);
        return;
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error(`Le fichier "${file.name}" n'est pas une image`);
        return;
      }

      validFiles.push(file);
    });

    // Ajouter les fichiers valides
    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);

      validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

      toast.success(`${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} ajoutée${validFiles.length > 1 ? 's' : ''}`);
    }

    // Réinitialiser l'input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    toast.success('Photo supprimée');
  };

  // Fonction pour formater le prix avec séparateurs de milliers
  const formatPrice = (value: string) => {
    // Supprimer tous les caractères non numériques
    const numericValue = value.replace(/[^\d]/g, '');
    // Ajouter des séparateurs de milliers
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Fonction pour obtenir la valeur numérique du prix
  const getNumericPrice = (formattedValue: string) => {
    return parseInt(formattedValue.replace(/[^\d]/g, ''), 10) || 0;
  };

  // Handler pour le changement de catégorie
  const handleCategorieChange = (value: string) => {
    setValue('categorie', value);
    // Réinitialiser la sous-catégorie quand la catégorie change
    setValue('souscategorie', '');
  };

  // Handler pour le changement de commune
  const handleCommuneChange = (value: number) => {
    setValue('commune', value);
    // Réinitialiser le quartier quand la commune change
    setValue('quartier', '' as any);
  };

  // Validation par étape
  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof AnnonceForm)[] = [];

    switch (step) {
      case 1: // Type de bien
        fieldsToValidate = ['type', 'categorie', 'prix'];
        break;
      case 2: // Localisation
        fieldsToValidate = ['commune', 'quartier'];
        break;
      case 3: // Photos
        // Pas de validation obligatoire pour les photos
        return true;
      case 4: // Description
        fieldsToValidate = ['description'];
        break;
      case 5: // Confirmation
        fieldsToValidate = ['approuve'];
        break;
      default:
        return true;
    }

    // Déclencher la validation pour les champs de l'étape
    const result = await trigger(fieldsToValidate);
    return result;
  };

  // Handler pour passer à l'étape suivante avec validation
  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(steps.length, prev + 1));
      // Faire défiler vers le haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Messages d'erreur spécifiques par étape
      const errorMessages = {
        1: 'Veuillez sélectionner le type, la catégorie et indiquer le prix',
        2: 'Veuillez sélectionner la commune et le quartier',
        3: 'Cette étape est optionnelle',
        4: 'Veuillez fournir une description d\'au moins 20 caractères',
        5: 'Veuillez accepter les conditions RGPD',
      };
      toast.error(errorMessages[currentStep as keyof typeof errorMessages]);
    }
  };


  const onSubmit = (data: AnnonceForm) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Validation supplémentaire avant soumission
    if (!data.type || !data.categorie || !data.prix || !data.commune || !data.quartier || !data.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!data.approuve) {
      toast.error('Veuillez accepter les conditions RGPD');
      return;
    }

    console.log('Soumission du formulaire avec les données:', data);
    createAnnonceMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto p-4 lg:p-6 space-y-6">
            <ClientTopBar />
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                <div className="py-12 text-center">
                  <h2 className="mb-4 text-2xl font-bold">Connexion requise</h2>
                  <p className="mb-6 text-gray-600">
                    Vous devez être connecté pour déposer une annonce
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a href="/login">Se connecter</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-8">
          <ClientTopBar />

          {/* En-tête */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Déposer une annonce</h1>
            <p className="text-gray-600">Suivez les étapes pour publier votre bien immobilier</p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Stepper */}
            <Stepper 
              steps={steps} 
              currentStep={currentStep}
              onStepClick={(stepId) => {
                setCurrentStep(stepId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                
              {/* Étape 1: Type de bien */}
              {currentStep === 1 && (
              <div className="space-y-8">
              {/* 1. Vous souhaitez */}
              <div className="form-submit">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Vous souhaitez ...</h3>
                <div className="submit-section">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <>
                          <div className="radiobtn">
                            <input
                              type="radio"
                              id="louer"
                              name="type"
                              value="louer"
                              checked={field.value === 'louer'}
                              onChange={() => field.onChange('louer')}
                              className="hidden"
                            />
                            <label htmlFor="louer" className={`block w-full p-4 text-center rounded-lg border-2 cursor-pointer transition-all ${
                              field.value === 'louer' 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-400'
                            }`}>
                              <span className="text-lg font-semibold">Mettre en location</span>
                              <br />
                              <span className="text-sm opacity-75">Louer mon bien</span>
                            </label>
                          </div>

                          <div className="radiobtn">
                            <input
                              type="radio"
                              id="dewey"
                              name="type"
                              value="acheter"
                              checked={field.value === 'acheter'}
                              onChange={() => field.onChange('acheter')}
                              className="hidden"
                            />
                            <label htmlFor="dewey" className={`block w-full p-4 text-center rounded-lg border-2 cursor-pointer transition-all ${
                              field.value === 'acheter' 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-400'
                            }`}>
                              <span className="text-lg font-semibold">Vendre</span>
                              <br />
                              <span className="text-sm opacity-75">Vendre mon bien</span>
                            </label>
                          </div>
                        </>
                      )}
                    />

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien *</label>
                        <Controller
                        name="categorie"
                          control={control}
                          render={({ field }) => (
                          <select 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={field.value || ''}
                            onChange={(e) => handleCategorieChange(e.target.value)}
                          >
                            <option value="">Sélectionnez un type de bien</option>
                            {categories.map((categorie: any) => (
                              <option key={categorie.code} value={categorie.code}>
                                {categorie.nom}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.categorie && (
                        <p className="text-sm text-red-600 mt-1">{errors.categorie.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sous Type de bien
                        
                      </label>
                      <Controller
                        name="souscategorie"
                        control={control}
                        render={({ field }) => (
                          <select 
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              !categorieId ? 'border-gray-200 bg-gray-50' : 'border-gray-300'
                            }`}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={!categorieId}
                          >
                            <option value="">
                              {!categorieId 
                                ? 'Sélectionnez d\'abord un type de bien' 
                                : sousCategoriesData.length === 0 
                                  ? 'Peu importe' 
                                  : 'Peu importe'}
                            </option>
                            {sousCategoriesData.map((sousCategorie: any) => (
                              <option key={sousCategorie.code} value={sousCategorie.code}>
                                {sousCategorie.nom}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      
                    </div>

                    <div className="form-group">
                      <label>Prix en FCFA *</label>
                        <Controller
                        name="prix"
                          control={control}
                          render={({ field }) => (
                          <input
                            type="text"
                            placeholder="Ex: 500 000"
                            className="w-full"
                            value={field.value ? formatPrice(field.value.toString()) : ''}
                            onChange={(e) => {
                              const formatted = formatPrice(e.target.value);
                              const numericValue = getNumericPrice(formatted);
                              field.onChange(numericValue);
                            }}
                          />
                        )}
                      />
                      {errors.prix && <p className="text-sm text-red-600 mt-1">{errors.prix.message}</p>}
                    </div>
                  </div>

                  {showMeubleField && (
                    <div className="form-group col-md-6 mt-6" id="div_meuble">
                      <ul className="no-ul-list third-row flex gap-4">
                        <li>
                          <input 
                            id="meuble" 
                            value="1" 
                            className="checkbox-custom" 
                            name="meuble" 
                            type="radio"
                            checked={watch('meuble') === '1'}
                            onChange={() => setValue('meuble', '1')}
                          />
                          <label htmlFor="meuble" className="checkbox-custom-label">Meublé</label>
                        </li>
                        <li>
                          <input 
                            value="0" 
                            checked={watch('meuble') === '0'}
                            id="meuble2" 
                            className="checkbox-custom" 
                            name="meuble" 
                            type="radio"
                            onChange={() => setValue('meuble', '0')}
                          />
                          <label htmlFor="meuble2" className="checkbox-custom-label">Non meublé</label>
                        </li>
                      </ul>
                      </div>
                    )}

                    {showPiecesChambres && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="form-group" id="div_piece">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de pièce</label>
                        <div className="flex flex-wrap gap-2">
                          {['1', '2', '3', '4', '5', '+5'].map((val, index) => (
                            <article key={val} className="feature">
                              <input
                                name="piece"
                                value={index + 1}
                                className="piece"
                                type="checkbox"
                                id={`p${index + 1}`}
                                checked={watch('piece') === String(index + 1)}
                                onChange={() => {
                                  const selectedPieces = String(index + 1);
                                  setValue('piece', selectedPieces);
                                  
                                  // Si le nombre de chambres sélectionné est supérieur aux pièces, le réinitialiser
                                  const currentChambres = watch('chambre');
                                  if (currentChambres && parseInt(currentChambres) > parseInt(selectedPieces)) {
                                    setValue('chambre', '');
                                  }
                                }}
                              />
                              <div>
                                <span>{val}</span>
                              </div>
                            </article>
                            ))}
                          </div>
                        </div>

                      <div className="form-group" id="div_chambre">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de chambre</label>
                        <div className="flex flex-wrap gap-2">
                          {['1', '2', '3', '4', '5', '+5'].map((val, index) => {
                            const currentPieces = watch('piece');
                            const maxChambres = currentPieces ? parseInt(currentPieces) : 6;
                            const isDisabled = index + 1 > maxChambres;
                            
                            return (
                              <article key={val} className={`feature ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                  name="chambre"
                                  value={index + 1}
                                  className="chambre"
                                  type="checkbox"
                                  id={`c${index + 1}`}
                                  checked={watch('chambre') === String(index + 1)}
                                  disabled={isDisabled}
                                  onChange={() => {
                                    if (!isDisabled) {
                                      setValue('chambre', String(index + 1));
                                    }
                                  }}
                                />
                                <div>
                                  <span>{val}</span>
                          </div>
                              </article>
                            );
                          })}
                        </div>
                        {watch('piece') && (
                          <p className="text-xs text-gray-500 mt-2">
                            Max: {watch('piece')} chambre{parseInt(watch('piece') || '0') > 1 ? 's' : ''}
                          </p>
                        )}
                        </div>
                      </div>
                    )}

                  <div className="form-group col-md-6 mt-6">
                    <label>Surface en m²</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ex: 150"
                        className="w-full"
                        onKeyPress={(e) => {
                          // Bloquer les caractères non numériques
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        {...register('surface', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                    </div>
                  </div>
              )}

              {/* Étape 2: Localisation */}
              {currentStep === 2 && (
              <div className="space-y-8">
              <div className="form-submit">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Localisation</h3>
                <div className="submit-section">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Commune *</label>
                      <Controller
                        name="commune"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={communes.map((commune: any) => ({ 
                              value: String(commune.id), 
                              label: commune.nom 
                            }))}
                            value={field.value ? String(field.value) : ''}
                            onValueChange={(value) => handleCommuneChange(Number(value))}
                            placeholder="Sélectionnez une commune"
                            searchPlaceholder="Rechercher une commune..."
                          />
                        )}
                      />
                      {errors.commune && (
                        <p className="text-sm text-red-600 mt-1">{errors.commune.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quartier *</label>
                      <Controller
                        name="quartier"
                        control={control}
                        render={({ field }) => (
                          <SearchableSelect
                            options={quartiers.map((quartier: any) => ({ 
                              value: String(quartier.id), 
                              label: quartier.nom 
                            }))}
                            value={field.value && field.value !== 0 ? String(field.value) : ''}
                            onValueChange={(value) => field.onChange(value ? Number(value) : '')}
                            placeholder={!communeId ? "Sélectionnez d'abord une commune" : "Sélectionnez un quartier"}
                            searchPlaceholder="Rechercher un quartier..."
                            disabled={!communeId}
                          />
                        )}
                      />
                      {!communeId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Veuillez d'abord sélectionner une commune
                        </p>
                      )}
                      {errors.quartier && (
                        <p className="text-sm text-red-600 mt-1">{errors.quartier.message}</p>
                      )}
                    </div>
                  </div>
                    </div>
                  </div>

              {/* Champs cachés comme dans le fichier original */}
              <input type="hidden" id="qrt" value={watch('quartier') || ''} />
              <input type="hidden" id="scat" value={watch('souscategorie') || ''} />
              </div>
              )}

              {/* Étape 3: Photos */}
              {currentStep === 3 && (
              <div className="space-y-8">
              <div className="form-submit">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Photos</h3>
                <div className="submit-section">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Photos de votre bien
                    </label>
                    {/* Zone de drop */}
                    {selectedImages.length < 8 && (
                      <div className="modern-upload-zone">
                      <input
                        type="file"
                          multiple
                        accept="image/*"
                          onChange={handleImageSelect}
                        className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="upload-label">
                          <div className="upload-content">
                            <Upload className="upload-icon" />
                            <div className="upload-text">
                              <p className="upload-title">Cliquez pour télécharger des photos</p>
                              <p className="upload-subtitle">ou glissez-déposez vos images ici</p>
                            </div>
                            <p className="upload-hint">PNG, JPG, JPEG jusqu'à 100 Mo par image (8 photos max)</p>
                          </div>
                        </label>
                      </div>
                    )}
                    
                    {selectedImages.length >= 8 && (
                      <div className="max-photos-reached">
                        <div className="flex items-center justify-center gap-2 text-amber-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">Limite de 8 photos atteinte</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Supprimez une photo pour en ajouter une nouvelle</p>
                    </div>
                    )}

                    {/* Grille de prévisualisation */}
                    {imagePreview.length > 0 && (
                      <div className="modern-image-grid">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="modern-image-card">
                            <img src={preview} alt={`Photo ${index + 1}`} className="preview-image" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="remove-image-btn"
                              aria-label="Supprimer l'image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="image-number">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {imagePreview.length > 0 && (
                      <p className="text-sm text-gray-600 mt-3">
                        {imagePreview.length} photo{imagePreview.length > 1 ? 's' : ''} sélectionnée{imagePreview.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                    </div>
                  </div>
              )}

              {/* Étape 4: Description */}
              {currentStep === 4 && (
              <div className="space-y-8">
              <div className="form-submit">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Informations Detaillées</h3>
                <div className="submit-section">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <Textarea
                      placeholder="Décrivez votre bien en détail..."
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        {...register('description')}
                      />
                      {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="form-group col-md-12 mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Autres caractéristiques (optionnelle)
                      </label>
                      <div className="o-features">
                        <br />
                        {caracteristiques.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">Aucune caractéristique disponible pour le moment.</p>
                        ) : (
                          <ul className="no-ul-list third-row flex flex-wrap gap-4">
                            {caracteristiques.map((caracteristique: any) => (
                            <li key={caracteristique.id}>
                              <input 
                                id={caracteristique.id} 
                                className="checkbox-custom" 
                                name="caracteristiques[]" 
                                type="checkbox" 
                                value={caracteristique.id}
                                checked={(watch('caracteristiques') || []).includes(caracteristique.id)}
                                onChange={(e) => {
                                  const current = watch('caracteristiques') || [];
                                  if (e.target.checked) {
                                    setValue('caracteristiques', [...current, caracteristique.id]);
                                  } else {
                                    setValue('caracteristiques', current.filter((id: number) => id !== caracteristique.id));
                                  }
                                }}
                              />
                              <label htmlFor={caracteristique.id} className="checkbox-custom-label">
                                {caracteristique.nom}
                              </label>
                            </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
              </div>
                    </div>
              )}

              {/* Étape 5: Confirmation */}
              {currentStep === 5 && (
              <div className="space-y-8">
              <div className="form-submit text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Vos coordonnées</h3>
                <p className="text-gray-600 mb-6">
                  Vous pouvez modifier vos informations dans votre espace :{' '}
                  <a style={{color: 'red'}} target="_blank" href="/mon-espace/profile" className="underline">
                          mon profil
                        </a>
                      </p>

                <div className="submit-section">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nom & Prenoms</label>
                      <input 
                        type="text"
                        value={`${user?.nom || ''} ${user?.prenom || ''}`}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input 
                        type="text"
                        value={user?.email || ''}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact</label>
                      <input 
                        type="text"
                        value={user?.telephone || ''}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="form-group mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Accord RGPD *</label>
                    <ul className="no-ul-list">
                      <li>
                        <input 
                          required 
                          id="aj-1" 
                          value="1" 
                          className="checkbox-custom" 
                          name="approuve" 
                          type="checkbox"
                          checked={watch('approuve')}
                          onChange={(e) => setValue('approuve', e.target.checked)}
                        />
                        <label htmlFor="aj-1" className="checkbox-custom-label">
                          Je consens à ce que ce site Web stocke mes informations soumises afin qu'ils puissent répondre à ma demande.
                        </label>
                        {errors.approuve && <p className="text-sm text-red-600 mt-1">{errors.approuve.message}</p>}
                      </li>
                    </ul>
                    </div>
                        </div>
                      </div>
              </div>
              )}

                {/* Boutons de navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentStep === 1}
                    className="px-6"
                  >
                    ← Précédent
                  </Button>

                  <div className="text-sm text-gray-500">
                    Étape {currentStep} sur {steps.length}
                    </div>

                  {currentStep < steps.length ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6"
                    >
                      Suivant →
                    </Button>
                  ) : (
                      <Button
                        type="submit"
                        disabled={createAnnonceMutation.isPending}
                      className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
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
                  )}
                  </div>
            </div>
          </form>
          </div>
        </div>
      </div>

    </>
  );
}
