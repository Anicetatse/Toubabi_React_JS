'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminCrudTableProps {
  title: string;
  data: any[];
  columns: Column[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  createLink?: string;
  searchPlaceholder?: string;
}

export function AdminCrudTable({
  title,
  data,
  columns,
  isLoading,
  onSearch,
  onDelete,
  onEdit,
  createLink,
  searchPlaceholder = 'Rechercher...',
}: AdminCrudTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        {createLink && (
          <Button asChild>
            <Link href={createLink}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        {onSearch && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="pl-10"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center text-gray-400">
            Aucun élément trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-600">
                  {columns.map((col) => (
                    <th key={col.key} className="pb-3 font-medium">
                      {col.label}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="pb-3 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((row) => (
                  <tr key={row.id} className="text-sm">
                    {columns.map((col) => (
                      <td key={col.key} className="py-3">
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key] || 'N/A'}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(row.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (confirm('Confirmer la suppression ?')) {
                                  onDelete(row.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
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

