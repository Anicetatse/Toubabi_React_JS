'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { BienCard } from '@/components/BienCard';
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
import { Card, CardContent } from '@/components/ui/card';
import { produitService, SearchFilters } from '@/services/produitService';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

export default function BiensPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['biens', page, filters],
    queryFn: () => produitService.getAll(page, filters),
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Biens disponibles
            </h1>
            <p className="text-gray-600">
              Découvrez notre sélection de biens immobiliers en Côte d'Ivoire
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un bien..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtres
              </Button>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label>Prix minimum</Label>
                      <Input
                        type="number"
                        placeholder="Prix min"
                        value={filters.prix_min || ''}
                        onChange={(e) =>
                          handleFilterChange('prix_min', Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Prix maximum</Label>
                      <Input
                        type="number"
                        placeholder="Prix max"
                        value={filters.prix_max || ''}
                        onChange={(e) =>
                          handleFilterChange('prix_max', Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Surface minimum (m²)</Label>
                      <Input
                        type="number"
                        placeholder="Surface min"
                        value={filters.surface_min || ''}
                        onChange={(e) =>
                          handleFilterChange('surface_min', Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Nombre de chambres</Label>
                      <Select
                        value={filters.nombre_chambres?.toString() || ''}
                        onValueChange={(value) =>
                          handleFilterChange('nombre_chambres', Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({});
                        setPage(1);
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Résultats */}
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-600">Chargement des biens...</p>
              </div>
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun bien trouvé
                </p>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {data?.total} bien{data && data.total > 1 ? 's' : ''} trouvé{data && data.total > 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    {Array.from({ length: Math.min(5, data.last_page) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
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
    </MainLayout>
  );
}

