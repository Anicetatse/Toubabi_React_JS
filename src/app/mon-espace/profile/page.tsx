'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Loader2, Check } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  adresse: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Mot de passe actuel requis'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      updateUser(data);
      setProfileSuccess(true);
      setProfileError(null);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err: any) => {
      setProfileError(
        err.response?.data?.message ||
          'Une erreur est survenue lors de la mise à jour du profil'
      );
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err: any) => {
      setPasswordError(
        err.response?.data?.message ||
          'Une erreur est survenue lors de la mise à jour du mot de passe'
      );
    },
  });

  const onSubmitProfile = (data: ProfileForm) => {
    setProfileError(null);
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordForm) => {
    setPasswordError(null);
    updatePasswordMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">Mon profil</h1>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitProfile(onSubmitProfile)}
                  className="space-y-4"
                >
                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Profil mis à jour avec succès
                    </div>
                  )}
                  {profileError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {profileError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      {...registerProfile('name')}
                    />
                    {profileErrors.name && (
                      <p className="text-sm text-red-600">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerProfile('email')}
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-red-600">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      type="tel"
                      {...registerProfile('telephone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input
                      id="adresse"
                      {...registerProfile('adresse')}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Modifier le mot de passe */}
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitPassword(onSubmitPassword)}
                  className="space-y-4"
                >
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Mot de passe modifié avec succès
                    </div>
                  )}
                  {passwordError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="current_password">
                      Mot de passe actuel
                    </Label>
                    <Input
                      id="current_password"
                      type="password"
                      {...registerPassword('current_password')}
                    />
                    {passwordErrors.current_password && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.current_password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      {...registerPassword('password')}
                    />
                    {passwordErrors.password && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">
                      Confirmer le nouveau mot de passe
                    </Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      {...registerPassword('password_confirmation')}
                    />
                    {passwordErrors.password_confirmation && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.password_confirmation.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updatePasswordMutation.isPending}
                  >
                    {updatePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Modification...
                      </>
                    ) : (
                      'Modifier le mot de passe'
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

