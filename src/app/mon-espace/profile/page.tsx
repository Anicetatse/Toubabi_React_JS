'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Loader2, Check, User, Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/layout/Header';
// import { ClientMenu } from '@/components/ClientMenu';
import { ClientTopBar } from '@/components/ClientTopBar';
import toast from 'react-hot-toast';
import Image from 'next/image';

const profileSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  image: z.string().optional(),
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
    control,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      image: user?.image || '',
    },
  });

  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const imageValue = useWatch({ control, name: 'image' });

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLocalPreview(dataUrl);
      setValue('image', dataUrl, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

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
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto p-4 lg:p-6 space-y-6">
          <ClientTopBar />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Aperçu photo de profil */}
                <div className="mb-4 flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-blue-600 bg-blue-50">
                    { (localPreview || imageValue || user?.image) ? (
                      <Image src={(localPreview || imageValue || (user?.image as string)) as string} alt="Photo de profil" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-blue-600">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex flex-wrap items-center gap-3">
                      <label htmlFor="upload-avatar" className="cursor-pointer rounded-md border px-3 py-2 font-medium hover:bg-gray-50">
                        Importer une photo
                      </label>
                      <input id="upload-avatar" type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                     
                    </div>
                   
                  </div>
                </div>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        {...registerProfile('prenom')}
                      />
                      {profileErrors.prenom && (
                        <p className="text-sm text-red-600">
                          {profileErrors.prenom.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        {...registerProfile('nom')}
                      />
                      {profileErrors.nom && (
                        <p className="text-sm text-red-600">
                          {profileErrors.nom.message}
                        </p>
                      )}
                    </div>
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

            {/* Mot de passe */}
            <Card>
              <CardHeader>
                <CardTitle>Modifier le mot de passe</CardTitle>
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
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...registerPassword('current_password')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.current_password && (
                      <p className="text-sm text-red-600">
                        {passwordErrors.current_password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...registerPassword('password')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showPasswordConfirmation ? 'text' : 'password'}
                        {...registerPassword('password_confirmation')}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
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
    </>
  );
}

