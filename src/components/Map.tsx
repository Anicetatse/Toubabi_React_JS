'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Quartier } from '@/types';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import dynamique pour éviter les erreurs SSR
const Map = React.lazy(() => import('react-map-gl').then(module => ({ default: module.default })));
const Marker = React.lazy(() => import('react-map-gl').then(module => ({ default: module.Marker })));
const Popup = React.lazy(() => import('react-map-gl').then(module => ({ default: module.Popup })));
const NavigationControl = React.lazy(() => import('react-map-gl').then(module => ({ default: module.NavigationControl })));
const GeolocateControl = React.lazy(() => import('react-map-gl').then(module => ({ default: module.GeolocateControl })));

interface MapComponentProps {
  quartiers: Quartier[];
  onQuartierClick?: (quartier: Quartier) => void;
}

export function MapComponent({ quartiers, onQuartierClick }: MapComponentProps) {
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null);
  const [viewport, setViewport] = useState({
    longitude: -4.0305, // Abidjan
    latitude: 5.3600,
    zoom: 11,
  });

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const handleMarkerClick = useCallback((quartier: Quartier) => {
    setSelectedQuartier(quartier);
    if (onQuartierClick) {
      onQuartierClick(quartier);
    }
  }, [onQuartierClick]);

  const formatPrice = (price?: string | number | null) => {
    if (!price) return 'Prix non disponible';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'Prix non disponible';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Veuillez configurer votre token Mapbox dans .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <React.Suspense fallback={<div className="flex items-center justify-center h-full">Chargement de la carte...</div>}>
        <Map
          {...viewport}
          onMove={(evt) => setViewport(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
        <NavigationControl position="top-right" />
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Marqueurs pour chaque quartier */}
        {quartiers.map((quartier) => (
          quartier.lat && quartier.lng && (
            <Marker
              key={quartier.id}
              longitude={parseFloat(quartier.lng)}
              latitude={parseFloat(quartier.lat)}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(quartier);
              }}
            >
              <div className="cursor-pointer transition-transform hover:scale-110">
                <MapPin
                  className="h-8 w-8 text-blue-600"
                  fill="currentColor"
                />
              </div>
            </Marker>
          )
        ))}

        {/* Popup d'information */}
        {selectedQuartier && selectedQuartier.lat && selectedQuartier.lng && (
          <Popup
            longitude={parseFloat(selectedQuartier.lng)}
            latitude={parseFloat(selectedQuartier.lat)}
            anchor="top"
            onClose={() => setSelectedQuartier(null)}
            closeButton={true}
            closeOnClick={false}
            className="map-popup"
          >
            <div className="p-2">
              <h3 className="mb-2 font-semibold text-gray-900">
                {selectedQuartier.nom}
              </h3>
              <p className="mb-1 text-sm text-gray-600">
                Quartier
              </p>
              <div className="mt-2 space-y-1 border-t pt-2">
                {selectedQuartier.prix_moyen && (
                  <div className="text-sm">
                    <span className="font-medium">Prix moyen: </span>
                    <span className="text-blue-600">
                      {formatPrice(selectedQuartier.prix_moyen)}/m²
                    </span>
                  </div>
                )}
                {selectedQuartier.prix_min_vente && (
                  <div className="text-sm">
                    <span className="font-medium">Prix min vente: </span>
                    <span className="text-blue-600">
                      {formatPrice(selectedQuartier.prix_min_vente)}/m²
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
        </Map>
      </React.Suspense>
    </div>
  );
}

