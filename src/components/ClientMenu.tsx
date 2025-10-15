'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Package, 
  Heart, 
  User, 
  Lock, 
  ShoppingBag,
  LogOut,
  Calculator,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

export function ClientMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      title: 'Tableau de bord',
      href: '/mon-espace/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Mon profil',
      href: '/mon-espace/profile',
      icon: User,
    },
    {
      title: 'Simuler son projet',
      href: '/estimation',
      icon: Calculator,
    },
    {
      title: 'Mes favoris',
      href: '/mon-espace/wishlist',
      icon: Heart,
    },
    {
      title: 'Mes annonces',
      href: '/mon-espace/annonces',
      icon: Package,
    },
    {
      title: 'Soumettre une annonce',
      href: '/deposer-annonce',
      icon: Edit,
    },
    {
      title: 'Mes commandes',
      href: '/mon-espace/commandes',
      icon: ShoppingBag,
    },
    {
      title: 'Changer mot de passe',
      href: '/mon-espace/mot-de-passe',
      icon: Lock,
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Card className="sticky top-4">
      <CardContent className="p-0">
        {/* Avatar utilisateur */}
        <div className="border-b p-6 text-center">
          <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-blue-600">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-100">
                <User className="h-10 w-10 text-blue-600" />
              </div>
            )}
          </div>
          <h4 className="font-semibold text-gray-900">{user?.name}</h4>
          <span className="text-sm text-gray-600">{user?.telephone}</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </nav>
      </CardContent>
    </Card>
  );
}

