'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save } from 'lucide-react';

export default function AdminParametresPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Configuration générale de la plateforme</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input defaultValue="Toubabi" />
              </div>
              <div className="space-y-2">
                <Label>Email de contact</Label>
                <Input defaultValue="contact@toubabi.com" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input defaultValue="+225 05 85 32 50 50" />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Textarea defaultValue="Abidjan, Côte d'Ivoire" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mapbox Token</Label>
                <Input type="password" defaultValue="pk.***" />
              </div>
              <div className="space-y-2">
                <Label>PayPal Client ID</Label>
                <Input type="password" defaultValue="ASiW***" />
              </div>
              <div className="space-y-2">
                <Label>reCAPTCHA Site Key</Label>
                <Input type="password" defaultValue="6Ld_***" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hôte SMTP</Label>
                <Input defaultValue="virtus225one@gmail.com" />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input defaultValue="465" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input defaultValue="toubabi" />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Vider le cache
              </Button>
              <Button variant="outline" className="w-full">
                Exporter les données
              </Button>
              <Button variant="outline" className="w-full text-red-600">
                Mode maintenance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

