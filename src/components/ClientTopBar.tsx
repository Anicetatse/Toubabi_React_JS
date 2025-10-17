import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, User, Calculator, Heart, Layers, Pencil, LogOut } from 'lucide-react';

export function ClientTopBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const items = [
    { href: '/mon-espace/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/mon-espace/profile', label: 'Mon profil', icon: User },
    { href: '/estimation', label: 'Simuler son projet', icon: Calculator },
    { href: '/mon-espace/wishlist', label: 'Mes favoris', icon: Heart },
    { href: '/mon-espace/annonces', label: 'Mes annonces', icon: Layers },
    { href: '/deposer-annonce', label: 'Soumettre une annonce', icon: Pencil },
  ];

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      {/* Header utilisateur */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <User className="h-10 w-10" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-extrabold tracking-wide text-gray-900 uppercase">
            {user?.nom || ''} {user?.prenom || ''}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{user?.telephone || ''}</p>
        </div>
      </div>

      {/* Menu horizontal */}
      <div className="border-t">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 md:justify-start md:gap-8">
          {items.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link 
                key={href} 
                href={href} 
                className={`group inline-flex items-center gap-2 text-sm font-medium transition-all rounded-lg px-3 py-2 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700 font-bold border-b-2 border-green-600' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${
                  isActive 
                    ? 'text-blue-700' 
                    : 'text-blue-700/80 group-hover:text-blue-700'
                }`} />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
