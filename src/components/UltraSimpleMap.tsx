'use client';

import { useEffect, useRef, useState } from 'react';

export function UltraSimpleMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = () => {
      console.log('🚀 Initialisation de la carte...');
      
      if (typeof window === 'undefined') {
        console.log('❌ Pas de window');
        return;
      }

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) {
        console.log('❌ Mapbox GL JS non disponible');
        setError('Mapbox GL JS non disponible');
        setIsLoading(false);
        return;
      }

      console.log('✅ Mapbox GL JS disponible');

      if (!mapContainer.current) {
        console.log('❌ Conteneur de carte non trouvé');
        setError('Conteneur de carte non trouvé');
        setIsLoading(false);
        return;
      }

      if (map.current) {
        console.log('❌ Carte déjà initialisée');
        return;
      }

      try {
        console.log('🎯 Création de la carte...');
        
        // Utiliser le token du projet PHP
        mapboxgl.accessToken = 'pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w';
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-3.9725785, 5.3647141], // Abidjan
          zoom: 11
        });

        console.log('✅ Carte créée');

        map.current.on('load', () => {
          console.log('🎉 Carte chargée avec succès !');
          setIsLoading(false);
        });

        map.current.on('error', (e: any) => {
          console.error('❌ Erreur de la carte:', e);
          setError(`Erreur de la carte: ${e.error?.message || 'Erreur inconnue'}`);
          setIsLoading(false);
        });

        // Ajouter un marqueur
        new mapboxgl.Marker({ color: 'red' })
          .setLngLat([-3.9725785, 5.3647141])
          .setPopup(new mapboxgl.Popup().setHTML('<b>Abidjan, Côte d\'Ivoire</b><br>Centre de la ville'))
          .addTo(map.current);

        console.log('✅ Marqueur ajouté');

      } catch (err) {
        console.error('❌ Erreur lors de la création de la carte:', err);
        setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setIsLoading(false);
      }
    };

    // Charger le script Mapbox
    const loadScript = () => {
      if ((window as any).mapboxgl) {
        console.log('✅ Mapbox déjà chargé');
        initMap();
        return;
      }

      console.log('📥 Chargement du script Mapbox...');
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.onload = () => {
        console.log('✅ Script Mapbox chargé');
        setTimeout(initMap, 100);
      };
      script.onerror = () => {
        console.error('❌ Erreur de chargement du script');
        setError('Erreur de chargement du script Mapbox');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-3 rounded-lg">
        <h3 className="font-semibold text-green-900">🗺️ Carte Ultra Simple</h3>
        <p className="text-green-800 text-sm">
          Version ultra-simplifiée avec debug complet
        </p>
      </div>
      
      <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden relative">
        <div 
          ref={mapContainer} 
          className="w-full h-full"
          style={{ minHeight: '384px' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 pointer-events-none">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 pointer-events-none">
            <div className="text-center">
              <div className="text-red-600 text-lg mb-2">⚠️</div>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 p-3 rounded-lg text-sm">
        <p className="text-blue-800">
          <strong>Debug :</strong> Ouvrez la console du navigateur (F12) pour voir les messages détaillés.
        </p>
      </div>
    </div>
  );
}
