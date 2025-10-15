'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Loader2, Check } from 'lucide-react';

const contactSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  sujet: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  // Mock mutation - À remplacer par un vrai appel API
  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      // Simuler un délai
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Contact data:', data);
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    },
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Contactez-nous
            </h1>
            <p className="text-gray-600">
              Une question ? N'hésitez pas à nous contacter
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Informations de contact */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nos coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-sm text-gray-600">
                        Abidjan, Côte d'Ivoire
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <a
                        href="tel:+2250585325050"
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        +225 05 85 32 50 50
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:contact@toubabi.com"
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        contact@toubabi.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Horaires d'ouverture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lundi - Vendredi</span>
                    <span className="font-medium">8h - 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Samedi</span>
                    <span className="font-medium">9h - 13h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimanche</span>
                    <span className="font-medium">Fermé</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Envoyez-nous un message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {success && (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 p-4 text-green-600">
                      <Check className="h-5 w-5" />
                      <span>
                        Votre message a été envoyé avec succès ! Nous vous
                        répondrons dans les plus brefs délais.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom complet *</Label>
                      <Input
                        id="nom"
                        placeholder="Jean Dupont"
                        {...register('nom')}
                      />
                      {errors.nom && (
                        <p className="text-sm text-red-600">{errors.nom.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@example.com"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder="+225 07 00 00 00 00"
                        {...register('telephone')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sujet">Sujet *</Label>
                      <Input
                        id="sujet"
                        placeholder="Demande d'information"
                        {...register('sujet')}
                      />
                      {errors.sujet && (
                        <p className="text-sm text-red-600">
                          {errors.sujet.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Écrivez votre message ici..."
                      rows={6}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le message'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

