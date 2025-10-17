'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function PreviewAnnoncePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  const [annonce, setAnnonce] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError('Vous devez être connecté pour voir cette annonce');
          return;
        }

        const response = await fetch(`/api/client/annonces/${code}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Annonce non trouvée');
        }

        const result = await response.json();
        if (result.success) {
          setAnnonce(result.data);
        } else {
          setError(result.message || 'Erreur lors du chargement');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchAnnonce();
    }
  }, [code]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !annonce) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Annonce non trouvée</h2>
            <p className="text-gray-600 mb-6">{error || 'Cette annonce n\'existe pas ou vous n\'y avez pas accès.'}</p>
            <Link 
              href="/mon-espace/annonces"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes annonces
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Si l'annonce est approuvée, rediriger vers la vue publique
  if (annonce.enabled === 1) {
    router.push(`/biens/${code}`);
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-4 lg:p-8">
          {/* Banner d'avertissement */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Aperçu de votre annonce en attente d'approbation
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Cette annonce n'est pas encore visible publiquement. Elle sera disponible après validation par l'équipe.
                </p>
              </div>
            </div>
          </div>

          {/* Lien retour */}
          <div className="mb-6">
            <Link 
              href="/mon-espace/annonces"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à mes annonces
            </Link>
          </div>

          {/* Contenu de l'annonce */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Images */}
            {annonce.images && annonce.images.length > 0 && (
              <div className="relative h-96">
                <img 
                  src={annonce.images[0].startsWith('/') ? annonce.images[0] : `/${annonce.images[0]}`}
                  alt={annonce.nom}
                  className="w-full h-full object-cover"
                />
                {annonce.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    +{annonce.images.length - 1} photos
                  </div>
                )}
              </div>
            )}

            <div className="p-8">
              {/* Prix et statut */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {annonce.prix_vente?.toLocaleString('fr-FR')} F CFA
                  </h1>
                  <p className="text-lg text-gray-600">{annonce.categorie?.nom || 'Type de bien'}</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold">
                  En attente
                </div>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                {annonce.surface > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Surface</p>
                    <p className="text-lg font-semibold">{annonce.surface} m²</p>
                  </div>
                )}
                {annonce.piece > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Pièces</p>
                    <p className="text-lg font-semibold">{annonce.piece}</p>
                  </div>
                )}
                {annonce.chambre > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Chambres</p>
                    <p className="text-lg font-semibold">{annonce.chambre}</p>
                  </div>
                )}
                {annonce.meuble !== null && annonce.meuble !== 0 && (
                  <div>
                    <p className="text-sm text-gray-600">État</p>
                    <p className="text-lg font-semibold">Meublé</p>
                  </div>
                )}
              </div>

              {/* Localisation */}
              {(annonce.commune || annonce.quartier) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Localisation</h2>
                  <p className="text-gray-700">
                    {annonce.quartier?.nom && `${annonce.quartier.nom}, `}
                    {annonce.commune?.nom}
                  </p>
                </div>
              )}

              {/* Description */}
              {annonce.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{annonce.description}</p>
                </div>
              )}

              {/* Galerie d'images */}
              {annonce.images && annonce.images.length > 1 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Galerie photos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {annonce.images.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={image.startsWith('/') ? image : `/${image}`}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

