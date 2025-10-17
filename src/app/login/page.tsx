'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email ou téléphone requis'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const redirectUrl = searchParams.get('redirect') || '/mon-espace/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success(`Bienvenue ${data.user.prenom} ! Connexion réussie.`, {
        duration: 3000,
        style: {
          background: '#dcfce7',
          color: '#15803d',
          border: '2px solid #22c55e',
          fontWeight: '600',
        },
      });
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Une erreur est survenue lors de la connexion';
      const status = err.response?.status;
      
      setError(message);
      
      // Notification rouge pour les erreurs
      toast.error(message, {
        icon: '❌',
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

  const onSubmit = (data: LoginForm) => {
    setError(null);
    loginMutation.mutate(data);
  };

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
              Bon retour !
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <Label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email ou Téléphone
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="exemple@email.com ou 0707070707"
                    className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    {...register('identifier')}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                    {errors.identifier.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </Label>
                  <Link
                    href="/mot-de-passe-perdu"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/60"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Pas encore de compte ?{' '}
            <Link 
              href="/register" 
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Inscrivez-vous gratuitement
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
            Bienvenue sur Toubabi
          </h1>
          <p className="text-lg text-white/90">
            Votre plateforme immobilière de confiance
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

