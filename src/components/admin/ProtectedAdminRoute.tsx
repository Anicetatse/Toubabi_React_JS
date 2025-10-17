'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Si pas authentifié, rediriger vers login
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin/dashboard&error=auth_required');
        return;
      }

      // Vérifier si l'utilisateur a les droits admin
      // Vous pouvez ajuster cette condition selon votre logique métier
      const isAdmin = user && (user.type_compte === 'admin' || user.email?.includes('admin'));
      
      if (!isAdmin) {
        router.push('/?error=access_denied');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié ou pas admin, ne rien afficher (redirection en cours)
  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdmin = user.type_compte === 'admin' || user.email?.includes('admin');
  if (!isAdmin) {
    return null;
  }

  // Sinon, afficher le contenu
  return <>{children}</>;
}

