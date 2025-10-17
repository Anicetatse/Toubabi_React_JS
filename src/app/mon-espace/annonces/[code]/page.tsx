'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { locationService } from '@/services/locationService';
import { 
  Loader2, Upload, X, ArrowLeft
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClientTopBar } from '@/components/ClientTopBar';
import { Stepper } from '@/components/ui/stepper';
import { SearchableSelect } from '@/components/ui/searchable-select';
import toast from 'react-hot-toast';
import Link from 'next/link';
import '../../../deposer-annonce/deposer-annonce.css';

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

export default function ModifierAnnoncePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  console.log('🔧 ModifierAnnoncePage - Code:', code);
  console.log('🔧 ModifierAnnoncePage - Authenticated:', isAuthenticated);
  
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fonction pour nettoyer le HTML et extraire le texte brut
  const stripHtml = (html: string): string => {
    if (!html) return '';
    // Créer un élément temporaire pour parser le HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    // Récupérer uniquement le texte
    return tmp.textContent || tmp.innerText || '';
  };

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
    reset,
  } = useForm<AnnonceForm>({
    resolver: zodResolver(annonceSchema),
    defaultValues: {
      type: 'acheter',
      meuble: '0',
      approuve: true, // Déjà approuvé pour la modification
    },
  });

  // Charger l'annonce existante
  const { data: annonce, isLoading: loadingAnnonce } = useQuery({
    queryKey: ['annonce-edit', code],
    queryFn: async () => {
      const response = await fetch(`/api/client/annonces/${code}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const result = await response.json();
      return result.success ? result.data : null;
    },
    enabled: !!code && isAuthenticated,
  });

  const categorieId = watch('categorie');
  const communeId = watch('commune');

  // Charger les données de référence
  const { data: quartiers = [] } = useQuery({
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

  // Pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (annonce && !isDataLoaded) {
      console.log('📝 Pré-remplissage du formulaire avec:', annonce);
      
      reset({
        type: annonce.type_annonce || 'acheter',
        categorie: annonce.code_categorie || '',
        souscategorie: annonce.code_souscategorie || '',
        meuble: annonce.meuble !== null ? annonce.meuble.toString() : '0',
        piece: annonce.piece ? annonce.piece.toString() : '',
        chambre: annonce.chambre ? annonce.chambre.toString() : '',
        surface: annonce.surface || undefined,
        prix: annonce.prix_vente || 0,
        commune: annonce.id_commune || 0,
        quartier: annonce.id_quartier || 0,
        description: stripHtml(annonce.description || ''),
        caracteristiques: annonce.caracteristiques || [],
        approuve: true,
      });

      // Charger les images existantes
      if (annonce.images && Array.isArray(annonce.images)) {
        setExistingImages(annonce.images);
      }

      setIsDataLoaded(true);
    }
  }, [annonce, isDataLoaded, reset]);

  // Conditions d'affichage
  const isTerrainOrImmeuble = categorieId === 'terrain' || categorieId === 'immeuble';
  const showMeubleField = !isTerrainOrImmeuble && categorieId;
  const showPiecesChambres = !isTerrainOrImmeuble && categorieId;

  // Mutation pour la mise à jour
  const updateAnnonceMutation = useMutation({
    mutationFn: async (data: AnnonceForm) => {
      console.log('Mise à jour de l\'annonce:', data);
      
      const formData = new FormData();
      formData.append('_method', 'PUT'); // Method spoofing pour Laravel
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'caracteristiques' && Array.isArray(value)) {
            value.forEach((id, idx) => formData.append(`caracteristiques[${idx}]`, id.toString()));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Ajouter les nouvelles images
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      // Garder les images existantes
      existingImages.forEach((imagePath, index) => {
        formData.append(`existing_images[${index}]`, imagePath);
      });

      // Appeler l'API de mise à jour
      const response = await fetch(`/api/biens/${code}`, {
        method: 'POST', // Next.js API routes utilisent POST avec _method
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('📡 Réponse API:', result);
      console.log('📡 Status:', response.status);
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la mise à jour');
      }
      return result.data;
    },
    onSuccess: () => {
      console.log('✅ Modification réussie !');
      toast.success('Annonce modifiée avec succès !');
      
      // Invalider les caches pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['my-annonces'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      queryClient.invalidateQueries({ queryKey: ['annonce-edit', code] });
      
      router.push('/mon-espace/annonces');
    },
    onError: (error: any) => {
      console.error('❌ Erreur modification annonce:', error);
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  // Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxPhotos = 8;
    const totalImages = existingImages.length + selectedImages.length + files.length;
    
    if (totalImages > maxPhotos) {
      toast.error(`Maximum ${maxPhotos} photos (${existingImages.length} existantes + ${selectedImages.length} nouvelles)`);
      return;
    }

    files.forEach((file) => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`La photo "${file.name}" dépasse 100 Mo`);
        return;
      }
      
      setSelectedImages((prev) => [...prev, file]);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    toast.success('Photo supprimée');
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    toast.success('Photo supprimée');
  };

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const getNumericPrice = (formattedValue: string) => {
    return parseInt(formattedValue.replace(/[^\d]/g, ''), 10) || 0;
  };

  const handleCategorieChange = (value: string) => {
    setValue('categorie', value);
    setValue('souscategorie', '');
  };

  const handleCommuneChange = (value: number) => {
    setValue('commune', value);
    setValue('quartier', '' as any);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: (keyof AnnonceForm)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['type', 'categorie', 'prix'];
        break;
      case 2:
        fieldsToValidate = ['commune', 'quartier'];
        break;
      case 3:
        return true;
      case 4:
        fieldsToValidate = ['description'];
        break;
      case 5:
        fieldsToValidate = ['approuve'];
        break;
      default:
        return true;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(prev => Math.min(steps.length, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
    console.log('Soumission modification:', data);
    updateAnnonceMutation.mutate(data);
  };

  if (loadingAnnonce) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (!annonce) {
    return (
      <>
        <Header />
        <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto p-4 lg:p-8">
            <ClientTopBar />
            <div className="max-w-2xl mx-auto mt-12">
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Annonce non trouvée</h2>
                <p className="text-gray-600 mb-6">Cette annonce n'existe pas ou ne vous appartient pas.</p>
                <Button asChild>
                  <Link href="/mon-espace/annonces">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à mes annonces
                  </Link>
                </Button>
              </Card>
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

          {/* Lien retour */}
          <div className="mb-6">
            <Link 
              href="/mon-espace/annonces"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes annonces
            </Link>
          </div>

          {/* En-tête */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Modifier l'annonce</h1>
            <p className="text-gray-600">Modifiez les informations de votre bien immobilier</p>
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
                    <div className="form-submit">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Type de bien</h3>
                      <div className="submit-section">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Type: Louer/Acheter */}
                          <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                              <div className="form-group col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Vous souhaitez *</label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <input 
                                      type="radio" 
                                      id="type-louer" 
                                      value="louer"
                                      checked={field.value === 'louer'}
                                      onChange={() => field.onChange('louer')}
                                      className="hidden"
                                    />
                                    <label htmlFor="type-louer" className={`block w-full p-4 text-center rounded-lg border-2 cursor-pointer transition-all ${
                                      field.value === 'louer'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-400'
                                    }`}>
                                      <span className="text-lg font-semibold">Louer</span>
                                      <br />
                                      <span className="text-sm opacity-75">Mettre en location</span>
                                    </label>
                                  </div>
                                  <div>
                                    <input 
                                      type="radio" 
                                      id="type-acheter" 
                                      value="acheter"
                                      checked={field.value === 'acheter'}
                                      onChange={() => field.onChange('acheter')}
                                      className="hidden"
                                    />
                                    <label htmlFor="type-acheter" className={`block w-full p-4 text-center rounded-lg border-2 cursor-pointer transition-all ${
                                      field.value === 'acheter'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-400'
                                    }`}>
                                      <span className="text-lg font-semibold">Vendre</span>
                                      <br />
                                      <span className="text-sm opacity-75">Vendre mon bien</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          />

                          {/* Catégorie */}
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

                          {/* Sous-catégorie */}
                          <div className="form-group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sous Type de bien</label>
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
                                    {!categorieId ? 'Sélectionnez d\'abord un type de bien' : 'Peu importe'}
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

                          {/* Prix */}
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

                        {/* Meublé */}
                        {showMeubleField && (
                          <div className="form-group col-md-6 mt-6" id="div_meuble">
                            <ul className="no-ul-list third-row flex gap-4">
                              <li>
                                <input 
                                  id="meuble-edit" 
                                  value="1" 
                                  className="checkbox-custom" 
                                  name="meuble" 
                                  type="radio"
                                  checked={watch('meuble') === '1'}
                                  onChange={() => setValue('meuble', '1')}
                                />
                                <label htmlFor="meuble-edit" className="checkbox-custom-label">Meublé</label>
                              </li>
                              <li>
                                <input 
                                  value="0" 
                                  checked={watch('meuble') === '0'}
                                  id="meuble2-edit" 
                                  className="checkbox-custom" 
                                  name="meuble" 
                                  type="radio"
                                  onChange={() => setValue('meuble', '0')}
                                />
                                <label htmlFor="meuble2-edit" className="checkbox-custom-label">Non meublé</label>
                              </li>
                            </ul>
                          </div>
                        )}

                        {/* Pièces et Chambres */}
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
                                      id={`p-edit-${index + 1}`}
                                      checked={watch('piece') === String(index + 1)}
                                      onChange={() => {
                                        const selectedPieces = String(index + 1);
                                        setValue('piece', selectedPieces);
                                        
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
                                        id={`c-edit-${index + 1}`}
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
                            </div>
                          </div>
                        )}

                        {/* Surface */}
                        <div className="form-group col-md-6 mt-6">
                          <label>Surface en m²</label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Ex: 150"
                            className="w-full"
                            onKeyPress={(e) => {
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
                            {errors.quartier && (
                              <p className="text-sm text-red-600 mt-1">{errors.quartier.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 3: Photos */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="form-submit">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Photos</h3>
                      <div className="submit-section">
                        <div className="form-group">
                          <label className="block text-sm font-semibold text-gray-700 mb-4">Photos de votre bien</label>

                          {/* Images existantes */}
                          {existingImages.length > 0 && (
                            <div className="mb-6">
                              <p className="text-sm text-gray-600 mb-3">Images actuelles ({existingImages.length})</p>
                              <div className="modern-image-grid">
                                {existingImages.map((imagePath, index) => (
                                  <div key={index} className="modern-image-card">
                                    <img 
                                      src={imagePath.startsWith('/') ? imagePath : `/${imagePath}`} 
                                      alt={`Photo ${index + 1}`} 
                                      className="preview-image" 
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeExistingImage(index)}
                                      className="remove-image-btn"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                    <div className="image-number">{index + 1}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Zone d'upload pour nouvelles images */}
                          {(existingImages.length + selectedImages.length) < 8 && (
                            <div className="modern-upload-zone">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="photo-upload-edit"
                              />
                              <label htmlFor="photo-upload-edit" className="upload-label">
                                <div className="upload-content">
                                  <Upload className="upload-icon" />
                                  <div className="upload-text">
                                    <p className="upload-title">Ajouter des photos</p>
                                    <p className="upload-subtitle">Maximum {8 - existingImages.length - selectedImages.length} photos supplémentaires</p>
                                  </div>
                                  <p className="upload-hint">PNG, JPG, JPEG jusqu'à 100 Mo par image</p>
                                </div>
                              </label>
                            </div>
                          )}

                          {/* Nouvelles images */}
                          {imagePreview.length > 0 && (
                            <div className="mt-6">
                              <p className="text-sm text-gray-600 mb-3">Nouvelles images ({imagePreview.length})</p>
                              <div className="modern-image-grid">
                                {imagePreview.map((preview, index) => (
                                  <div key={index} className="modern-image-card">
                                    <img src={preview} alt={`Nouvelle photo ${index + 1}`} className="preview-image" />
                                    <button
                                      type="button"
                                      onClick={() => removeNewImage(index)}
                                      className="remove-image-btn"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                    <div className="image-number bg-green-600">Nouveau</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-gray-600 mt-3">
                            Total: {existingImages.length + selectedImages.length} / 8 photos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 4: Description */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="form-submit">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Informations Détaillées</h3>
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

                        {/* Caractéristiques */}
                        <div className="form-group col-md-12 mt-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Autres caractéristiques (optionnelle)
                          </label>
                          <div className="o-features">
                            <br />
                            {caracteristiques.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">Aucune caractéristique disponible.</p>
                            ) : (
                              <ul className="no-ul-list third-row flex flex-wrap gap-4">
                                {caracteristiques.map((caracteristique: any) => (
                                  <li key={caracteristique.id}>
                                    <input 
                                      id={`caract-edit-${caracteristique.id}`}
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
                                    <label htmlFor={`caract-edit-${caracteristique.id}`} className="checkbox-custom-label">
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
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmation</h3>
                      <p className="text-gray-600 mb-6">
                        Vérifiez les informations avant de soumettre les modifications
                      </p>
                      <div className="submit-section">
                        <div className="form-group mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Accord RGPD *</label>
                          <ul className="no-ul-list">
                            <li>
                              <input 
                                required 
                                id="aj-edit-1" 
                                value="1" 
                                className="checkbox-custom" 
                                name="approuve" 
                                type="checkbox"
                                checked={watch('approuve')}
                                onChange={(e) => setValue('approuve', e.target.checked)}
                              />
                              <label htmlFor="aj-edit-1" className="checkbox-custom-label">
                                Je confirme les modifications apportées à mon annonce
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
                      disabled={updateAnnonceMutation.isPending}
                      className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {updateAnnonceMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        'Enregistrer les modifications'
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
