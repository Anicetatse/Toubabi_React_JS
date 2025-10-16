'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Calculator, Info, Building, MapPin, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const simulationSchema = z.object({
  selected_commune_id: z.string({ message: 'Veuillez sélectionner une commune' }).min(1, 'Veuillez sélectionner une commune'),
  selected_quartier_id: z.string({ message: 'Veuillez sélectionner un quartier' }).min(1, 'Veuillez sélectionner un quartier'),
  superficie: z.number({ message: 'Veuillez entrer un nombre valide' })
    .min(1, 'La superficie doit être d\'au moins 1 m²')
    .max(10000000000, 'La superficie ne peut pas dépasser 10 milliards de m²'),
  ouvrage: z.enum(['immeuble', 'logement'], { message: 'Veuillez sélectionner le type d\'ouvrage' }),
  standing: z.enum(['economique', 'moyen', 'haut', 'tres_haut'], { message: 'Veuillez sélectionner le standing' }),
  niveau: z.string().optional(),
  logement_type: z.string().optional(),
  couverture_section: z.string().optional(),
  pieces: z.string().optional(),
});

type SimulationForm = z.infer<typeof simulationSchema>;

interface Commune {
  id: string;
  nom: string;
}

interface Quartier {
  id: string;
  nom: string;
  commune_id: string;
}

interface EstimationData {
  coefficient_occupa_sols: number;
  hauteur: number;
  niveau: number;
}

