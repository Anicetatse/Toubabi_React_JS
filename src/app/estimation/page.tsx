'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Calculator, Info, Building, MapPin } from 'lucide-react';

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

export default function EstimationPage() {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null);
  const [estimationData, setEstimationData] = useState<EstimationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<Commune | null>(null);
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('');
  const [selectedQuartierId, setSelectedQuartierId] = useState<string>('');

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

  // Fonction pour récupérer les règles d'urbanisme
  const handleGetUrbanRules = async (quartierId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/estimation/${quartierId}`);
      const data = await response.json();
      
      if (data.success) {
        setEstimationData(data.data);
        setSelectedQuartier(quartiers.find(q => q.id === quartierId) || null);
      } else {
        alert('Aucune donnée d\'urbanisme disponible pour ce quartier');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des règles:', error);
      alert('Erreur lors de la récupération des règles d\'urbanisme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header avec titre élégant */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Règles d'urbanisme et coûts de construction
            </h1>
            <div className="flex justify-center">
              <p className="text-lg text-gray-600 max-w-2xl text-center">
                Consultez les règles d'urbanisme par quartier et estimez le coût de votre projet de construction
              </p>
            </div>
          </div>

          {/* Message informatif sur les communes couvertes */}
          {/* <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900 space-y-2">
                    <p className="font-semibold">Règles d'urbanisme disponibles</p>
                    <p>
                      Les règles générales d'urbanisme sont publiées avec précision uniquement pour les neuf communes suivantes: 
                      <strong> Abobo, Adjamé, Attécoubé, Cocody, Koumassi, Marcory, Port-Bouët, Treichville et Yopougon</strong>.
                    </p>
                    <p>
                      Pour toutes les autres communes du pays, nos équipes peuvent recueillir pour vous les informations actualisées selon le(s) quartier(s) auprès de l'antenne compétente du MCLU.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Sélection commune/quartier */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Sélectionnez votre zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="selected_commune_id" className="text-sm font-semibold">
                      Sélectionnez une commune
                    </Label>
                    <SearchableSelect
                      options={communes.map(c => ({ value: c.id, label: c.nom }))}
                      value={selectedCommuneId}
                      onValueChange={(value) => {
                        setSelectedCommuneId(value);
                        setSelectedQuartierId('');
                        setEstimationData(null);
                        setSelectedQuartier(null);
                      }}
                      placeholder="Choisissez une commune"
                      searchPlaceholder="Rechercher une commune..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selected_quartier_id" className="text-sm font-semibold">
                      Sélectionnez un quartier
                    </Label>
                    <SearchableSelect
                      options={quartiers.map(q => ({ value: q.id, label: q.nom }))}
                      value={selectedQuartierId}
                      onValueChange={(value) => setSelectedQuartierId(value)}
                      placeholder={selectedCommuneId ? "Choisissez un quartier" : "Choisissez d'abord une commune"}
                      searchPlaceholder="Rechercher un quartier..."
                      disabled={!selectedCommuneId}
                    />
                  </div>
                </div>

                {/* Bouton pour voir les règles d'urbanisme */}
                {selectedCommuneId && selectedQuartierId && selectedQuartierId !== '' && (
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={() => handleGetUrbanRules(selectedQuartierId)}
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <Building className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <Building className="mr-2 h-4 w-4" />
                          Voir les règles d'urbanisme
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bouton Simuler mon projet - Toujours visible */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-600 to-green-700">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-2">
                      <Calculator className="h-6 w-6" />
                      Simuler le coût de votre projet
                    </h3>
                    <p className="text-green-100 text-sm">
                      Obtenez une estimation détaillée du coût de construction
                    </p>
                  </div>
                  <Button 
                    onClick={() => window.location.href = '/simulation'}
                    className="bg-white text-green-700 hover:bg-green-50 font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Démarrer la simulation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Affichage des règles d'urbanisme */}
          {selectedQuartier && estimationData ? (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-5 w-5" />
                    Règles d'urbanisme - {selectedQuartier.nom}
                  </CardTitle>
                  <p className="text-blue-100 text-sm">
                    {selectedCommune?.nom} • Données officielles MCLU
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-4 text-left font-semibold text-gray-700">Quartier</th>
                          <th className="p-4 text-left font-semibold text-gray-700">C.O.S. (Surface constructible)</th>
                          <th className="p-4 text-left font-semibold text-gray-700">Hauteur maximale</th>
                          <th className="p-4 text-left font-semibold text-gray-700">Niveau autorisé</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-blue-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{selectedQuartier.nom}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                              {estimationData.coefficient_occupa_sols.toLocaleString('fr-FR')} %
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {estimationData.hauteur.toLocaleString('fr-FR')} m
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                              R+ {estimationData.niveau.toLocaleString('fr-FR')}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Boutons de navigation */}
          <div className="max-w-4xl mx-auto text-center">
            <Button 
              variant="outline" 
              className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => window.location.href = '/'}
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
