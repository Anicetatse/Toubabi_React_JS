'use client';

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Loader2, Check, Send, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          captchaToken
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      reset();
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
      toast.success('Message envoyé avec succès !');
      setTimeout(() => setSuccess(false), 5000);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'envoi');
    }
  });

  const onSubmit = (data: ContactForm) => {
    if (!captchaToken) {
      toast.error('Veuillez valider le captcha');
      return;
    }
    contactMutation.mutate(data);
  };

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-blue-50 via-white to-gray-50 min-h-screen">
        {/* En-tête avec background moderne */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 mb-8">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                <MessageSquare className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Contactez-nous
              </h1>
              <p className="text-xl text-white/95 leading-relaxed">
                Une question ? Une demande ? Notre équipe est là pour vous répondre
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 -mt-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {/* Informations de contact */}
            <div className="space-y-6 lg:col-span-1">
              {/* Coordonnées */}
              <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Nos coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Adresse</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Abidjan, Côte d'Ivoire
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Téléphone</p>
                      <a
                        href="tel:+2250585325050"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 block"
                      >
                        +225 05 85 32 50 50
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Email</p>
                      <a
                        href="mailto:contact@toubabi.com"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 block"
                      >
                        contact@toubabi.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Horaires */}
              <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Horaires d'ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Lundi - Vendredi</span>
                      <span className="font-bold text-blue-600">8h - 18h</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Samedi</span>
                      <span className="font-bold text-blue-600">9h - 13h</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Dimanche</span>
                      <span className="font-bold text-red-600">Fermé</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <Card className="lg:col-span-2 border-2 border-blue-100 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  Envoyez-nous un message
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {success && (
                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-2 border-green-200 shadow-sm">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">Message envoyé avec succès !</p>
                        <p className="text-sm text-green-700 mt-1">
                          Nous vous répondrons dans les plus brefs délais.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                        Nom complet *
                      </Label>
                      <Input
                        id="nom"
                        placeholder="Jean Dupont"
                        className="h-12 border-2 focus:border-blue-500"
                        {...register('nom')}
                      />
                      {errors.nom && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> {errors.nom.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@example.com"
                        className="h-12 border-2 focus:border-blue-500"
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-sm font-semibold text-gray-700">
                        Téléphone
                      </Label>
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder="+225 07 00 00 00 00"
                        className="h-12 border-2 focus:border-blue-500"
                        {...register('telephone')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sujet" className="text-sm font-semibold text-gray-700">
                        Sujet *
                      </Label>
                      <Input
                        id="sujet"
                        placeholder="Demande d'information"
                        className="h-12 border-2 focus:border-blue-500"
                        {...register('sujet')}
                      />
                      {errors.sujet && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> {errors.sujet.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Écrivez votre message ici..."
                      rows={8}
                      className="border-2 focus:border-blue-500 resize-none"
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Captcha */}
                  <div className="flex justify-center py-4">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                      onChange={onCaptchaChange}
                      theme="light"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={contactMutation.isPending || !captchaToken}
                  >
                    {contactMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Envoyer le message
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    En soumettant ce formulaire, vous acceptez notre politique de confidentialité
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

