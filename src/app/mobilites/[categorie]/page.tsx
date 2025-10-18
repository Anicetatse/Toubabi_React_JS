'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Phone, 
  ArrowLeft,
  Building2,
  Cross,
  Briefcase,
  ShoppingBag,
  GraduationCap,
  Fuel,
  Factory,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { locationService } from '@/services/locationService';

const categoriesConfig: Record<string, any> = {
  hoteliers: {
    titre: 'Hôtels',
    icon: Building2,
    headerBg: 'bg-gradient-to-r from-red-600 to-orange-600',
    iconBg: 'bg-gradient-to-br from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    endpoint: 'hoteliers'
  },
  pharmacies: {
    titre: 'Pharmacies de Garde',
    icon: Cross,
    headerBg: 'bg-gradient-to-r from-green-600 to-emerald-600',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    endpoint: 'pharmacies'
  },
  banques: {
    titre: 'Banques',
    icon: Landmark,
    headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    endpoint: 'banques'
  },
  commerces: {
    titre: 'Commerces',
    icon: ShoppingBag,
    headerBg: 'bg-gradient-to-r from-purple-600 to-pink-600',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    endpoint: 'commerces'
  },
  enseignements: {
    titre: 'Établissements d\'Enseignement',
    icon: GraduationCap,
    headerBg: 'bg-gradient-to-r from-yellow-600 to-amber-600',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    endpoint: 'enseignements'
  },
  hospitaliers: {
    titre: 'Centres Hospitaliers',
    icon: Cross,
    headerBg: 'bg-gradient-to-r from-teal-600 to-cyan-600',
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    endpoint: 'hospitaliers'
  },
  'services-publics': {
    titre: 'Services Publics',
    icon: Briefcase,
    headerBg: 'bg-gradient-to-r from-indigo-600 to-blue-600',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    endpoint: 'services-publics'
  },
  stations: {
    titre: 'Stations Service',
    icon: Fuel,
    headerBg: 'bg-gradient-to-r from-orange-600 to-red-600',
    iconBg: 'bg-gradient-to-br from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    endpoint: 'stations'
  },
  industries: {
    titre: 'Industries',
    icon: Factory,
    headerBg: 'bg-gradient-to-r from-gray-600 to-slate-600',
    iconBg: 'bg-gradient-to-br from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50',
    iconColor: 'text-gray-600',
    endpoint: 'industries'
  }
};

interface PageProps {
  params: Promise<{ categorie: string }>;
}

// Composant pour afficher la description avec bouton "Lire plus"
function DescriptionCard({ description, itemId }: { description: string; itemId: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (descRef.current) {
      const element = descRef.current;
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [description]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div 
        ref={descRef}
        className={`text-sm text-gray-600 prose prose-sm max-w-none ${!isExpanded ? 'line-clamp-3' : ''}`}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {isTruncated && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 transition-colors"
        >
          {isExpanded ? 'Lire moins' : 'Lire plus →'}
        </button>
      )}
    </div>
  );
}

