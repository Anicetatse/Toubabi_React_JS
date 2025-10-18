'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Home, 
  MapPin, 
  Bed, 
  Maximize, 
  Share2, 
  Heart,
  Phone,
  Mail,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  Tag,
  User,
  Send,
  ExternalLink
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useToast } from '@/components/Toast';
import { WishlistButton } from '@/components/WishlistButton';

interface Bien {
  code: string;
  nom: string;
  description: string;
  prix_vente: number;
  image: string;
  images?: string[]; // Nouveau format parsé par l'API
  piece: number;
  chambre: number;
  surface: number;
  type_annonce: string;
  code_categorie: string;
  categorie_nom: string;
  meuble: number;
  updated_at: string;
  commune: {
    id: number;
    nom: string;
  } | null;
  quartier: {
    id: number;
    nom: string;
    lat: string;
    lng: string;
  } | null;
  annonceur: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    type_compte: string;
  } | null;
  commentaires: Array<{
    id: number;
    nom: string;
    commentaire: string;
    note: number;
    created_at: string;
  }>;
  averageNote: number;
  totalComments: number;
}

// Charger le composant de carte uniquement côté client (pas de SSR)
const MapLocation = dynamic(() => import('@/components/MapLocation'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
      <div className="text-center text-gray-500">
        <MapPin className="w-12 h-12 mx-auto mb-2 animate-pulse" />
        <p>Chargement de la carte...</p>
      </div>
    </div>
  ),
});

// Helper pour formater les dates (maintenant en format ISO depuis l'API)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

