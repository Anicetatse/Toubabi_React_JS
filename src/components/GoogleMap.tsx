'use client';

import { useEffect, useRef } from 'react';

export function GoogleMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    const initializeMap = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        const google = (window as any).google;
        
        if (mapContainer.current && !map.current) {
          // Créer la carte Google Maps
          map.current = new google.maps.Map(mapContainer.current, {
            center: { lat: 5.3647141, lng: -3.9725785 }, // Abidjan
            zoom: 11,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          });

          // Ajouter un marqueur
          new google.maps.Marker({
            position: { lat: 5.3647141, lng: -3.9725785 },
            map: map.current,
            title: 'Abidjan'
          });

          console.log('Carte Google Maps initialisée avec succès');
        }
      }
    };

    const loadGoogleMaps = () => {
      if (!(window as any).google) {
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWg9FhmU3S7Y&callback=initMap';
        script.async = true;
        script.defer = true;
        
        // Fonction callback globale
        (window as any).initMap = initializeMap;
        
        script.onerror = () => {
          console.error('Erreur lors du chargement de Google Maps');
        };
        
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    loadGoogleMaps();

    return () => {
      if ((window as any).initMap) {
        delete (window as any).initMap;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-3 rounded-lg">
        <h3 className="font-semibold text-green-900">Carte Google Maps</h3>
        <p className="text-green-800 text-sm">
          Alternative à Mapbox
        </p>
      </div>
      
      <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden relative">
        <div 
          ref={mapContainer} 
          className="w-full h-full"
          style={{ minHeight: '384px' }}
        />
        
        {/* Message de chargement */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 pointer-events-none">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Chargement de Google Maps...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
