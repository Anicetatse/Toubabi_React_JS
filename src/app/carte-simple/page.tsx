'use client';

import { useEffect, useRef } from 'react';

export default function CarteSimplePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    if (map.current) return;

    console.log('🚀 Tentative d\'initialisation de la carte...');

    // Attendre que mapboxgl soit disponible
    const checkMapbox = setInterval(() => {
      if ((window as any).mapboxgl && mapContainer.current) {
        clearInterval(checkMapbox);
        
        const mapboxgl = (window as any).mapboxgl;
        console.log('✅ Mapbox trouvé, version:', mapboxgl.version);
        
        mapboxgl.accessToken = 'pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w';

        try {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11', // Utiliser v11 pour compatibilité avec 2.5.1
            center: [-4.0305, 5.3600],
            zoom: 11
          });

          map.current.on('load', () => {
            console.log('🎉 CARTE CHARGÉE ET PRÊTE !');
          });

          map.current.on('error', (e: any) => {
            // Ignorer les erreurs de propriétés inconnues (fog, etc.)
            if (e.error && !e.error.message?.includes('unknown property')) {
              console.error('❌ Erreur carte:', e);
            }
          });

          // Ajouter un marqueur
          new mapboxgl.Marker({ color: 'red' })
            .setLngLat([-4.0305, 5.3600])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Abidjan</h3>'))
            .addTo(map.current);

          console.log('✅ Carte initialisée avec succès');
        } catch (error) {
          console.error('❌ Erreur lors de la création de la carte:', error);
        }
      }
    }, 100);

    // Nettoyer après 10 secondes si rien ne se passe
    setTimeout(() => {
      clearInterval(checkMapbox);
      if (!map.current) {
        console.error('❌ Timeout: Mapbox n\'a pas pu être chargé en 10 secondes');
      }
    }, 10000);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Carte Mapbox Simple (v2.5.1)
        </h1>

        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-blue-900 font-bold">
            Cette carte utilise Mapbox chargé depuis le layout (dans le head)
          </p>
          <p className="text-blue-800 text-sm mt-2">
            Ouvrez la console (F12) pour voir les logs
          </p>
        </div>

        <div 
          id="map"
          ref={mapContainer}
          className="w-full rounded-lg shadow-lg"
          style={{ 
            height: '600px',
            border: '2px solid #3b82f6'
          }}
        />

        <div className="mt-4 bg-green-50 p-4 rounded">
          <h3 className="font-bold text-green-900 mb-2">✅ Vérifications :</h3>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Mapbox GL JS v2.5.1 chargé depuis le layout</li>
            <li>• CSS Mapbox chargé depuis le layout</li>
            <li>• CSS personnalisé map.css chargé</li>
            <li>• ID "map" sur le conteneur</li>
            <li>• Pas de message de chargement qui bloque</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 p-4 rounded">
          <h3 className="font-bold text-yellow-900 mb-2">🔍 Dans la console, vous devriez voir :</h3>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>1. 🚀 Tentative d'initialisation de la carte...</li>
            <li>2. ✅ Mapbox trouvé, version: 2.5.1</li>
            <li>3. ✅ Carte initialisée avec succès</li>
            <li>4. 🎉 CARTE CHARGÉE ET PRÊTE !</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
