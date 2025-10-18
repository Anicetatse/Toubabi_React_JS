'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProtectedAdminRoute } from './ProtectedAdminRoute';
import toast from 'react-hot-toast';
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
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
  Tag,
  Percent,
  Heart,
  Globe,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Charger les infos de l'admin depuis localStorage
    if (typeof window !== 'undefined') {
      const storedAdmin = localStorage.getItem('admin_user');
      if (storedAdmin) {
        try {
          setAdminUser(JSON.parse(storedAdmin));
        } catch (error) {
          console.error('Erreur parsing admin user:', error);
        }
      }

      // Charger l'état du menu plié/déplié
      const storedCollapsed = localStorage.getItem('admin_sidebar_collapsed');
      if (storedCollapsed) {
        setSidebarCollapsed(storedCollapsed === 'true');
      }
    }
  }, []);

  // Sauvegarder l'état du menu
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_sidebar_collapsed', String(newState));
    }
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  // Navigation EXACTEMENT comme Laravel sidebar (sidebar_content.blade.php)
  const navigation = [
    // Production (lignes 2-9)
    { 
      title: 'Production',
      icon: Package,
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
        { name: 'Favoris', href: '/admin/wishlists', icon: Heart },
        { name: 'Formulaire de contact', href: '/admin/contact', icon: MessageSquare },
      ]
    },
    // Gestion des annonces (lignes 41-53)
    {
      title: 'Gestion des annonces',
      icon: Building2,
      items: [
        { name: 'Catégories', href: '/admin/categories', icon: Tag },
        { name: 'Sous catégories', href: '/admin/sous-categories', icon: Tag },
        { name: 'Annonces', href: '/admin/annonces', icon: Building2 },
        { name: 'Commentaire', href: '/admin/commentaires', icon: MessageSquare },
        { name: "Type d'annonces", href: '/admin/type-annonces', icon: FileText },
        { name: 'Caracteristique', href: '/admin/caracteristiques', icon: Tag },
      ]
    },
    // Configuration de Base (lignes 61-73)
    {
      title: 'Configuration de Base',
      icon: Settings,
      items: [
        { name: 'Villes', href: '/admin/villes', icon: MapPin },
        { name: 'Communes', href: '/admin/communes', icon: MapPin },
        { name: 'Quartiers', href: '/admin/quartiers', icon: MapPin },
        { name: 'Sliders', href: '/admin/sliders', icon: Package },
      ]
    },
    // Paramètres utilisateurs (lignes 79-88)
    {
      title: 'Paramètres utilisateurs',
      icon: Users,
      items: [
        { name: 'Annonceurs', href: '/admin/clients', icon: Users },
        { name: 'Admins', href: '/admin/utilisateurs', icon: Users },
        { name: 'Rôles', href: '/admin/roles', icon: Settings },
        { name: 'Permissions', href: '/admin/permissions', icon: Settings },
      ]
    },
    // Mobilité urbaine (lignes 96-106)
    {
      title: 'Mobilité urbaine',
      icon: MapPin,
      items: [
        { name: 'Pharmacie de Garde', href: '/admin/pharmacies', icon: Pill },
        { name: 'Banque', href: '/admin/banques', icon: Building2 },
        { name: 'Commerce', href: '/admin/commerces', icon: ShoppingCart },
        { name: 'Enseignement', href: '/admin/enseignements', icon: Package },
        { name: 'Hospitalier', href: '/admin/hospitaliers', icon: Heart },
        { name: 'Hôtelier', href: '/admin/hoteliers', icon: Building2 },
        { name: 'Services publics', href: '/admin/services-publics', icon: Settings },
        { name: 'Station', href: '/admin/stations', icon: MapPin },
        { name: 'Industrie', href: '/admin/industries', icon: Package },
      ]
    },
    // Autres (lignes 91-93)
    {
      title: 'Autres',
      icon: Percent,
      items: [
        { name: 'Cartographie des prix', href: '/admin/prix', icon: MapPin },
        { name: 'Simulation de projet', href: '/admin/estimations', icon: Settings },
      ]
    },
  ];

  const handleLogout = () => {
    // Supprimer les données admin
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    toast.success('Déconnexion admin réussie. À bientôt !', {
      duration: 3000,
      style: {
        background: '#dcfce7',
        color: '#15803d',
        border: '2px solid #22c55e',
        fontWeight: '600',
      },
    });
    
    setTimeout(() => {
      router.push('/admin/login');
    }, 500);
  };

  return (
    <ProtectedAdminRoute>
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Pro - Style Créance Exact */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform text-white transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        style={{
          background: '#032211',
          height: '100%',
          overflow: 'hidden',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        {/* Overlay subtil - exactement comme Créance */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)',
          }}
        ></div>
        
        <div 
          className="flex flex-col relative z-10"
          style={{
            padding: '20px 0 18px 0',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Logo avec animation - Style Créance exact */}
          <div 
            style={{
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              textAlign: 'center',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Link href="/admin/dashboard" className="group block">
              <div 
                className="mx-auto transition-all duration-300 group-hover:scale-105"
                style={{
                  width: sidebarCollapsed ? '50px' : '100px',
                  height: sidebarCollapsed ? '50px' : '100px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  padding: '5px',
                }}
              >
                <Image 
                  src="/assets/img/logo2.png" 
                  alt="Toubabi Logo" 
                  width={sidebarCollapsed ? 55 : 110}
                  height={sidebarCollapsed ? 55 : 110}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-0 right-4 hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Bouton plier/déplier */}
          <div className="hidden lg:flex justify-center mb-4">
            <button
              onClick={toggleSidebarCollapsed}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:scale-105 shadow-lg"
              title={sidebarCollapsed ? 'Déplier le menu' : 'Plier le menu'}
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="h-5 w-5 text-white" />
              ) : (
                <ChevronsLeft className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          {/* Navigation - Style Créance EXACT */}
          <nav 
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              position: 'relative',
              zIndex: 2,
              paddingBottom: '20px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="scrollbar-hidden"
          >
            <style jsx>{`
              .scrollbar-hidden::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navigation.map((section, sectionIndex) => {
                const sectionHasSubmenus = section.items && section.items.length > 0;
                const isSectionExpanded = expandedMenus.includes(section.title);
                const Icon = section.icon;
                const isSectionActive = section.items?.some(item => pathname === item.href);
                
                return (
                  <div key={sectionIndex}>
                    {/* Menu principal - CSS EXACT de Créance */}
                    <div
                      onClick={() => sectionHasSubmenus && toggleMenu(section.title)}
                      style={{
                        padding: sidebarCollapsed ? '14px' : '14px 20px',
                        backgroundColor: isSectionActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        color: isSectionActive ? '#FFFFFF' : '#9CA3AF',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        margin: '2px 12px',
                        transition: 'all 0.2s ease',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        gap: '12px',
                        fontSize: '14px',
                        fontWeight: isSectionActive ? 600 : 500,
                      }}
                      title={sidebarCollapsed ? section.title : ''}
                    >
                      {/* Indicateur de sélection - EXACT Créance */}
                      {isSectionActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '24px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '0 2px 2px 0',
                            boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                          }}
                        />
                      )}
                      
                      {/* Icône */}
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        <Icon 
                          style={{
                            width: '22px',
                            height: '22px',
                            filter: isSectionActive ? 'brightness(1.3) saturate(1.2)' : 'brightness(0.9)',
                          }}
                        />
                      </div>
                      
                      {/* Texte du menu */}
                      {!sidebarCollapsed && (
                        <span
                          style={{
                            flex: 1,
                            fontSize: '14px',
                            fontWeight: isSectionActive ? 600 : 500,
                            color: isSectionActive ? '#FFFFFF' : '#fff',
                            position: 'relative',
                            zIndex: 2,
                          }}
                        >
                          {section.title}
                        </span>
                      )}
                      
                      {/* Flèche pour les sous-menus */}
                      {sectionHasSubmenus && !sidebarCollapsed && (
                        <div
                          style={{
                            color: '#fff',
                            fontSize: '12px',
                            position: 'relative',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            marginLeft: 'auto',
                            paddingRight: '2px',
                            transform: isSectionExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <ChevronRight width={20} height={20} color="#fff" />
                        </div>
                      )}
                    </div>
                    
                    {/* Sous-menus - Style Créance EXACT - Chaque ligne séparée */}
                    {sectionHasSubmenus && isSectionExpanded && !sidebarCollapsed && (
                      <div
                        style={{
                          marginLeft: '16px',
                          marginRight: '12px',
                          marginTop: '8px',
                          marginBottom: '8px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(10px)',
                          padding: '8px 6px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          position: 'relative',
                        }}
                      >
                        {section.items.map((item: any, itemIndex: number) => {
                          const isActive = pathname === item.href;
                          const isHovered = hoveredItem === item.href;
                          
                        return (
                            <div key={item.href}>
                          <Link
                                href={item.href}
                            onClick={() => setSidebarOpen(false)}
                          >
                                <div
                                  onMouseEnter={() => setHoveredItem(item.href)}
                                  onMouseLeave={() => setHoveredItem(null)}
                                  style={{
                                    overflowX: 'hidden',
                                    maxWidth: '100%',
                                    paddingRight: '1rem',
                                    paddingLeft: '1rem',
                                    paddingTop: '0.5rem',
                                    paddingBottom: '0.5rem',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                    borderRadius: '8px',
                                    display: 'block',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transform: isHovered ? 'translateX(4px)' : 'translateX(0px)',
                                    position: 'relative',
                                    margin: '0.5rem 0',
                                  }}
                                >
                                  <div
                                    style={{
                                      scrollbarWidth: 'none',
                                      transition: 'color 0.2s ease-in-out',
                                      fontSize: '16px',
                                      color: isActive ? '#FFFFFF' : isHovered ? '#E5E7EB' : '#7B8AA4',
                                      fontWeight: 500,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {item.name}
                                  </div>
                                </div>
                          </Link>
                            </div>
                        );
                      })}
                    </div>
                    )}
                  </div>
              );
            })}
            </div>
          </nav>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar Pro */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                Voir le site
              </Button>
            </Link>

            {/* Info admin - Cliquable */}
            <Link href="/admin/profil">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                    {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {adminUser?.name || 'Administrateur'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {adminUser?.email || ''}
                  </div>
                </div>
              </div>
            </Link>

            {/* Bouton de déconnexion */}
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm" 
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </ProtectedAdminRoute>
  );
}
