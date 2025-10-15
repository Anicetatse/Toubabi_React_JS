'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, Eye, Ban, CheckCircle } from 'lucide-react';

export default function AdminClientsPage() {
  const [search, setSearch] = useState('');

  // Mock data
  const clients = [
    {
      id: 1,
      name: 'Jean Kouassi',
      email: 'jean.kouassi@example.com',
      telephone: '+225 07 00 00 00 01',
      role: 'client',
      status: 'actif',
      created_at: '2024-01-15',
      annonces_count: 5,
    },
    {
      id: 2,
      name: 'Marie Diallo',
      email: 'marie.diallo@example.com',
      telephone: '+225 07 00 00 00 02',
      role: 'client',
      status: 'actif',
      created_at: '2024-02-10',
      annonces_count: 2,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des clients</h1>
          <p className="text-gray-600">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un client..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Nom</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Annonces</th>
                    <th className="pb-3 font-medium">Inscription</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map((client) => (
                    <tr key={client.id} className="text-sm">
                      <td className="py-3">#{client.id}</td>
                      <td className="py-3">
                        <div className="font-medium">{client.name}</div>
                        <Badge variant="outline" className="mt-1">
                          {client.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="h-3 w-3" />
                          {client.telephone}
                        </div>
                      </td>
                      <td className="py-3">
                        {client.status === 'actif' ? (
                          <Badge className="bg-green-100 text-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </td>
                      <td className="py-3 text-center font-semibold">
                        {client.annonces_count}
                      </td>
                      <td className="py-3 text-gray-600">
                        {new Date(client.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

