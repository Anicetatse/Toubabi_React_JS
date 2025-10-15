'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemsCount } = useCart();

  const navigation = [
    { 
      name: 'Cartographie des prix', 
      href: '#',
      dropdown: [
        { name: 'Terrains', href: '/' },
        { name: 'Constructions', href: '/cartographie/bati' },
        { name: 'Stats par zone', href: '/carto/stats' },
      ]
    },
    { 
      name: 'Construire', 
      href: '#',
      dropdown: [
        { name: 'Généralités', href: '/construire' },
        { name: 'Simuler mon projet de construction', href: '/estimation' },
      ]
    },
    { 
      name: 'Tout savoir', 
      href: '#',
      dropdown: [
        { name: 'Les fondamentaux', href: '/tout-savoir' },
        { name: 'Mobilité urbaine', href: '/services' },
      ]
    },
    { name: 'Biens disponibles', href: '/biens' },
  ];

  const handleLogout = async () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-blue-600">Toubabi</span>
          </Link>
        </div>

        {/* Menu Desktop */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            item.dropdown ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600">
                    {item.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {item.dropdown.map((subItem) => (
                    <DropdownMenuItem key={subItem.name} asChild>
                      <Link href={subItem.href}>{subItem.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold leading-6 transition-colors hover:text-blue-600 ${
                  pathname === item.href ? 'text-blue-600' : 'text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end gap-x-3">
          {/* Recherche */}
          <Link href="/recherche">
            <Button variant="ghost" className="hidden sm:flex">
              Rechercher
            </Button>
          </Link>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link href="/mon-espace/wishlist">
              <Button variant="ghost" className="hidden sm:flex">
                <Heart className="h-4 w-4 mr-2" />
                Mes favoris
              </Button>
            </Link>
          )}


          {/* Utilisateur */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mon-espace/dashboard">Mon espace</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mon-espace/annonces">Mes annonces</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mon-espace/profile">Mon profil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex lg:gap-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Inscription</Link>
              </Button>
            </div>
          )}

          {/* Contactez-nous */}
          <Button variant="ghost" asChild className="hidden lg:flex">
            <Link href="/contactez-nous">Contactez-nous</Link>
          </Button>

          {/* ToGes */}
          <Button asChild className="hidden lg:flex bg-red-600 hover:bg-red-700">
            <Link href="https://toges.toubabi.com/" target="_blank" rel="noopener noreferrer">
              ToGes
            </Link>
          </Button>

          {/* Menu Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 border-t px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 space-y-2">
              {!isAuthenticated && (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login">Connexion</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register">Inscription</Link>
                  </Button>
                </>
              )}
              <Button className="w-full" asChild>
                <Link href="/deposer-annonce">Déposer une annonce</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

