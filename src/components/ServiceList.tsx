'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface ServiceItem {
  id: number;
  nom: string;
  description?: string;
  contact?: string;
  commune?: { nom: string };
}

interface ServiceListProps {
  title: string;
  services: ServiceItem[];
  isLoading?: boolean;
  onSearch: (query: string) => void;
  searchQuery?: string;
  total?: number;
}

export function ServiceList({
  title,
  services,
  isLoading,
  onSearch,
  searchQuery = '',
  total = 0,
}: ServiceListProps) {
  const [search, setSearch] = useState(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
        {title}
      </h1>

      <div className="mx-auto mb-8 max-w-2xl">
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Entrez une commune ou un nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </Button>
          </div>
        </form>

        {searchQuery && (
          <div className="mt-4 text-center">
            {total > 0 ? (
              <p className="text-red-600">
                Votre recherche : "{searchQuery}" a trouvé "{total}" résultat(s)
              </p>
            ) : (
              <p className="text-red-600">
                Aucun résultat trouvé pour "{searchQuery}"
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            {searchQuery
              ? `Aucun résultat trouvé pour "${searchQuery}"`
              : 'Aucun service disponible'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Commune
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {service.commune?.nom || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {service.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: service.description || 'N/A',
                        }}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {service.contact || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