export default function CategorieMobilitePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const categorie = resolvedParams.categorie;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [deGardeFilter, setDeGardeFilter] = useState<string>(categorie === 'pharmacies' ? 'true' : ''); // Par défaut: pharmacies de garde uniquement

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const config = categoriesConfig[categorie];

  if (!config) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Catégorie non trouvée</h1>
          <Link href="/mobilites">
            <Button>Retour aux mobilités</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const Icon = config.icon;

  // Récupérer les communes
  const { data: communes = [] } = useQuery({
    queryKey: ['communes'],
    queryFn: () => locationService.getCommunes(),
  });

  // Récupérer les établissements
  const { data: response, isLoading } = useQuery({
    queryKey: ['mobilites', categorie, currentPage, searchTerm, selectedCommune, deGardeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCommune) params.append('commune', selectedCommune);
      if (categorie === 'pharmacies' && deGardeFilter) {
        params.append('deGarde', deGardeFilter);
      }

      const res = await fetch(`/api/mobilites/${config.endpoint}?${params}`);
      return res.json();
    },
  });

  const etablissements = response?.data || [];
  const pagination = response?.pagination || { current_page: 1, last_page: 1, total: 0 };
  
  // Compter les pharmacies de garde
  const pharmaciesDeGarde = categorie === 'pharmacies' 
    ? etablissements.filter((p: any) => p.active === 1).length 
    : 0;

  // Compter les images pour les hôteliers
  const countImages = (item: any) => {
    if (categorie !== 'hoteliers') return 0;
    return [item.images1, item.images2, item.images3, item.images4, item.images5,
            item.images6, item.images7, item.images8, item.images9, item.images10]
      .filter(img => img && img.trim() !== '' && img.trim() !== 'null').length;
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className={`${config.headerBg} text-white py-16`}>
          <div className="container mx-auto px-4">
            <Link 
              href="/mobilites"
              className="inline-flex items-center text-white hover:text-white/90 mb-6 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux mobilités
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Icon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{config.titre}</h1>
                <p className="text-white/95 mt-2 text-lg">
                  {pagination.total} établissement{pagination.total > 1 ? 's' : ''} disponible{pagination.total > 1 ? 's' : ''}
                  {categorie === 'pharmacies' && deGardeFilter === '' && pharmaciesDeGarde > 0 && (
                    <span className="ml-2 text-white/90">
                      • {pharmaciesDeGarde} de garde
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom ou description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 h-12"
                />
                {searchInput !== searchTerm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Filtre par commune */}
              <div className="md:w-64">
                <SearchableSelect
                  options={[
                    { value: '', label: 'Toutes les communes' },
                    ...communes.map((commune: any) => ({ 
                      value: commune.id.toString(), 
                      label: commune.nom 
                    }))
                  ]}
                  value={selectedCommune}
                  onValueChange={(value) => {
                    setSelectedCommune(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filtrer par commune"
                  searchPlaceholder="Rechercher une commune..."
                />
              </div>

              {/* Filtre de garde (seulement pour pharmacies) */}
              {categorie === 'pharmacies' && (
                <div className="md:w-64">
                  <select
                    value={deGardeFilter}
                    onChange={(e) => {
                      setDeGardeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Toutes les pharmacies</option>
                    <option value="true">De garde uniquement</option>
                    <option value="false">Non de garde</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Liste des établissements */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : etablissements.length === 0 ? (
            <div className="text-center py-16">
              <div className={`inline-flex p-6 rounded-full ${config.bgColor} mb-4`}>
                <Icon className={`h-12 w-12 ${config.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun résultat
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {etablissements.map((item: any) => (
                  <div key={item.id}>
                    {categorie === 'hoteliers' ? (
                      <Link href={`/mobilites/hoteliers/${item.id}`}>
                        <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full cursor-pointer">
                          <div className="p-6">
                            {/* En-tête */}
                            <div className="flex items-start gap-3 mb-4">
                              <div className={`p-3 rounded-xl ${config.iconBg} flex-shrink-0`}>
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                  {item.nom}
                                </h3>
                              </div>
                            </div>

                            {/* Informations */}
                            <div className="space-y-2">
                              {/* Commune */}
                              {item.commune && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                                  <span className="truncate">{item.commune.nom}</span>
                                </div>
                              )}

                              {/* Contact */}
                              {item.contact && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                                  <span className="truncate">{item.contact}</span>
                                </div>
                              )}

                              {/* Médias */}
                              <div className="flex items-center gap-2 pt-2">
                                {countImages(item) > 0 && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                    {countImages(item)}
                                  </Badge>
                                )}
                                {item.videos && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    <Video className="h-3 w-3 mr-1" />
                                    Vidéo
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            {item.description && (
                              <DescriptionCard description={item.description} itemId={item.id} />
                            )}
                          </div>
                        </Card>
                      </Link>
                    ) : (
                      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                        <div className="p-6">
                          {/* En-tête */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`p-3 rounded-xl ${config.iconBg} flex-shrink-0`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                {item.nom}
                              </h3>
                            </div>
                          </div>

                          {/* Informations */}
                          <div className="space-y-2">
                            {/* Commune */}
                            {item.commune && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                                <span className="truncate">{item.commune.nom}</span>
                              </div>
                            )}

                            {/* Contact */}
                            {item.contact && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                                <span className="truncate">{item.contact}</span>
                              </div>
                            )}

                            {/* Badge De garde pour pharmacies */}
                            {categorie === 'pharmacies' && (
                              <div className="pt-2">
                                <Badge 
                                  variant="outline" 
                                  className={item.active === 1 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }
                                >
                                  {item.active === 1 ? '🟢 De garde' : 'Pas de garde'}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {item.description && (
                            <DescriptionCard description={item.description} itemId={item.id} />
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>

                  <div className="flex items-center gap-2">
                    {[...Array(pagination.last_page)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.last_page ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10 h-10 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                    disabled={currentPage === pagination.last_page}
                    className="gap-2"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

