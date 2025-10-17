'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { Mail, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

const forgotSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function MotDePassePerduPage() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const onSubmit = (data: ForgotForm) => {
    forgotMutation.mutate(data.email);
  };

  if (success) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
            <Check className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Email envoyé !</h2>
            <p className="mb-6 text-gray-600">
              Nous venons de vous envoyer un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <Button 
              asChild
              className="h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium"
            >
              <Link href="/login">Retour à la connexion</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex">
        {/* Section gauche - Formulaire */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
          <div className="w-full max-w-md space-y-8 py-12">
            {/* En-tête */}
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Mot de passe oublié
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Entrez votre email pour réinitialiser votre mot de passe
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/60"
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer les instructions'
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              <Link 
                href="/login" 
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>

        {/* Section droite - Image */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/assets/images/gallerie/93813c5260e345f4c76b09cfeef84c68.webp)' }}
          >
            {/* Overlay subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-800/30"></div>
          </div>
          
          {/* Texte par-dessus l'image */}
          <div className="relative z-10 flex flex-col justify-start p-16 text-white">
            <h1 className="text-4xl font-bold mb-3">
              Récupération de compte
            </h1>
            <p className="text-lg text-white/90">
              Nous vous aiderons à retrouver l'accès à votre compte
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

