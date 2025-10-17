'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification admin
    const checkAdminAuth = () => {
      if (typeof window === 'undefined') return;

      const adminToken = localStorage.getItem('admin_token');
      const adminUser = localStorage.getItem('admin_user');

      // Si pas de token admin, rediriger vers login admin
      if (!adminToken || !adminUser) {
        router.push('/admin/login');
        return;
      }

      // Token trouvé, autoriser l'accès
      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAdminAuth();
  }, [router]);

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas autorisé, ne rien afficher (redirection en cours)
  if (!isAuthorized) {
    return null;
  }

  // Sinon, afficher le contenu
  return <>{children}</>;
}

