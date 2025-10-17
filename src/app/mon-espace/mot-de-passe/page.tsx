'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { Loader2, Check, Eye, EyeOff, Lock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
// import { ClientMenu } from '@/components/ClientMenu';
import { ClientTopBar } from '@/components/ClientTopBar';
import toast from 'react-hot-toast';

const passwordSchema = z
  .object({
    motdepasse: z.string().min(1, 'Ancien mot de passe requis'),
    nouveau_motdepasse: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmer_nouveau_motdepasse: z.string(),
  })
  .refine((data) => data.nouveau_motdepasse === data.confirmer_nouveau_motdepasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmer_nouveau_motdepasse'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function MotDePassePage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      return authService.updatePassword({
        current_password: data.motdepasse,
        password: data.nouveau_motdepasse,
        password_confirmation: data.confirmer_nouveau_motdepasse,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(
        err.response?.data?.message ||
          'Une erreur est survenue lors de la modification du mot de passe'
      );
    },
  });

  const onSubmit = (data: PasswordForm) => {
    setError(null);
    updatePasswordMutation.mutate(data);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          <ClientTopBar />

          <Card>
            <CardHeader>
              <h4 className="text-xl font-bold">Mise à jour mot de passe</h4>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {success && (
                  <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-600">
                    <Check className="h-5 w-5" />
                    Mot de passe modifié avec succès
                  </div>
                )}
                
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="motdepasse">Ancien mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="motdepasse"
                        type={showCurrentPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        {...register('motdepasse')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.motdepasse && (
                      <p className="text-sm text-red-600">
                        {errors.motdepasse.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nouveau_motdepasse">
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="nouveau_motdepasse"
                        type={showNewPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        {...register('nouveau_motdepasse')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.nouveau_motdepasse && (
                      <p className="text-sm text-red-600">
                        {errors.nouveau_motdepasse.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmer_nouveau_motdepasse">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmer_nouveau_motdepasse"
                        type={showConfirmPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        {...register('confirmer_nouveau_motdepasse')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmer_nouveau_motdepasse && (
                      <p className="text-sm text-red-600">
                        {errors.confirmer_nouveau_motdepasse.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                  >
                    {updatePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      'Modifier'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

