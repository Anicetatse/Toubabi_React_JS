'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart, User, Search, MapPin, Home, Building2, Hammer, BookOpen, ChevronDown, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();

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
        { name: 'Mobilités urbaines', href: '/mobilites' },
      ]
    },
    { name: 'Biens disponibles', href: '/biens' },
  ];

  const handleLogout = async () => {
    try {
      logout();
      
      // Afficher une notification de succès
      toast.success('Vous êtes maintenant déconnecté. À bientôt !', {
        duration: 3000,
        style: {
          background: '#dcfce7',
          color: '#15803d',
          border: '2px solid #22c55e',
          fontWeight: '600',
        },
      });
      
      // Rediriger vers la page d'accueil après un court délai
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 px-4 py-3 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-110">
              <Image 
                src="/assets/img/logo2.png" 
                alt="Toubabi Logo" 
                width={64}
                height={64}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </Link>
        </div>

        {/* Menu Desktop */}
        <div className="hidden lg:flex lg:gap-x-6">
          {navigation.map((item) => (
            item.dropdown ? (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => setHoveredMenu(item.name)}
                onMouseLeave={() => setHoveredMenu(null)}
              >
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 gap-2 px-4 py-2"
                >
                  {item.name === 'Cartographie des prix' && <MapPin className="h-4 w-4" />}
                  {item.name === 'Construire' && <Hammer className="h-4 w-4" />}
                  {item.name === 'Tout savoir' && <BookOpen className="h-4 w-4" />}
                  {item.name}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
                
                {/* Sous-menu au hover */}
                {hoveredMenu === item.name && (
                  <div className="absolute top-full left-0 w-64 bg-white shadow-xl border border-gray-200 rounded-lg z-50 mt-1 animate-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
              >
                <Button
                  variant="ghost"
                  className={`text-sm font-medium transition-all duration-200 gap-2 px-4 py-2 ${
                    pathname === item.href 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-1 items-center justify-end gap-x-4">
          {/* Recherche */}
          <Link href="/recherche">
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              title="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link href="/mon-espace/wishlist">
              <Button 
                variant="ghost" 
                size="icon"
                className="hidden sm:flex relative hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                title="Mes favoris"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
          )}


          {/* Utilisateur */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                >
                  <div className="relative">
                    <User className="h-5 w-5" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 shadow-lg">
                <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-green-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mon-espace/dashboard" className="cursor-pointer flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Mon espace
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mon-espace/annonces" className="cursor-pointer flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Mes annonces
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mon-espace/profile" className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer font-medium">
                  <X className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex lg:gap-x-2">
              <Button 
                variant="outline" 
                asChild
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Link href="/login">Connexion</Link>
              </Button>
              <Button 
                asChild
                className="bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                <Link href="/register">Inscription</Link>
              </Button>
            </div>
          )}

          {/* Contactez-nous */}
          <Button 
            variant="ghost" 
            asChild 
            className="hidden lg:flex hover:bg-orange-50 hover:text-orange-600 gap-2 transition-all duration-200 px-3"
          >
            <Link href="/contactez-nous">
              <Phone className="h-4 w-4" />
              Contact
            </Link>
          </Button>

          {/* ToGes */}
          <Button 
            asChild 
            className="hidden lg:flex bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-md gap-2 transition-all duration-200 px-4"
          >
            <Link href="https://toges.toubabi.com/" target="_blank" rel="noopener noreferrer">
              ToGes
              <ExternalLink className="h-3 w-3" />
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
        <div className="lg:hidden border-t bg-gradient-to-b from-white to-gray-50">
          <div className="space-y-1 px-4 pb-4 pt-3">
            {/* Navigation Items */}
            {navigation.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-600">
                      {item.name}
                    </div>
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building2 className="h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Actions mobiles */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <Link href="/recherche" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Search className="h-4 w-4" />
                  Rechercher
                </Button>
              </Link>
              
              <Link href="/contactez-nous" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full gap-2 justify-start">
                  <Phone className="h-4 w-4" />
                  Contactez-nous
                </Button>
              </Link>
              
              {!isAuthenticated && (
                <>
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                    <Link href="/login">Connexion</Link>
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/register">Inscription</Link>
                  </Button>
                </>
              )}
              
              <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 gap-2" asChild>
                <Link href="https://toges.toubabi.com/" target="_blank" rel="noopener noreferrer">
                  ToGes
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

