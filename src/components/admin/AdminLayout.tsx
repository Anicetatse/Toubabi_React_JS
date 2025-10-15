'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShoppingCart,
  MapPin,
  Settings,
  Menu,
  X,
  LogOut,
  Package,
  Pill,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { 
      name: 'Biens', 
      icon: Building2,
      subItems: [
        { name: 'Biens', href: '/admin/biens' },
        { name: 'Catégories', href: '/admin/categories' },
        { name: 'Sous-catégories', href: '/admin/sous-categories' },
        { name: 'Type annonces', href: '/admin/type-annonces' },
        { name: 'Caractéristiques', href: '/admin/caracteristiques' },
        { name: 'Images', href: '/admin/images' },
        { name: 'Vidéos', href: '/admin/videos' },
        { name: 'Tags', href: '/admin/tags' },
      ]
    },
    { name: 'Clients', href: '/admin/clients', icon: Users },
    { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
    {
      name: 'Services',
      icon: Pill,
      subItems: [
        { name: 'Tous les services', href: '/admin/services' },
        { name: 'Pharmacies', href: '/admin/pharmacies' },
        { name: 'Banques', href: '/admin/banques' },
        { name: 'Hôpitaux', href: '/admin/hospitaliers' },
        { name: 'Hôtels', href: '/admin/hoteliers' },
        { name: 'Stations', href: '/admin/stations' },
        { name: 'Commerces', href: '/admin/commerces' },
        { name: 'Enseignement', href: '/admin/enseignements' },
        { name: 'Industries', href: '/admin/industries' },
        { name: 'Services publics', href: '/admin/services-publics' },
      ]
    },
    {
      name: 'Localisation',
      icon: MapPin,
      subItems: [
        { name: 'Vue d\'ensemble', href: '/admin/localisation' },
        { name: 'Pays', href: '/admin/pays' },
        { name: 'Villes', href: '/admin/villes' },
        { name: 'Communes', href: '/admin/communes' },
        { name: 'Quartiers', href: '/admin/quartiers' },
        { name: 'Prix indicatifs', href: '/admin/prix' },
      ]
    },
    {
      name: 'Contenu',
      icon: Package,
      subItems: [
        { name: 'Sliders', href: '/admin/sliders' },
        { name: 'Templates', href: '/admin/templates' },
        { name: 'Menus', href: '/admin/menus' },
        { name: 'Sous-menus', href: '/admin/sous-menus' },
        { name: 'Articles', href: '/admin/articles' },
      ]
    },
    {
      name: 'Communications',
      icon: Package,
      subItems: [
        { name: 'Messages contact', href: '/admin/contact' },
        { name: 'Commentaires', href: '/admin/commentaires' },
        { name: 'Estimations', href: '/admin/estimations' },
        { name: 'Wishlists', href: '/admin/wishlists' },
      ]
    },
    { name: 'Paramètres', href: '/admin/parametres', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Vérifier si l'utilisateur est admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="mb-4 text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Button onClick={() => router.push('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              Toubabi Admin
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.href && pathname?.startsWith(item.href);
              
              // Menu avec sous-items
              if ('subItems' in item && item.subItems) {
                const hasActiveChild = item.subItems.some((sub: any) => 
                  pathname?.startsWith(sub.href)
                );
                
                return (
                  <div key={item.name} className="space-y-1">
                    <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                      hasActiveChild ? 'text-white' : 'text-gray-300'
                    }`}>
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                    <div className="ml-8 space-y-1">
                      {item.subItems.map((subItem: any) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              isSubActive
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              
              // Menu simple
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-800 p-4">
            <div className="mb-2 text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-400">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                Voir le site
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

