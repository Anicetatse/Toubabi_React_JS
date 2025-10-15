'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { BienCard } from '@/components/BienCard';
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
import { produitService, SearchFilters } from '@/services/produitService';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';

export default function RecherchePage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['search-biens', page, filters],
    queryFn: () => produitService.getAll(page, filters),
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Recherche avancée
            </h1>
            <p className="text-gray-600">
              Trouvez le bien immobilier qui correspond à vos critères
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Filtres */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5" />
                    Filtres de recherche
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Recherche par mot-clé</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Titre, description..."
                        className="pl-10"
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Type de bien</Label>
                    <Select
                      value={filters.type_annonce_id?.toString() || ''}
                      onValueChange={(value) =>
                        handleFilterChange('type_annonce_id', Number(value) || undefined)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous</SelectItem>
                        <SelectItem value="1">Vente</SelectItem>
                        <SelectItem value="2">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Prix minimum (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.prix_min || ''}
                      onChange={(e) =>
                        handleFilterChange('prix_min', Number(e.target.value) || undefined)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prix maximum (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="Illimité"
                      value={filters.prix_max || ''}
                      onChange={(e) =>
                        handleFilterChange('prix_max', Number(e.target.value) || undefined)
                      }
                    />
                  </div>

                  {showAdvanced && (
                    <>
                      <div className="space-y-2">
                        <Label>Surface minimum (m²)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.surface_min || ''}
                          onChange={(e) =>
                            handleFilterChange('surface_min', Number(e.target.value) || undefined)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Nombre de chambres minimum</Label>
                        <Select
                          value={filters.nombre_chambres?.toString() || ''}
                          onValueChange={(value) =>
                            handleFilterChange('nombre_chambres', Number(value) || undefined)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Indifférent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Indifférent</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? 'Moins de filtres' : 'Plus de filtres'}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resetFilters}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résultats */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-600">Recherche en cours...</p>
                  </div>
                </div>
              ) : data?.data.length === 0 ? (
                <Card>
                  <CardContent className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                      <p className="mb-2 text-lg font-semibold text-gray-900">
                        Aucun résultat trouvé
                      </p>
                      <p className="text-gray-600">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    {data?.total} résultat{data && data.total > 1 ? 's' : ''} trouvé
                    {data && data.total > 1 ? 's' : ''}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {data?.data.map((bien) => (
                      <BienCard key={bien.id} bien={bien} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {data && data.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Précédent
                      </Button>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Page {page} sur {data.last_page}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPage((p) => Math.min(data.last_page, p + 1))
                        }
                        disabled={page === data.last_page}
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

