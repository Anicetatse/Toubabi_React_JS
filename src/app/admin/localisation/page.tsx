'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminLocalisationPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion de la localisation</h1>
            <p className="text-gray-600">
              Gérez les pays, villes, communes et quartiers
            </p>
          </div>
        </div>

        <Tabs defaultValue="quartiers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pays">Pays</TabsTrigger>
            <TabsTrigger value="villes">Villes</TabsTrigger>
            <TabsTrigger value="communes">Communes</TabsTrigger>
            <TabsTrigger value="quartiers">Quartiers</TabsTrigger>
          </TabsList>

          <TabsContent value="quartiers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des quartiers</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau quartier
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Gestion des quartiers avec prix non bâti et bâti
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des communes</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle commune
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Gestion des communes
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="villes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des villes</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle ville
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Gestion des villes
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pays">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des pays</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau pays
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  Gestion des pays
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

