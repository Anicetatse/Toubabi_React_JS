'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { Mail, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

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
      <MainLayout>
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <Check className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-4 text-2xl font-bold">Email envoyé !</h2>
              <p className="mb-6 text-gray-600">
                Nous venons de vous envoyer un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
              <Button asChild>
                <Link href="/login">Retour à la connexion</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre email pour recevoir les instructions de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={forgotMutation.isPending}
              >
                {forgotMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer les instructions'
                )}
              </Button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

