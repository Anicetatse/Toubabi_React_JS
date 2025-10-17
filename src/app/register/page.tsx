'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User as UserIcon, Phone, Briefcase, Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef } from 'react';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  nom: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(50),
  prenom: z.string().min(3, 'Le prénom doit contenir au moins 3 caractères').max(50),
  email: z.string().email('Email invalide').max(50),
  telephone: z.string().min(10, 'Le téléphone doit contenir au moins 10 chiffres').max(15),
  type_compte: z.enum(['client', 'agent_professionnel', 'agent_informel', 'agence'], {
    message: 'Veuillez sélectionner un type de compte'
  }),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  password_confirmation: z.string(),
  captcha: z.string().min(1, 'Veuillez valider le captcha'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      type_compte: 'client',
    },
  });

  const onCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
    setValue('captcha', value || '', { shouldValidate: true });
  };

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      // Ne pas connecter automatiquement - Compte en attente de validation
      toast.success('Inscription réussie ! Votre compte est en attente de validation par un administrateur. Vous recevrez un email dès qu\'il sera activé.', {
        icon: '⏳',
        duration: 10000,
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '2px solid #f59e0b',
          fontWeight: '600',
          fontSize: '14px',
        },
      });
      setTimeout(() => {
        router.push('/');
      }, 2000);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription';
      setError(message);
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
      // Réinitialiser le captcha en cas d'erreur
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    setError(null);
    registerMutation.mutate(data);
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
                Créer un compte
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Rejoignez Toubabi dès aujourd'hui
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
                  <Label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="nom"
                      type="text"
                      placeholder="Dupont"
                      className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      {...register('nom')}
                    />
                  </div>
                  {errors.nom && (
                    <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors.nom.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="prenom"
                      type="text"
                      placeholder="Jean"
                      className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      {...register('prenom')}
                    />
                  </div>
                  {errors.prenom && (
                    <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors.prenom.message}
                    </p>
                  )}
                </div>

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

                <div>
                  <Label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="+225 07 00 00 00 00"
                      className="pl-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      {...register('telephone')}
                    />
                  </div>
                  {errors.telephone && (
                    <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type_compte" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de compte
                  </Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10" />
                    <select
                      id="type_compte"
                      className="w-full pl-11 h-12 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 transition-all appearance-none bg-white"
                      {...register('type_compte')}
                    >
                      <option value="client">Pour un particulier</option>
                      <option value="agent_professionnel">Pour un agent immobilier (individuel)</option>
                      <option value="agent_informel">Pour un agent informel</option>
                      <option value="agence">Pour une agence immobilière (société)</option>
                    </select>
                  </div>
                  {errors.type_compte && (
                    <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors.type_compte.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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

                <div>
                  <Label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirmation ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                      {...register('password_confirmation')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="mt-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-600">
                En vous inscrivant, vous acceptez nos{' '}
                <Link href="/conditions" className="text-blue-600 hover:underline">
                  Conditions d'utilisation
                </Link>{' '}
                et notre{' '}
                <Link href="/confidentialite" className="text-blue-600 hover:underline">
                  Politique de confidentialité
                </Link>
                .
              </div>

              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <div>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={onCaptchaChange}
                  />
                  {errors.captcha && (
                    <p className="mt-2 text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-1">
                      {errors.captcha.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/60"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    'S\'inscrire'
                  )}
                </Button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Déjà un compte ?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Section droite - Image */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/assets/img/banner-1.jpg)' }}
          >
            {/* Overlay subtil */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-800/30"></div>
          </div>
          
          {/* Texte par-dessus l'image */}
          <div className="relative z-10 flex flex-col justify-start p-16 text-white">
            <h1 className="text-4xl font-bold mb-3">
              Rejoignez Toubabi
            </h1>
            <p className="text-lg text-white/90">
              Accédez à des milliers de biens immobiliers
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