export default function BienDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || '';

  const [bien, setBien] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const { showToast, ToastContainer } = useToast();

  // Formulaire de contact
  const [contactForm, setContactForm] = useState({
    nom: '',
    email: '',
    numero: '',
    description: 'Je suis intéressé(e) par ce bien.',
  });

  // Formulaire de commentaire
  const [commentForm, setCommentForm] = useState({
    nom: '',
    commentaire: '',
    note: 5,
  });

  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Vérifier que le code existe avant de faire l'appel
    if (code && code !== 'undefined' && code !== 'null' && code !== '') {
      fetchBien();
    } else {
      setLoading(false);
      // Ne pas rediriger immédiatement si le code est vide (en cours de chargement)
      if (code !== '') {
        router.push('/biens');
      }
    }
  }, [code]);


  const fetchBien = async () => {
    try {
      setLoading(true);
      
      // Récupérer le token (admin ou client)
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const clientToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const token = adminToken || clientToken;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/biens/${code}`, { headers });
      
      if (!response.ok) {
        throw new Error('Bien non trouvé');
      }

      const result = await response.json();
      setBien(result.success ? result.data : result);
    } catch (error) {
      console.error('Erreur lors de la récupération du bien:', error);
      showToast('Bien non trouvé', 'error');
      router.push('/biens');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          code_produit: bien?.code,
        }),
      });

      if (response.ok) {
        showToast('Votre message a été envoyé avec succès !', 'success');
        setContactForm({
          nom: '',
          email: '',
          numero: '',
          description: 'Je suis intéressé(e) par ce bien.',
        });
      } else {
        showToast('Erreur lors de l\'envoi du message', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors de l\'envoi du message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...commentForm,
          produit_code: bien?.code,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast(result.message || 'Votre commentaire a été ajouté avec succès !', 'success');
        setCommentForm({ nom: '', commentaire: '', note: 5 });
        
        // Recharger les données du bien pour afficher le nouveau commentaire
        await fetchBien();
      } else {
        showToast(result.error || 'Erreur lors de l\'ajout du commentaire', 'error');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors de l\'ajout du commentaire', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Bien non trouvé</h2>
        </div>
      </div>
    );
  }

  // Parse images
  let images: string[] = [];
  try {
    // Si l'API a déjà parsé les images (nouveau format)
    if (bien.images && Array.isArray(bien.images)) {
      images = bien.images;
    }
    // Sinon, parser l'ancien format
    else if (bien.image) {
      images = bien.image.startsWith('[') 
        ? JSON.parse(bien.image)
        : [bien.image];
    }
      
    // Corriger le chemin et ajouter / au début si nécessaire
    images = images.map(img => {
      // Remplacer assets/images/annonces par assets/annonces
      let correctedImg = img.replace('assets/images/annonces/', 'assets/annonces/');
      
      // Ajouter / au début si nécessaire
      if (!correctedImg.startsWith('http') && !correctedImg.startsWith('/')) {
        correctedImg = '/' + correctedImg;
      }
      
      return correctedImg;
    });
  } catch (e) {
    images = ['/assets/img/nofound.jpg'];
  }

  if (images.length === 0) {
    images = ['/assets/img/nofound.jpg'];
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getAnnonceurBadgeStyle = () => {
    if (bien.annonceur?.type_compte === 'agent_informel') {
      return 'border-red-500 bg-red-50';
    }
    return 'border-green-500 bg-green-50';
  };

  const getAnnonceurText = () => {
    switch (bien.annonceur?.type_compte) {
      case 'agent_informel':
        return 'Cette offre provient d\'un annonceur indépendant';
      case 'agent_professionnel':
        return `Cette offre provient de M./Mme ${bien.annonceur.nom}, Agent immobilier agréé`;
      case 'agence':
        return 'Cette offre provient d\'une agence immobilière';
      default:
        return 'Cette offre provient d\'un annonceur indépendant';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />);
      }
    }

    return stars;
  };

  const toggleCommentExpansion = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <MainLayout>
      <ToastContainer />
      {/* Hero Gallery Section */}
      <div className="relative w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Image principale avec padding responsive */}
        <div className="relative w-full h-[500px] flex items-center justify-center p-4">
          {/* Pattern de fond */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>

          <div className="relative w-full h-full max-w-6xl mx-auto">
            <Image
              src={images[currentImageIndex]}
              alt={bien.nom}
              fill
              unoptimized
              className="object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-10"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-10"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setShowFullscreenGallery(true)}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
          >
            <Maximize className="w-4 h-4" />
            Voir toutes les photos
          </button>
        </div>

        {/* Vignettes de navigation */}
        {images.length > 1 && (
          <div className="bg-black/50 backdrop-blur-sm border-t border-gray-700">
            <div className="container mx-auto px-4 py-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? 'ring-4 ring-blue-500 scale-110 shadow-xl'
                        : 'ring-2 ring-gray-600 hover:ring-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Photo ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {index === currentImageIndex && (
                      <div className="absolute inset-0 bg-blue-500/20" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${
                    bien.type_annonce === 'louer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    À {bien.type_annonce}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{bien.nom}</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{bien.commune?.nom}, {bien.quartier?.nom}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="text-4xl font-bold">
                  {formatPrice(bien.prix_vente)} FCFA
                  {bien.type_annonce === 'louer' && (
                    <span className="text-lg font-normal ml-2">
                      {bien.code_categorie === 'residence-meublee' ? '/jour' : '/mois'}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {bien.piece > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{bien.piece}</div>
                      <div className="text-sm text-gray-600">Pièces</div>
                    </div>
                  </div>
                )}
                {bien.chambre > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Bed className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{bien.chambre}</div>
                      <div className="text-sm text-gray-600">Chambres</div>
                    </div>
                  </div>
                )}
                {bien.surface > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Maximize className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{bien.surface}</div>
                      <div className="text-sm text-gray-600">m²</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-6 h-6 text-blue-600" />
                Détails
              </h2>
              <ul className="grid grid-cols-2 gap-4">
                {bien.piece > 0 && (
                  <li className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Nombre de pièces:</span>
                    <span className="font-semibold text-gray-900">{bien.piece}</span>
                  </li>
                )}
                {bien.chambre > 0 && (
                  <li className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Nombre de chambres:</span>
                    <span className="font-semibold text-gray-900">{bien.chambre}</span>
                  </li>
                )}
                {bien.surface > 0 && (
                  <li className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Surface:</span>
                    <span className="font-semibold text-gray-900">{bien.surface} m²</span>
                  </li>
                )}
                <li className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Type de bien:</span>
                  <span className="font-semibold text-gray-900">{bien.categorie_nom}</span>
                </li>
                <li className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-semibold text-gray-900">À {bien.type_annonce}</span>
                </li>
                {bien.updated_at && (
                  <li className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(bien.updated_at)}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: bien.description || 'Aucune description disponible.' }}
              />
            </div>

            {/* Location Card */}
            {bien.quartier && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Localisation
                </h2>
                <div className="space-y-4">
                  {/* Carte toujours affichée - géocodage automatique si pas de GPS (comme Laravel) */}
                  <MapLocation 
                    lat={bien.quartier.lat}
                    lng={bien.quartier.lng}
                    quartierName={bien.quartier.nom}
                    communeName={bien.commune?.nom}
                  />
                  
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(bien.quartier.nom + ', ' + (bien.commune?.nom || '') + ', Abidjan, Côte d\'Ivoire')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg w-full justify-center"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Ouvrir dans Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Rating & Comments Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header avec note moyenne */}
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">Avis et commentaires</h2>
                    <p className="text-blue-100 text-sm sm:text-base">Note de l'annonceur basée sur {bien.totalComments} avis</p>
                  </div>
                  
                  {/* Note moyenne en grand cercle */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
                        <div className="text-center">
                          <div className="text-4xl sm:text-5xl font-black">{bien.averageNote}</div>
                          <div className="text-xs sm:text-sm opacity-90">/ 5.0</div>
                        </div>
                      </div>
                      {/* Effet de brillance */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex gap-1 mt-3">
                      {renderStars(parseFloat(bien.averageNote.toString()))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">

              {/* Comment Form */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Laisser un commentaire</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Partagez votre expérience avec cet annonceur</p>
                
                <form onSubmit={handleCommentSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom ou pseudonyme *</label>
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={commentForm.nom}
                      onChange={(e) => setCommentForm({ ...commentForm, nom: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Votre avis *</label>
                    <textarea
                      placeholder="Partagez votre expérience avec cet annonceur ou ce bien..."
                      value={commentForm.commentaire}
                      onChange={(e) => setCommentForm({ ...commentForm, commentaire: e.target.value })}
                      required
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Votre note *</label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      {/* Étoiles interactives */}
                      <div className="flex gap-1.5 sm:gap-2 justify-center sm:justify-start">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCommentForm({ ...commentForm, note: star })}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="transition-all duration-200 transform hover:scale-110 sm:hover:scale-125 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded"
                          >
                            <Star
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-all ${
                                star <= (hoveredStar || commentForm.note)
                                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                  : 'text-gray-300 hover:text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      
                      {/* Label de la note */}
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <span className="text-2xl sm:text-3xl font-bold text-yellow-600">
                          {hoveredStar || commentForm.note}
                        </span>
                        <div className="text-left">
                          <div className="text-xs sm:text-sm text-gray-500">/ 5</div>
                          <div className="text-xs font-semibold text-gray-700">
                            {(hoveredStar || commentForm.note) === 5 ? '🎉 Excellent' :
                             (hoveredStar || commentForm.note) === 4 ? '😊 Très bien' :
                             (hoveredStar || commentForm.note) === 3 ? '🙂 Bien' :
                             (hoveredStar || commentForm.note) === 2 ? '😐 Moyen' :
                             '😞 Mauvais'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-base sm:text-lg"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    {submitting ? 'Envoi en cours...' : 'Publier mon avis'}
                  </button>
                </form>
              </div>


              {/* Comments List */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between px-2 sm:px-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {bien.totalComments === 0 ? 'Aucun avis' : `${bien.totalComments} ${bien.totalComments > 1 ? 'Avis' : 'Avis'}`}
                  </h3>
                </div>
                
                {bien.commentaires.length > 0 ? (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      {(showAllComments ? bien.commentaires : bien.commentaires.slice(0, 3)).map((comment, index) => {
                        const isExpanded = expandedComments.has(comment.id);
                        const commentText = comment.commentaire;
                        const isLongComment = commentText.length > 200;
                        const displayText = isExpanded || !isLongComment ? commentText : truncateText(commentText, 200);

                        return (
                          <div key={comment.id} className="group relative bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                            {/* Avatar et infos */}
                            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                              {/* Avatar avec initiale */}
                              <div className="flex-shrink-0">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md ${
                                  index % 5 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                  index % 5 === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                                  index % 5 === 2 ? 'bg-gradient-to-br from-pink-500 to-pink-600' :
                                  index % 5 === 3 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                  'bg-gradient-to-br from-orange-500 to-orange-600'
                                }`}>
                                  {comment.nom.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              
                              {/* Nom et date */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                  <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">{comment.nom}</h4>
                                  {/* Badge vérifié (optionnel) */}
                                  <span className="px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                                    ✓ Vérifié
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <div className="text-[10px] sm:text-xs text-gray-500">
                                    {formatDateTime(comment.created_at)}
                                  </div>
                                  {/* Note sous forme de badge */}
                                  <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-yellow-50 rounded-full">
                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-[10px] sm:text-xs font-bold text-yellow-700">{comment.note}.0</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Commentaire */}
                            <div className="pl-11 sm:pl-[52px]">
                              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm">{displayText}</p>
                              
                              {/* Bouton Lire plus / Lire moins */}
                              {isLongComment && (
                                <button
                                  onClick={() => toggleCommentExpansion(comment.id)}
                                  className="mt-1.5 sm:mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-[10px] sm:text-xs transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" />
                                      Lire moins
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" />
                                      Lire plus
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            
                            {/* Décoration */}
                            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bouton Voir plus / Voir moins de commentaires */}
                    {bien.commentaires.length > 3 && (
                      <div className="flex justify-center pt-2 sm:pt-4">
                        <button
                          onClick={() => setShowAllComments(!showAllComments)}
                          className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                        >
                          {showAllComments ? (
                            <>
                              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                              Voir moins d'avis
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                              Voir tous les avis ({bien.commentaires.length})
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg font-medium">Aucun commentaire pour le moment</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">Soyez le premier à laisser un avis !</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      navigator.share?.({ 
                        title: bien.nom, 
                        url: window.location.href 
                      });
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Partager
                  </button>
                  <WishlistButton
                    produitCode={code}
                    variant="outline"
                    showText={true}
                    className="!flex !items-center !justify-center !gap-2 !px-4 !py-3 !h-auto !border-2 !rounded-xl !font-normal !bg-transparent !text-red-600 !border-red-600 hover:!bg-red-50 hover:!text-red-700"
                  />
                </div>
              </div>

              {/* Annonceur Badge */}
              {bien.annonceur && (
                <div className={`border-2 ${getAnnonceurBadgeStyle()} rounded-2xl p-4`}>
                  <div className="flex items-start gap-3">
                    {bien.annonceur.type_compte === 'agent_informel' && (
                      <div className="text-red-600 text-2xl">⚠️</div>
                    )}
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                      {getAnnonceurText()}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Card */}
              {bien.annonceur && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Annonceur Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{bien.annonceur.nom} {bien.annonceur.prenom}</h3>
                        <p className="text-blue-100 text-sm uppercase">
                          {bien.annonceur.type_compte.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>{bien.annonceur.telephone}</span>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <div className="p-6">
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                        <input
                          type="text"
                          placeholder="Votre Nom"
                          value={contactForm.nom}
                          onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          placeholder="Votre Email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                        <input
                          type="tel"
                          placeholder="Votre Contact"
                          value={contactForm.numero}
                          onChange={(e) => setContactForm({ ...contactForm, numero: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={contactForm.description}
                          onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                          required
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50"
                      >
                        Valider
                      </button>
                      <a
                        href={`https://wa.me/225${bien.annonceur.telephone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Contacter par WhatsApp
                      </a>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {showFullscreenGallery && (
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-50 flex flex-col">
          {/* Header avec contrôles */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-gray-800">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-bold text-lg">{bien.nom}</h3>
              <span className="text-gray-400 text-sm">
                Photo {currentImageIndex + 1} sur {images.length}
              </span>
            </div>
            <button
              onClick={() => setShowFullscreenGallery(false)}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:rotate-90 duration-300"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Zone d'affichage principale */}
          <div className="flex-1 relative flex items-center justify-center p-8">
            {/* Pattern de fond subtil */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />
            </div>

            {/* Image */}
            <div className="relative w-full h-full max-w-7xl mx-auto">
              <Image
                src={images[currentImageIndex]}
                alt={`${bien.nom} - Photo ${currentImageIndex + 1}`}
                fill
                unoptimized
                className="object-contain drop-shadow-2xl"
              />
            </div>

            {/* Boutons de navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-6 bg-white/90 hover:bg-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-10"
                >
                  <ChevronLeft className="w-7 h-7 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-6 bg-white/90 hover:bg-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-10"
                >
                  <ChevronRight className="w-7 h-7 text-gray-800" />
                </button>
              </>
            )}
          </div>

          {/* Barre de vignettes en bas */}
          {images.length > 1 && (
            <div className="bg-black/70 backdrop-blur-sm border-t border-gray-800 p-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden transition-all ${
                        index === currentImageIndex
                          ? 'ring-4 ring-blue-500 scale-105 shadow-2xl'
                          : 'ring-2 ring-gray-700 hover:ring-gray-500 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Vignette ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400" />
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}