export default function SimulationPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null);
  const [estimationData, setEstimationData] = useState<EstimationData | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SimulationForm>({
    resolver: zodResolver(simulationSchema),
  });

  const selectedCommuneId = watch('selected_commune_id');
  const selectedQuartierId = watch('selected_quartier_id');
  const superficie = watch('superficie');
  const standing = watch('standing');
  const ouvrage = watch('ouvrage');

  // Debug - Pour voir les valeurs
  useEffect(() => {
    console.log('🔍 Debug - ouvrage:', ouvrage);
    console.log('🔍 Debug - standing:', standing);
    console.log('🔍 Debug - Afficher couverture?', ouvrage === 'logement' && (standing === 'economique' || standing === 'moyen'));
  }, [ouvrage, standing]);

  // Récupérer les données d'estimation quand un quartier est sélectionné
  useEffect(() => {
    const fetchEstimationData = async () => {
      if (selectedQuartierId) {
        try {
          console.log('📍 Récupération des données d\'estimation pour quartier:', selectedQuartierId);
          const response = await fetch(`/api/estimation/${selectedQuartierId}`);
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ Données d\'estimation récupérées:', data.data);
            setEstimationData(data.data);
            setSelectedQuartier(quartiers.find(q => q.id === selectedQuartierId) || null);
          } else {
            console.error('❌ Erreur lors de la récupération des données d\'estimation');
            setEstimationData(null);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des données d\'estimation:', error);
          setEstimationData(null);
        }
      } else {
        setEstimationData(null);
        setSelectedQuartier(null);
      }
    };

    fetchEstimationData();
  }, [selectedQuartierId, quartiers]);

  // Vérifier l'authentification
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/simulation');
    }
  }, [isAuthenticated, authLoading, router]);

  // Charger les communes au montage
  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        const response = await fetch('/api/communes');
        const data = await response.json();
        if (data.success) {
          setCommunes(data.data.sort((a: Commune, b: Commune) => a.nom.localeCompare(b.nom)));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des communes:', error);
      }
    };
    fetchCommunes();
  }, []);

  // Charger les quartiers quand une commune est sélectionnée
  useEffect(() => {
    if (selectedCommuneId) {
      const fetchQuartiers = async () => {
        try {
          const response = await fetch(`/api/quartiers/${selectedCommuneId}`);
          const data = await response.json();
          if (data.success) {
            setQuartiers(data.data.sort((a: Quartier, b: Quartier) => a.nom.localeCompare(b.nom)));
            setSelectedCommune(communes.find(c => c.id === selectedCommuneId) || null);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des quartiers:', error);
        }
      };
      fetchQuartiers();
    } else {
      setQuartiers([]);
      setSelectedCommune(null);
    }
  }, [selectedCommuneId, communes]);

  const [calculationResult, setCalculationResult] = useState<any>(null);

  const onSubmit = async (data: SimulationForm) => {
    console.log('📋 Données soumises:', data);
    
    // Vérifier que les données d'estimation sont disponibles
    if (!estimationData) {
      alert('Veuillez sélectionner un quartier valide');
      return;
    }
    
    setLoading(true);
    try {
      // Appeler l'API de calcul directement (les données d'estimation sont déjà chargées)
      console.log('🔢 Appel API de calcul avec:', data);
      const calculateResponse = await fetch('/api/simulation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const calculateResult = await calculateResponse.json();
      console.log('✅ Résultat du calcul:', calculateResult);
      
      if (calculateResult.success) {
        console.log('✅ Résultat du calcul:', calculateResult.data);
        console.log('🔑 Clés disponibles:', Object.keys(calculateResult.data));
        console.log('📦 Données complètes:', JSON.stringify(calculateResult.data, null, 2));
        
        setCalculationResult(calculateResult.data);
        
        // Définir le résultat selon le type de calcul
        let globalCost = null;
        
        // Pour les immeubles
        if (calculateResult.data.coutGlobal) {
          console.log('💼 Immeuble détecté');
          globalCost = calculateResult.data.coutGlobal;
        }
        // Pour les logements haut/très haut standing
        else if (calculateResult.data.cout_global) {
          console.log('🏛️ Logement haut/très haut standing détecté');
          globalCost = calculateResult.data.cout_global;
        }
        // Pour les logements économique/moyen avec couverture légère
        else if (calculateResult.data.cout_global_couverture_legere) {
          console.log('🏠 Logement économique/moyen détecté (légère)');
          globalCost = calculateResult.data.couverture_section === 'legere' 
            ? calculateResult.data.cout_global_couverture_legere 
            : calculateResult.data.cout_global_couverture_dalle;
        }
        // Pour les logements économique/moyen avec couverture dalle
        else if (calculateResult.data.cout_global_couverture_dalle) {
          console.log('🏠 Logement économique/moyen détecté (dalle)');
          globalCost = calculateResult.data.couverture_section === 'dalle' 
            ? calculateResult.data.cout_global_couverture_dalle 
            : calculateResult.data.cout_global_couverture_legere;
        }
        else {
          console.error('❌ Aucun coût global trouvé dans les données!');
        }
        
        console.log('💰 Coût global défini:', globalCost);
        setResult(globalCost);
      } else {
        console.error('❌ Erreur dans le résultat:', calculateResult);
        alert('Erreur lors du calcul de l\'estimation: ' + (calculateResult.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('❌ Erreur lors du calcul:', error);
      alert('Erreur lors du calcul de l\'estimation: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined || isNaN(price)) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Ne rien afficher si non authentifié (la redirection est en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen relative overflow-hidden">
        {/* Arrière-plan décoratif */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header avec design élégant */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-6 shadow-lg shadow-green-500/50">
              <Calculator className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simulation de projet de construction
            </h1>
            <div className="flex justify-center">
              <p className="text-xl text-gray-600 max-w-3xl text-center font-light">
                Estimez le coût détaillé de votre projet de construction avec précision
            </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
                <Info className="w-4 h-4" />
                Estimation basée sur les données du marché ivoirien
              </span>
            </div>
          </div>

          {/* Formulaire de simulation */}
          <div className="max-w-6xl mx-auto mb-12">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                <div className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-2xl text-white mb-2">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Building className="h-6 w-6" />
                  </div>
                    Détails de votre projet
                  </CardTitle>
                  <p className="text-green-100 text-sm">Complétez tous les champs pour obtenir une estimation précise</p>
                </div>
              </div>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit, (errors) => {
                  console.error('❌ Erreurs de validation:', errors);
                  alert('Veuillez remplir tous les champs obligatoires correctement');
                })} className="space-y-8">
                  {/* Section 1: Localisation */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Localisation du projet</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="selected_commune_id" className="text-sm font-semibold">
                      Sélectionnez une commune
                    </Label>
                    <SearchableSelect
                      options={communes.map(c => ({ value: c.id, label: c.nom }))}
                      value={watch('selected_commune_id')}
                      onValueChange={(value) => {
                        setValue('selected_commune_id', value);
                        setValue('selected_quartier_id', '');
                      }}
                      placeholder="Choisissez une commune"
                      searchPlaceholder="Rechercher une commune..."
                    />
                      {errors.selected_commune_id && (
                        <p className="text-sm text-red-600">{errors.selected_commune_id.message}</p>
                      )}
                  </div>

                    <div className="space-y-2">
                    <Label htmlFor="selected_quartier_id" className="text-sm font-semibold">
                      Sélectionnez un quartier
                    </Label>
                    <SearchableSelect
                      options={quartiers.map(q => ({ value: q.id, label: q.nom }))}
                      value={watch('selected_quartier_id')}
                      onValueChange={(value) => setValue('selected_quartier_id', value)}
                      placeholder={selectedCommuneId ? "Choisissez un quartier" : "Choisissez d'abord une commune"}
                      searchPlaceholder="Rechercher un quartier..."
                      disabled={!selectedCommuneId}
                    />
                      {errors.selected_quartier_id && (
                        <p className="text-sm text-red-600">{errors.selected_quartier_id.message}</p>
                      )}
                    </div>

                      <div className="space-y-2">
                        <Label htmlFor="superficie" className="text-sm font-semibold">
                        Votre terrain (m²)
                        </Label>
                        <Input
                          id="superficie"
                          type="number"
                        min="1"
                        max="100000"
                        step="1"
                        placeholder="Ex: 500"
                          className="h-12"
                          {...register('superficie', { valueAsNumber: true })}
                        onKeyDown={(e) => {
                          // Bloquer les caractères non numériques (sauf backspace, delete, tab, flèches)
                          if (
                            !/[0-9]/.test(e.key) &&
                            !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                          ) {
                            e.preventDefault();
                          }
                        }}
                        />
                        {errors.superficie && (
                          <p className="text-sm text-red-600">{errors.superficie.message}</p>
                        )}
                    </div>
                    </div>
                  </div>

                  {/* Section 2: Caractéristiques du projet */}
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-blue-100/50 rounded-xl blur-sm"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Caractéristiques du projet</h3>
                      </div>

                        {/* Type d'ouvrage - Design premium */}
                        <div className="space-y-3">
                          <Label htmlFor="ouvrage" className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></span>
                            Type d'ouvrage
                        </Label>
                          <Select onValueChange={(value: any) => {
                            setValue('ouvrage', value);
                            // Réinitialiser les champs conditionnels
                            setValue('niveau', '');
                            setValue('logement_type', '');
                            setValue('couverture_section', '');
                            setValue('pieces', '');
                          }}>
                            <SelectTrigger className="h-20 text-xl font-semibold border-3 border-gray-300 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 shadow-sm hover:shadow-md">
                              <SelectValue placeholder="→ Choisissez le type d'ouvrage" />
                          </SelectTrigger>
                            <SelectContent className="border-2">
                              <SelectItem value="immeuble" className="text-xl py-5 cursor-pointer">
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                                  <div className="p-3 bg-blue-100 rounded-xl">
                                    <Building className="w-7 h-7 text-blue-600" />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-bold text-gray-900">Immeuble</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="logement" className="text-xl py-5 cursor-pointer">
                                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-green-50 transition-colors">
                                  <div className="p-3 bg-green-100 rounded-xl">
                                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                  </div>
                                  <div className="text-left">
                                    <div className="font-bold text-gray-900">Logement</div>
                                  </div>
                                </div>
                              </SelectItem>
                          </SelectContent>
                        </Select>
                          {errors.ouvrage && (
                            <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                              <Info className="w-4 h-4" />
                              {errors.ouvrage.message}
                            </p>
                          )}
                        </div>
                      </div>
                      </div>

                    {/* Détails conditionnels */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                      {/* Si Immeuble: Afficher Niveau */}
                      {ouvrage === 'immeuble' && (
                        <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                          <Label htmlFor="niveau" className="text-base font-bold text-blue-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          Nombre de niveaux (R+)
                        </Label>
                        <Select onValueChange={(value: any) => setValue('niveau', value)}>
                            <SelectTrigger className="h-14 text-base font-medium bg-white border-2 border-blue-300 hover:border-blue-500 transition-colors">
                              <SelectValue placeholder="Sélectionnez le niveau" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="R+0 avec couverture dalle">R+0 / RDC</SelectItem>
                            <SelectItem value="R+1">R+1</SelectItem>
                            <SelectItem value="R+2">R+2</SelectItem>
                            <SelectItem value="R+3">R+3</SelectItem>
                            <SelectItem value="R+4">R+4</SelectItem>
                            <SelectItem value="R+5">R+5</SelectItem>
                            <SelectItem value="R+6">R+6</SelectItem>
                            <SelectItem value="R+7">R+7</SelectItem>
                            <SelectItem value="R+8">R+8</SelectItem>
                            <SelectItem value="R+9">R+9</SelectItem>
                            <SelectItem value="R+10 et plus">R+10 et plus</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.niveau && (
                          <p className="text-sm text-red-600">{errors.niveau.message}</p>
                        )}
                        </div>
                      )}

                      {/* Si Logement: Afficher Type de logement */}
                      {ouvrage === 'logement' && (
                        <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <Label htmlFor="logement_type" className="text-base font-bold text-green-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Type de logement
                          </Label>
                          <Select onValueChange={(value: any) => setValue('logement_type', value)}>
                            <SelectTrigger className="h-14 text-base font-medium bg-white border-2 border-green-300 hover:border-green-500 transition-colors">
                              <SelectValue placeholder="Choisissez le type de logement" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="plain_pied">Maison basse / Plain-pied</SelectItem>
                              <SelectItem value="duplex">Duplex</SelectItem>
                              <SelectItem value="triplex">Triplex</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.logement_type && (
                            <p className="text-sm text-red-600">{errors.logement_type.message}</p>
                          )}
                        </div>
                      )}

                      {/* Standing - Toujours affiché */}
                      <div className="space-y-3 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                        <Label htmlFor="standing" className="text-base font-bold text-amber-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                          Type de standing
                        </Label>
                        <Select onValueChange={(value: any) => setValue('standing', value)}>
                          <SelectTrigger className="h-14 text-base font-medium bg-white border-2 border-amber-300 hover:border-amber-500 transition-colors">
                            <SelectValue placeholder="Choisissez le standing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economique">Entrée de gamme / Standing économique</SelectItem>
                            <SelectItem value="moyen">Milieu de gamme / Standing moyen</SelectItem>
                            <SelectItem value="haut">Haut de gamme / Haut standing</SelectItem>
                            <SelectItem value="tres_haut">Luxe / Très haut standing</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.standing && (
                          <p className="text-sm text-red-600">{errors.standing.message}</p>
                        )}
                      </div>
                      </div>
                    </div>

                  {/* Détails supplémentaires pour logement */}
                  {ouvrage === 'logement' && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Pièces par niveau */}
                      <div className="space-y-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                        <Label htmlFor="pieces" className="text-base font-bold text-indigo-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                          </svg>
                          Nombre de pièces par niveau
                        </Label>
                        <Select onValueChange={(value: any) => setValue('pieces', value)}>
                          <SelectTrigger className="h-14 text-base font-medium bg-white border-2 border-indigo-300 hover:border-indigo-500 transition-colors">
                            <SelectValue placeholder="Nombre de pièces" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2 pièces</SelectItem>
                            <SelectItem value="3">3 pièces</SelectItem>
                            <SelectItem value="4">4 pièces</SelectItem>
                            <SelectItem value="5">5 pièces</SelectItem>
                            <SelectItem value="6">6 pièces</SelectItem>
                            <SelectItem value="7">7 pièces</SelectItem>
                            <SelectItem value="8">8 pièces</SelectItem>
                            <SelectItem value="9">9 pièces</SelectItem>
                            <SelectItem value="10 et plus">10 pièces et plus</SelectItem>
                        </SelectContent>
                      </Select>
                        {errors.pieces && (
                          <p className="text-sm text-red-600">{errors.pieces.message}</p>
                      )}
                    </div>

                      {/* Type de couverture - Uniquement pour standing économique ou moyen */}
                      {(() => {
                        console.log('🎯 Condition couverture - ouvrage:', ouvrage, 'standing:', standing);
                        console.log('🎯 Afficher?:', standing === 'economique' || standing === 'moyen');
                        return (standing === 'economique' || standing === 'moyen');
                      })() && (
                        <div className="space-y-3 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                          <Label htmlFor="couverture_section" className="text-base font-bold text-rose-900 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 7v1a3 3 0 003 3h12a3 3 0 003-3V7M3 7l9-4 9 4M5 21V10.5M19 21V10.5" />
                            </svg>
                            Type de couverture
                        </Label>
                          <Select onValueChange={(value: any) => setValue('couverture_section', value)}>
                            <SelectTrigger className="h-14 text-base font-medium bg-white border-2 border-rose-300 hover:border-rose-500 transition-colors">
                              <SelectValue placeholder="Sélectionnez le type de couverture" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="legere">Couverture légère</SelectItem>
                              <SelectItem value="dalle">Couverture dalle</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.couverture_section && (
                            <p className="text-sm text-red-600">{errors.couverture_section.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                 

                  {/* Bouton de soumission - Design premium */}
                  <div className="text-center pt-6">
                      <Button 
                        type="submit" 
                        disabled={loading} 
                      className="group relative px-16 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <>
                            <Calculator className="mr-3 h-6 w-6 animate-spin" />
                            Calcul en cours...
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                            Calculer le coût estimatif
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

          {/* Résultat de la simulation - Tableau comme Laravel */}
          {result !== null && calculationResult && (
            <div className="max-w-6xl mx-auto mb-12">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-md overflow-hidden">
                {/* Header avec animation */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                      <Calculator className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Résultats
                    </h2>
                    <p className="text-green-100 flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                    {selectedQuartier?.nom} • {selectedCommune?.nom}
                  </p>
                        </div>
                      </div>
                      
                <CardContent className="p-10">
                  <div className="space-y-8">
                    {/* Tableau de résultats */}
                    <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-300">
                          <tr>
                            <th className="p-4 text-left font-bold text-gray-900">Standing</th>
                            <th className="p-4 text-left font-bold text-gray-900">Type d'ouvrage</th>
                            
                            {calculationResult.ouvrage === 'immeuble' && (
                              <>
                                <th className="p-4 text-left font-bold text-gray-900">Niveau</th>
                                <th className="p-4 text-left font-bold text-gray-900">Superficie du terrain</th>
                                <th className="p-4 text-left font-bold text-gray-900">Emprise maximale autorisée</th>
                                <th className="p-4 text-left font-bold text-gray-900">Coût gros œuvre</th>
                                <th className="p-4 text-left font-bold text-gray-900">Coût second œuvre</th>
                                <th className="p-4 text-left font-bold text-gray-900">Coût total</th>
                              </>
                            )}
                            
                            {calculationResult.ouvrage === 'logement' && (calculationResult.standing === 'haut' || calculationResult.standing === 'tres_haut') && (
                              <>
                                <th className="p-4 text-left font-bold text-gray-900">Type de logement</th>
                                <th className="p-4 text-left font-bold text-gray-900">Nombre de pièces par niveau</th>
                                <th className="p-4 text-left font-bold text-gray-900">Surface construite estimative par niveau</th>
                                <th className="p-4 text-left font-bold text-gray-900">Surface construite estimative globale</th>
                                <th className="p-4 text-left font-bold text-gray-900">Coût gros œuvre</th>
                                <th className="p-4 text-left font-bold text-gray-900">Coût second œuvre</th>
                                <th className="p-4 text-left font-bold text-gray-900">Coût total</th>
                              </>
                            )}
                            
                            {calculationResult.ouvrage === 'logement' && calculationResult.standing !== 'haut' && calculationResult.standing !== 'tres_haut' && calculationResult.couverture_section && (
                              <>
                                <th className="p-4 text-left font-bold text-gray-900">Type de logement</th>
                                <th className="p-4 text-left font-bold text-gray-900">Nombre de pièces par niveau</th>
                                <th className="p-4 text-left font-bold text-gray-900">Surface construite estimative par niveau</th>
                                <th className="p-4 text-left font-bold text-gray-900">Surface construite estimative globale</th>
                                <th className="p-4 text-left font-bold text-gray-900">Type de couverture</th>
                                {calculationResult.couverture_section === 'legere' ? (
                                  <th className="p-4 text-left font-bold text-gray-900">Coût gros œuvre avec couverture légère</th>
                                ) : (
                                  <th className="p-4 text-left font-bold text-gray-900">Coût gros œuvre avec couverture dalle</th>
                                )}
                                <th className="p-4 text-left font-bold text-gray-900">Coût second œuvre</th>
                                {calculationResult.couverture_section === 'legere' ? (
                                  <th className="p-4 text-left font-bold text-gray-900">Coût total avec couverture légère</th>
                                ) : (
                                  <th className="p-4 text-left font-bold text-gray-900">Coût total avec couverture dalle</th>
                                )}
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          <tr className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-semibold capitalize">
                              {calculationResult.standing === 'economique' ? 'Économique' : calculationResult.standing?.replace('_', ' ')}
                            </td>
                            <td className="p-4 font-semibold capitalize">{calculationResult.ouvrage}</td>
                            
                            {calculationResult.ouvrage === 'immeuble' && (
                              <>
                                <td className="p-4">{calculationResult.niveau}</td>
                                <td className="p-4 whitespace-nowrap">{formatNumber(calculationResult.superficie)} m²</td>
                                <td className="p-4 whitespace-nowrap">{formatNumber(calculationResult.superficieRestante)} m²</td>
                                <td className="p-4 whitespace-nowrap font-bold text-blue-700">{formatPrice(calculationResult.coutGrosOeuvre)}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-green-700">{formatPrice(calculationResult.coutSecondOeuvre)}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-green-900 text-lg">{formatPrice(calculationResult.coutGlobal)}</td>
                              </>
                            )}
                            
                            {calculationResult.ouvrage === 'logement' && (calculationResult.standing === 'haut' || calculationResult.standing === 'tres_haut') && (
                              <>
                                <td className="p-4 capitalize">{calculationResult.logement_type?.replace('_', ' ')}</td>
                                <td className="p-4">{calculationResult.pieces}</td>
                                <td className="p-4">{formatNumber(calculationResult.surface_construite_logement1)} m²</td>
                                <td className="p-4">{formatNumber(calculationResult.surface_construite_logement)} m²</td>
                                <td className="p-4 whitespace-nowrap font-bold text-blue-700">{formatPrice(calculationResult.cout_couverture)}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-green-700">{formatPrice(calculationResult.cout_second_oeuvre)}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-green-900 text-lg">{formatPrice(calculationResult.cout_global)}</td>
                              </>
                            )}
                            
                            {calculationResult.ouvrage === 'logement' && calculationResult.standing !== 'haut' && calculationResult.standing !== 'tres_haut' && calculationResult.couverture_section && (
                              <>
                                <td className="p-4 capitalize">{calculationResult.logement_type?.replace('_', ' ')}</td>
                                <td className="p-4">{calculationResult.pieces}</td>
                                <td className="p-4">{formatNumber(calculationResult.surface_construite_logement1)} m²</td>
                                <td className="p-4">{formatNumber(calculationResult.surface_construite_logement)} m²</td>
                                <td className="p-4 capitalize">{calculationResult.couverture_section === 'legere' ? 'Légère' : 'Dalle'}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-blue-700">
                                  {formatPrice(
                                    calculationResult.couverture_section === 'legere' 
                                      ? calculationResult.cout_couverture_legere 
                                      : calculationResult.cout_couverture_dalle
                                  )}
                                </td>
                                <td className="p-4 whitespace-nowrap font-bold text-green-700">{formatPrice(calculationResult.cout_second_oeuvre)}</td>
                                <td className="p-4 whitespace-nowrap font-bold text-green-900 text-lg">
                                  {formatPrice(
                                    calculationResult.couverture_section === 'legere' 
                                      ? calculationResult.cout_global_couverture_legere 
                                      : calculationResult.cout_global_couverture_dalle
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        </tbody>
                      </table>
                        </div>

                    {/* Prix total mis en évidence */}
                    <div className="text-center">
                      <div className="inline-block rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-8 border-2 border-green-300 shadow-lg">
                        <div className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">Coût total estimé</div>
                        <div className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatPrice(result)}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Prix en F CFA (XOF)</p>
                      </div>
                    </div>
                    
                    {/* Bouton de contact premium */}
                    <div className="text-center">
                    <Button 
                        className="group px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                      asChild
                    >
                        <a href="mailto:contact@toubabi.com" className="flex items-center gap-3">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Demander un devis détaillé
                      </a>
                    </Button>
                    </div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          )}

          {/* Boutons de navigation - Design amélioré */}
          <div className="max-w-6xl mx-auto text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                variant="outline" 
                className="group px-10 py-4 border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 font-semibold text-lg rounded-xl transition-all duration-300"
                onClick={() => window.location.href = '/'}
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Button>
              {result !== null && (
              <Button 
                  className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  setResult(null);
                  setEstimationData(null);
                  setSelectedQuartier(null);
                    setValue('selected_commune_id', '');
                    setValue('selected_quartier_id', '');
                    setValue('superficie', 0);
                }}
              >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Nouvelle simulation
              </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
