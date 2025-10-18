'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function HotelierDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['hotelier', id],
    queryFn: async () => {
      const res = await fetch(`/api/mobilites/hoteliers/${id}`);
      return res.json();
    },
  });

  const hotelier = response?.data;

  // Récupérer toutes les images
  const getImages = () => {
    if (!hotelier) return [];
    return [hotelier.images1, hotelier.images2, hotelier.images3, hotelier.images4, hotelier.images5,
            hotelier.images6, hotelier.images7, hotelier.images8, hotelier.images9, hotelier.images10]
      .filter(img => img && img.trim() !== '' && img.trim() !== 'null');
  };

  const images = getImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!hotelier) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hôtel non trouvé</h1>
          <Link href="/mobilites/hoteliers">
            <Button>Retour à la liste</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8">
          <div className="container mx-auto px-4">
            <Link 
              href="/mobilites/hoteliers"
              className="inline-flex items-center text-white hover:text-white/90 mb-4 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux hôtels
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{hotelier.nom}</h1>
                {hotelier.commune && (
                  <p className="text-white/95 mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {hotelier.commune.nom}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Galerie d'images */}
            {images.length > 0 && (
              <Card className="overflow-hidden">
                <div className="relative">
                  {/* Image principale */}
                  <div className="relative aspect-[16/9] bg-gray-900">
                    <img
                      src={images[currentImageIndex]}
                      alt={`${hotelier.nom} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/img/nofound.jpg';
                      }}
                    />
                    
                    {/* Contrôles */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Compteur */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* Miniatures */}
                  {images.length > 1 && (
                    <div className="p-4 bg-gray-50">
                      <div className="flex gap-2 overflow-x-auto">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index 
                                ? 'border-red-500 scale-105' 
                                : 'border-gray-200 hover:border-red-300'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Miniature ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Vidéo */}
            {hotelier.videos && hotelier.videos.trim() !== '' && (
              <Card className="overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <VideoIcon className="h-5 w-5 text-purple-600" />
                    Vidéo de présentation
                  </h2>
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video 
                      controls 
                      className="w-full max-h-[600px]"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                      }}
                    >
                      <source src={hotelier.videos} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  </div>
                </div>
              </Card>
            )}

            {/* Informations */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact */}
                {hotelier.contact && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <p className="text-sm font-semibold text-gray-700">Contact</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{hotelier.contact}</p>
                  </div>
                )}

                {/* Commune */}
                {hotelier.commune && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-semibold text-gray-700">Localisation</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{hotelier.commune.nom}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {hotelier.description && (
                <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800"
                    dangerouslySetInnerHTML={{ __html: hotelier.description }}
                  />
                </div>
              )}

              {/* Statistiques médias */}
              <div className="mt-6 flex gap-3">
                {images.length > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {images.length} photo{images.length > 1 ? 's' : ''}
                  </Badge>
                )}
                {hotelier.videos && hotelier.videos.trim() !== '' && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                    <VideoIcon className="h-4 w-4 mr-1" />
                    Vidéo disponible
                  </Badge>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

