'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { produitService } from '@/services/produitService';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Eye, Loader2, Package, CheckCircle, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ClientMenu } from '@/components/ClientMenu';
import { ClientTopBar } from '@/components/ClientTopBar';

export default function MesAnnoncesPage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'approved' | 'pending'>('all');

  const { data: response, isLoading } = useQuery({
    queryKey: ['my-annonces', currentPage, statusFilter],
    queryFn: async () => {
      // Appeler l'API directement avec le paramètre de page et filtre
      const res = await fetch(`/api/client/annonces?page=${currentPage}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await res.json();
      return data.success ? data.data : { data: [], total: 0, last_page: 1 };
    },
  });

  const annonces = response?.data || [];
  const totalAnnonces = response?.total || 0;
  const totalPages = response?.last_page || 1;

  // Debug: vérifier le format des codes
  React.useEffect(() => {
    if (annonces.length > 0) {
      console.log('Premier code d\'annonce:', annonces[0]?.code);
    }
  }, [annonces]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-6">
          <ClientTopBar />
        </div>
        <div className="container mx-auto p-4 lg:p-6">
          {/* Contenu principal pleine largeur */}
          <div className="flex-1">
            {/* En-tête */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mes annonces</h1>
                  {!isLoading && totalAnnonces > 0 && (
                    <Badge variant="secondary" className="text-xs sm:text-base px-2 sm:px-3 py-0.5 sm:py-1">
                      {totalAnnonces} annonce{totalAnnonces > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Gérez toutes vos annonces immobilières
                </p>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base">
                <Link href="/deposer-annonce">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle annonce
                </Link>
              </Button>
            </div>

            {/* Filtres par statut */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 sm:mr-2">Filtrer par statut :</span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 ${statusFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  Toutes ({totalAnnonces})
                </Button>
                <Button
                  variant={statusFilter === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('approved');
                    setCurrentPage(1);
                  }}
                  className={`text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 ${statusFilter === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                >
                  <CheckCircle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Approuvées
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatusFilter('pending');
                    setCurrentPage(1);
                  }}
                  className={`text-xs sm:text-sm py-1.5 sm:py-2 px-2.5 sm:px-3 ${statusFilter === 'pending' ? 'bg-orange-600 hover:bg-orange-700' : 'border-orange-600 text-orange-600 hover:bg-orange-50'}`}
                >
                  <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  En attente
                </Button>
              </div>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="flex min-h-[400px] items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                </CardContent>
              </Card>
            ) : annonces.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-8">
                    <Package className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">
                    Aucune annonce
                  </h3>
                  <p className="mb-10 text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                    Vous n'avez pas encore publié d'annonce. Déposez votre première annonce dès maintenant !
                  </p>
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-base">
                    <Link href="/deposer-annonce">
                      <Plus className="mr-2 h-5 w-5" />
                      Déposer ma première annonce
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {annonces.map((annonce: any) => (
                  <Card key={annonce.code} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 sm:p-6">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        {/* Image */}
                        <div className="relative h-40 sm:h-32 w-full sm:w-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                          {annonce.image ? (
                            <Image
                              src={annonce.image.startsWith('/') ? annonce.image : `/${annonce.image}`}
                              alt={annonce.nom || ''}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-0">
                          <div>
                            <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                              <div className="flex-1 min-w-0">
                                {/* Titre avec catégorie */}
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 truncate">
                                  {annonce.categorie?.nom || annonce.code_categorie || 'Bien immobilier'}
                                </h4>
                                
                                {/* Prix en évidence */}
                                <div className="mb-2 sm:mb-3">
                                  <span className="text-lg sm:text-2xl font-bold text-blue-600">
                                    {annonce.prix_vente ? formatPrice(annonce.prix_vente) : 'Prix non défini'}
                                  </span>
                                </div>

                                {/* Autres informations */}
                                <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                                  {annonce.surface > 0 && (
                                    <div>Surface: <strong>{annonce.surface} m²</strong></div>
                                  )}
                                  {(annonce.piece > 0 || annonce.chambre > 0) && (
                                    <div>
                                      {annonce.piece > 0 && <span>{annonce.piece} pièce{annonce.piece > 1 ? 's' : ''}</span>}
                                      {annonce.piece > 0 && annonce.chambre > 0 && <span> • </span>}
                                      {annonce.chambre > 0 && <span>{annonce.chambre} chambre{annonce.chambre > 1 ? 's' : ''}</span>}
                                    </div>
                                  )}
                                  {(annonce.commune?.nom || annonce.quartier?.nom) && (
                                    <div className="truncate">
                                      📍 {annonce.commune?.nom || 'Localisation'}
                                      {annonce.quartier?.nom && ` - ${annonce.quartier.nom}`}
                                    </div>
                                  )}
                                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">
                                    Soumis le {annonce.created_at ? new Date(annonce.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                  </div>
                                </div>
                              </div>

                              {/* Badge statut */}
                              <div className="flex-shrink-0">
                                {annonce.enabled === 1 ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">
                                    <CheckCircle className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    Approuvée
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 whitespace-nowrap">
                                    <Clock className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    En attente
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                            <Button size="sm" variant="outline" asChild className="text-xs sm:text-sm py-1.5 sm:py-2 w-full sm:w-auto">
                              <Link href={`/mon-espace/annonces/${annonce.code || annonce.id}/preview`} target="_blank">
                                <Eye className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Voir détail
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm py-1.5 sm:py-2 w-full sm:w-auto" asChild>
                              <Link href={`/mon-espace/annonces/${annonce.code || annonce.id}`}>
                                <Edit className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                Modifier
                              </Link>
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="outline"
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                              title="Booster cette annonce"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Booster
                            </Button> */}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination premium */}
                {totalPages > 1 && (() => {
                  const startItem = (currentPage - 1) * 10 + 1;
                  const endItem = Math.min(currentPage * 10, totalAnnonces);
                  
                  // Générer les numéros de page à afficher intelligemment
                  const getPageNumbers = () => {
                    const pages: (number | string)[] = [];
                    const maxVisible = 7;
                    
                    if (totalPages <= maxVisible) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1);
                    }
                    
                    pages.push(1);
                    
                    if (currentPage > 3) {
                      pages.push('start-ellipsis');
                    }
                    
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }
                    
                    if (currentPage < totalPages - 2) {
                      pages.push('end-ellipsis');
                    }
                    
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                    
                    return pages;
                  };

                  return (
                    <Card className="mt-6 sm:mt-8">
                      <CardContent className="p-3 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                          {/* Indicateur de résultats */}
                          <div className="text-xs sm:text-sm text-gray-600">
                            Affichage de <span className="font-semibold text-gray-900">{startItem}</span> à{' '}
                            <span className="font-semibold text-gray-900">{endItem}</span> sur{' '}
                            <span className="font-semibold text-gray-900">{totalAnnonces}</span> annonce{totalAnnonces > 1 ? 's' : ''}
                          </div>
                          
                          {/* Boutons de pagination */}
                          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                            {/* Première page */}
                            <button
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-semibold transition-all ${
                                currentPage === 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                              }`}
                              title="Première page"
                            >
                              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 -ml-2.5 sm:-ml-3" />
                            </button>
                            
                            {/* Précédent */}
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                currentPage === 1
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                              }`}
                            >
                              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Précédent</span>
                            </button>
                            
                            {/* Numéros de page */}
                            <div className="flex items-center gap-1 sm:gap-2">
                              {getPageNumbers().map((pageNum, index) => {
                                if (typeof pageNum === 'string') {
                                  return (
                                    <span key={pageNum} className="px-1 sm:px-2 text-gray-400 font-bold text-sm sm:text-lg">
                                      ⋯
                                    </span>
                                  );
                                }
                                
                                const isCurrentPage = currentPage === pageNum;
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all ${
                                      isCurrentPage
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105 sm:scale-110 ring-2 ring-blue-200'
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
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage >= totalPages}
                              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                currentPage >= totalPages
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                              }`}
                            >
                              <span className="hidden sm:inline">Suivant</span>
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            
                            {/* Dernière page */}
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-sm font-semibold transition-all ${
                                currentPage === totalPages
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                              }`}
                              title="Dernière page"
                            >
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 -ml-2.5 sm:-ml-3" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
