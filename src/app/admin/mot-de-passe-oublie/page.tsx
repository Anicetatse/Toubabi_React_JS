'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, KeyRound, ArrowLeft, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function AdminForgotPasswordPage() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await axios.post('/api/admin/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success('Email de récupération envoyé !', {
        duration: 5000,
        style: {
          background: '#dcfce7',
          color: '#15803d',
          border: '2px solid #22c55e',
          fontWeight: '600',
        },
      });
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email';
      toast.error(message, {
        duration: 5000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          border: '2px solid #ef4444',
          fontWeight: '600',
        },
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Lien retour */}
          <Link 
            href="/admin/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Link>

          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Mot de passe oublié
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {success ? (
            /* Message de succès */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">
                      Email envoyé avec succès !
                    </h3>
                    <p className="text-sm text-green-800 leading-relaxed">
                      Un email contenant les instructions pour réinitialiser votre mot de passe 
                      a été envoyé à l'adresse indiquée. Vérifiez votre boîte de réception et 
                      vos spams.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/admin/login">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Shield className="mr-2 h-5 w-5" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            /* Formulaire */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Administrateur
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@toubabi.com"
                    className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/60"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-5 w-5" />
                    Envoyer le lien de réinitialisation
                  </>
                )}
              </Button>

              {/* Informations supplémentaires */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Note importante :</p>
                    <p>
                      Le lien de réinitialisation sera valide pendant 1 heure. 
                      Si vous ne recevez pas l'email, vérifiez vos spams ou contactez 
                      le super administrateur.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Accès réservé aux administrateurs de la plateforme Toubabi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

