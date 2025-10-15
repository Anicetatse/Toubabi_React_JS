'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminCommandesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Vraies données depuis la BDD
  const { data: commandesData, isLoading } = useQuery({
    queryKey: ['admin-commandes', statusFilter],
    queryFn: async () => {
      const response = await fetch('/api/commandes');
      const result = await response.json();
      return result.data || [];
    },
  });

  const commandes = commandesData || [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validee':
        return 'bg-green-100 text-green-600';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-600';
      case 'livree':
        return 'bg-blue-100 text-blue-600';
      case 'annulee':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des commandes</h1>
          <p className="text-gray-600">Gérez toutes les commandes de la plateforme</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher une commande..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validee">Validée</SelectItem>
                  <SelectItem value="livree">Livrée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">N° Commande</th>
                    <th className="pb-3 font-medium">Client</th>
                    <th className="pb-3 font-medium">Articles</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                      </td>
                    </tr>
                  ) : commandes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        Aucune commande trouvée
                      </td>
                    </tr>
                  ) : (
                    commandes.map((cmd: any) => (
                      <tr key={cmd.id} className="text-sm">
                        <td className="py-3 font-semibold">#{cmd.id}</td>
                        <td className="py-3">
                          <div>{cmd.user?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{cmd.user?.email || 'N/A'}</div>
                        </td>
                        <td className="py-3">{cmd.details?.length || 0}</td>
                        <td className="py-3 font-semibold text-blue-600">
                          {formatPrice(cmd.total)} FCFA
                        </td>
                        <td className="py-3">
                          <Badge className={getStatusColor(cmd.statut)}>
                            {cmd.statut}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {cmd.created_at ? new Date(cmd.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end">
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/admin/commandes/${cmd.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

