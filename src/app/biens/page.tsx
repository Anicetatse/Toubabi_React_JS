'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
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
import { Loader2, Heart, MapPin, Bed, Home, X, SlidersHorizontal, ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Commune {
  id: number;
  nom: string;
}

interface Quartier {
  id: number;
  nom: string;
}

interface Categorie {
  code: string;
  nom: string;
}

interface Bien {
  code: string;
  nom: string;
  prix_vente: number;
  surface: number;
  piece: number;
  chambre: number;
  type_annonce: string;
  code_categorie: string;
  image: string;
  created_at: string;
  updated_at: string;
  description: string;
  categorie: { code: string; nom: string } | null;
  quartier: {
    id: number;
    nom: string;
  } | null;
  commune: {
    id: number;
    nom: string;
  } | null;
}

// Helper pour formater les dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export default function BiensPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [communes, setCommunes] = useState<Commune[]>([]);
  const [quartiers, setQuartiers] = useState<Quartier[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // États des filtres
  const [type, setType] = useState(searchParams.get('type') || 'louer');
  const [commune, setCommune] = useState(searchParams.get('commune') || '');
  const [quartier, setQuartier] = useState(searchParams.get('quartier') || '');
  const [price, setPrice] = useState(searchParams.get('price') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.getAll('cate[]'));
  const [piece, setPiece] = useState(searchParams.get('piece') || '');
  const [chambre, setChambre] = useState(searchParams.get('chambre') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [trie, setTrie] = useState(searchParams.get('trie') || '3');
  const [pageInputValue, setPageInputValue] = useState('');
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({});

  // Charger les communes
  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        const response = await fetch('/api/communes');
        const data = await response.json();
        if (data.success) {
          setCommunes(data.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des communes:', error);
      }
    };
    fetchCommunes();
  }, []);

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.filter((c: Categorie) => c.code));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Charger les quartiers quand une commune est sélectionnée
  useEffect(() => {
    const fetchQuartiers = async () => {
      if (commune) {
        try {
          const response = await fetch(`/api/quartiers/${commune}`);
          const data = await response.json();
          if (data.success) {
            setQuartiers(data.data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des quartiers:', error);
        }
      } else {
        setQuartiers([]);
      }
    };
    fetchQuartiers();
  }, [commune]);

  // Charger les biens avec filtres
  useEffect(() => {
    const fetchBiens = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (commune) params.append('commune', commune);
        if (quartier) params.append('quartier', quartier);
        if (price) params.append('price', price);
        selectedCategories.forEach(cat => params.append('cate[]', cat));
        if (piece) params.append('piece', piece);
        if (chambre) params.append('chambre', chambre);
        if (trie) params.append('trie', trie);
        params.append('page', page.toString());

        const response = await fetch(`/api/biens?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setBiens(data.data.data);
          setTotal(data.data.total);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des biens:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBiens();
  }, [type, commune, quartier, price, selectedCategories, piece, chambre, page, trie]);

  const handleCategoryToggle = (code: string) => {
    setSelectedCategories(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
    setPage(1);
  };

  const handlePieceSelect = (value: string) => {
    setPiece(piece === value ? '' : value);
    setPage(1);
  };

  const handleChambreSelect = (value: string) => {
    setChambre(chambre === value ? '' : value);
    setPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fonctions pour gérer le scroll d'images sur les cartes
  const nextImageOnCard = (bienCode: string, totalImages: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndexes(prev => ({
      ...prev,
      [bienCode]: ((prev[bienCode] || 0) + 1) % totalImages
    }));
  };

  const prevImageOnCard = (bienCode: string, totalImages: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndexes(prev => ({
      ...prev,
      [bienCode]: ((prev[bienCode] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const getImageForBien = (bien: Bien): string => {
    try {
      let images: string[] = [];
      if (bien.image) {
        images = bien.image.startsWith('[') ? JSON.parse(bien.image) : [bien.image];
      }
      if (images.length === 0) return '/assets/img/nofound.jpg';
      
      const currentIndex = currentImageIndexes[bien.code] || 0;
      let imgSrc = images[currentIndex] || images[0];
      
      // Corriger le chemin
      imgSrc = imgSrc.replace('assets/images/annonces/', 'assets/annonces/');
      if (!imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
        imgSrc = '/' + imgSrc;
      }
      
      return imgSrc;
    } catch {
      return '/assets/img/nofound.jpg';
    }
  };

  const getImagesCount = (bien: Bien): number => {
    try {
      if (!bien.image) return 0;
      const images = bien.image.startsWith('[') ? JSON.parse(bien.image) : [bien.image];
      return images.length;
    } catch {
      return 0;
    }
  };

  const budgetRanges: { [key: string]: string } = {
    '1': 'moins de 200.000 fr',
    '2': '200.000 - 1.500.000 fr',
    '3': '1.500.000 - 50.000.000 fr',
    '4': '50.000.000 - 200.000.000 fr',
    '5': 'Au delà de 200.000.000 fr',
  };

  const hasActiveFilters = commune || quartier || price || selectedCategories.length > 0 || piece || chambre;

  const resetFilters = () => {
    setCommune('');
    setQuartier('');
    setPrice('');
    setSelectedCategories([]);
    setPiece('');
    setChambre('');
    setPage(1);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Découvrez nos biens immobiliers
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {total > 0 ? `${total} bien${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}` : 'Explorez notre catalogue'}
            </p>

            {/* Barre de recherche rapide */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Type : Louer / Acheter */}
                <div className="md:col-span-3">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setType('louer'); setPage(1); }}
                      className={`py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                        type === 'louer'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🏠 Louer
                    </button>
                    <button
                      onClick={() => { setType('acheter'); setPage(1); }}
                      className={`py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                        type === 'acheter'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      💰 Acheter
                    </button>
                  </div>
          </div>

                {/* Commune */}
                <Select value={commune || undefined} onValueChange={(value) => { setCommune(value); setQuartier(''); setPage(1); }}>
                  <SelectTrigger className="h-12 text-gray-900 bg-white">
                    <SelectValue placeholder="📍 Commune" />
                  </SelectTrigger>
                  <SelectContent>
                    {communes.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Quartier */}
                <Select value={quartier || undefined} onValueChange={(value) => { setQuartier(value); setPage(1); }} disabled={!commune}>
                  <SelectTrigger className="h-12 text-gray-900 bg-white">
                    <SelectValue placeholder={commune ? "🗺️ Quartier" : "Choisissez une commune"} />
                  </SelectTrigger>
                  <SelectContent>
                    {quartiers.map((q) => (
                      <SelectItem key={q.id} value={q.id.toString()}>
                        {q.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Budget */}
                <Select value={price || undefined} onValueChange={(value) => { setPrice(value); setPage(1); }}>
                  <SelectTrigger className="h-12 text-gray-900 bg-white">
                    <SelectValue placeholder="💵 Budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(budgetRanges).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton filtres avancés */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="flex-1 h-12 text-gray-700 border-2 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filtres avancés
                  {hasActiveFilters && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {[commune, quartier, price, piece, chambre, ...selectedCategories].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                {hasActiveFilters && (
              <Button
                    onClick={resetFilters}
                variant="outline"
                    className="h-12 text-red-600 border-2 border-red-300 hover:bg-red-50"
              >
                    <X className="w-5 h-5 mr-2" />
                    Réinitialiser
              </Button>
                )}
              </div>
            </div>
          </div>
        </div>
            </div>

      {/* Filtres avancés (collapsible) */}
            {showFilters && (
        <div className="bg-gray-50 border-b border-gray-200 py-6 shadow-inner">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Affiner votre recherche</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Catégories */}
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-base font-semibold text-gray-800">Type de bien</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.code}
                          onClick={() => handleCategoryToggle(cat.code)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                            selectedCategories.includes(cat.code)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          {cat.nom}
                        </button>
                      ))}
                    </div>
                    </div>

                  {/* Nombre de pièces */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-800">Nombre de pièces</Label>
                    <div className="flex gap-2">
                      {['1', '2', '3', '4', '5', '6'].map((num) => (
                        <button
                          key={num}
                          onClick={() => handlePieceSelect(num)}
                          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all transform hover:scale-110 font-bold text-lg ${
                            piece === num
                              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-400'
                          }`}
                        >
                          {num === '6' ? '5+' : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nombre de chambres */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-800">Nombre de chambres</Label>
                    <div className="flex gap-2">
                      {['1', '2', '3', '4', '5', '6'].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleChambreSelect(num)}
                          className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all transform hover:scale-110 font-bold text-lg ${
                            chambre === num
                              ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-400'
                          }`}
                          disabled={piece !== '' && parseInt(num) > parseInt(piece)}
                        >
                          {num === '6' ? '5+' : num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section principale */}
      <section className="bg-gray-50 py-12 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* En-tête avec tri */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {loading ? 'Chargement...' : `${total} résultat${total > 1 ? 's' : ''}`}
                </h2>
                {hasActiveFilters && (
                  <p className="text-sm text-gray-600 mt-1">Filtres actifs appliqués</p>
                )}
              </div>
              
              {total > 0 && (
                <Select value={trie} onValueChange={setTrie}>
                  <SelectTrigger className="w-full sm:w-64 h-12">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">💰 Prix croissant</SelectItem>
                    <SelectItem value="2">💰 Prix décroissant</SelectItem>
                    <SelectItem value="3">🕐 Plus récentes</SelectItem>
                    <SelectItem value="4">🕐 Plus anciennes</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Résultats */}
            {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                  <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
                  <p className="text-lg text-gray-600">Chargement des biens...</p>
                </div>
              </div>
            ) : biens.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Aucun bien trouvé
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Aucun bien ne correspond à vos critères de recherche
                </p>
              </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">Critères de recherche actuels :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Opération :</span>
                      <span className="text-gray-900">{type === 'louer' ? 'Location' : 'Achat'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Commune :</span>
                      <span className="text-gray-900">{commune ? communes.find(c => c.id.toString() === commune)?.nom : 'Toutes'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Quartier :</span>
                      <span className="text-gray-900">{quartier ? quartiers.find(q => q.id.toString() === quartier)?.nom : 'Tous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Budget :</span>
                      <span className="text-gray-900">{price ? budgetRanges[price] : 'Tous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Pièces :</span>
                      <span className="text-gray-900">{piece ? (piece === '6' ? '5+' : piece) : 'Toutes'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Chambres :</span>
                      <span className="text-gray-900">{chambre ? (chambre === '6' ? '5+' : chambre) : 'Toutes'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={resetFilters}
                    variant="outline"
                    className="px-8 py-6 text-lg"
                  >
                    Réinitialiser les filtres
                  </Button>
                  <Button className="px-8 py-6 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    🔔 Créer une alerte
                  </Button>
              </div>
            </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {biens.map((bien) => (
                    <Link 
                      key={bien.code}
                      href={`/biens/${bien.code}`}
                      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 block"
                    >
                      {/* Image avec overlay */}
                      <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                        {bien.image ? (
                          <>
                            <Image
                              src={getImageForBien(bien)}
                              alt={bien.nom}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/img/nofound.jpg';
                              }}
                            />
                            
                            {/* Navigation d'images si plusieurs photos */}
                            {getImagesCount(bien) > 1 && (
                              <>
                                <button
                                  onClick={(e) => prevImageOnCard(bien.code, getImagesCount(bien), e)}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
                                  title="Photo précédente"
                                >
                                  <ChevronLeft className="w-4 h-4 text-gray-800" />
                                </button>
                                <button
                                  onClick={(e) => nextImageOnCard(bien.code, getImagesCount(bien), e)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110"
                                  title="Photo suivante"
                                >
                                  <ChevronRight className="w-4 h-4 text-gray-800" />
                                </button>
                                
                                {/* Indicateurs de photos (points) */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                  {Array.from({ length: getImagesCount(bien) }).map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-2 h-2 rounded-full transition-all ${
                                        idx === (currentImageIndexes[bien.code] || 0)
                                          ? 'bg-white w-6'
                                          : 'bg-white/50'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge type */}
                        <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                          bien.type_annonce === 'louer' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                        }`}>
                          {bien.type_annonce === 'louer' ? '🏠 À louer' : '💰 À vendre'}
                        </div>

                        {/* Wishlist */}
                        <button 
                          onClick={(e) => e.preventDefault()}
                          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm hover:bg-white p-3 rounded-full transition-all hover:scale-110 shadow-lg z-20"
                        >
                          <Heart className="w-5 h-5 text-red-500" />
                        </button>

                        {/* Voir le bien (overlay) */}
                        <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-xl transform group-hover:scale-105 transition-all">
                            Voir les détails →
                          </span>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="p-6">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                              {bien.categorie?.nom || bien.nom}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{bien.commune?.nom}{bien.quartier?.nom ? `, ${bien.quartier.nom}` : ''}</span>
                          </div>
                          {bien.created_at && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(bien.created_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Prix */}
                        <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            {formatPrice(bien.prix_vente)} 
                            <span className="text-lg"> FCFA</span>
                          </div>
                          {bien.type_annonce === 'louer' && (
                            <p className="text-sm text-gray-600 mt-1">
                              {bien.code_categorie === 'residence-meublee' ? 'par jour' : 'par mois'}
                            </p>
                          )}
              </div>

                        {/* Caractéristiques */}
                        <div className="flex flex-wrap gap-3">
                          {bien.piece > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                              <Home className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-900">{bien.piece} pièce{bien.piece > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {bien.chambre > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                              <Bed className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-900">{bien.chambre} ch.</span>
                            </div>
                          )}
                          {bien.surface > 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                              <span className="text-sm font-semibold text-orange-900">{bien.surface} m²</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                ))}
              </div>

                {/* Pagination premium */}
                {total > 12 && (() => {
                  const totalPages = Math.ceil(total / 12);
                  const startItem = (page - 1) * 12 + 1;
                  const endItem = Math.min(page * 12, total);
                  
                  // Générer les numéros de page à afficher intelligemment
                  const getPageNumbers = () => {
                    const pages: (number | string)[] = [];
                    const maxVisible = 7;
                    
                    if (totalPages <= maxVisible) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1);
                    }
                    
                    pages.push(1);
                    
                    if (page > 3) {
                      pages.push('start-ellipsis');
                    }
                    
                    const start = Math.max(2, page - 1);
                    const end = Math.min(totalPages - 1, page + 1);
                    
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    
                    if (page < totalPages - 2) {
                      pages.push('end-ellipsis');
                    }
                    
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                    
                    return pages;
                  };
                  
                  return (
                    <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
                      {/* Info résultats */}
                      <div className="text-center mb-6">
                        <p className="text-gray-600 text-sm">
                          Affichage de <span className="font-bold text-gray-900">{startItem}</span> à{' '}
                          <span className="font-bold text-gray-900">{endItem}</span> sur{' '}
                          <span className="font-bold text-blue-600">{total}</span> résultat{total > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {/* Boutons de pagination */}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {/* Première page */}
                        <button
                          onClick={() => setPage(1)}
                    disabled={page === 1}
                          className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                            page === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                          }`}
                          title="Première page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <ChevronLeft className="w-4 h-4 -ml-3" />
                        </button>
                        
                        {/* Précédent */}
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                            page === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Précédent</span>
                        </button>
                        
                        {/* Numéros de page */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          {getPageNumbers().map((pageNum, index) => {
                            if (typeof pageNum === 'string') {
                              return (
                                <span key={pageNum} className="px-2 text-gray-400 font-bold text-lg">
                                  ⋯
                                </span>
                              );
                            }
                            
                            const isCurrentPage = page === pageNum;
                      return (
                              <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl font-bold transition-all ${
                                  isCurrentPage
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-2 ring-blue-200'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200 hover:border-blue-300'
                                }`}
                        >
                          {pageNum}
                              </button>
                      );
                    })}
                  </div>
                        
                        {/* Suivant */}
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                            page >= totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <span className="hidden sm:inline">Suivant</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        {/* Dernière page */}
                        <button
                          onClick={() => setPage(totalPages)}
                          disabled={page === totalPages}
                          className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                            page === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                          }`}
                          title="Dernière page"
                        >
                          <ChevronRight className="w-4 h-4" />
                          <ChevronRight className="w-4 h-4 -ml-3" />
                        </button>
                      </div>
                      
                      {/* Navigation rapide pour beaucoup de pages */}
                      {totalPages > 10 && (
                        <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
                          <span className="text-sm text-gray-600 font-medium">Aller à la page :</span>
                          <input
                            type="text"
                            placeholder={page.toString()}
                            value={pageInputValue}
                            onChange={(e) => setPageInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const newPage = parseInt(pageInputValue);
                                if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                                  setPage(newPage);
                                  setPageInputValue('');
                                }
                              }
                            }}
                            onBlur={() => {
                              if (pageInputValue) {
                                const newPage = parseInt(pageInputValue);
                                if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                                  setPage(newPage);
                                }
                              }
                              setPageInputValue('');
                            }}
                            className="w-20 px-3 py-2 border-2 border-gray-300 rounded-xl text-center font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                          <span className="text-sm text-gray-500">/ {totalPages}</span>
                          <button
                            onClick={() => {
                              const newPage = parseInt(pageInputValue);
                              if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
                                setPage(newPage);
                                setPageInputValue('');
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm"
                          >
                            OK
                          </button>
                </div>
              )}
                    </div>
                  );
                })()}
            </>
          )}
        </div>
      </div>
      </section>
    </MainLayout>
  );
}
