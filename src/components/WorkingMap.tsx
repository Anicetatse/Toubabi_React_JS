'use client';

import React, { useState, useEffect } from 'react';

export function WorkingMap() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [MapComponent, setMapComponent] = useState<any>(null);
  const [quartiers, setQuartiers] = useState<any[]>([]);

  // Charger le composant Map de façon asynchrone
  useEffect(() => {
    const loadMap = async () => {
      try {
        // Charger les quartiers depuis l'API
        const response = await fetch('/api/quartiers');
        const result = await response.json();
        setQuartiers(result.data || []);

        // Charger react-map-gl de façon dynamique
        const { default: Map, Marker, Popup } = await import('react-map-gl');
        
        setMapComponent(() => {
          const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
          
          if (!MAPBOX_TOKEN) {
            return () => (
              <div className="flex h-96 items-center justify-center bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-600 font-medium">
                  Token Mapbox manquant !
                </p>
              </div>
            );
          }

          return () => {
            const [viewport, setViewport] = useState({
              longitude: -4.0305,
              latitude: 5.3600,
              zoom: 11,
            });

            const [selectedQuartier, setSelectedQuartier] = useState<any>(null);

            return (
              <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden">
                <Map
                  {...viewport}
                  onMove={(evt) => setViewport(evt.viewState)}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Marqueurs pour les quartiers avec coordonnées */}
                  {quartiers
                    .filter((q: any) => q.lat && q.lng)
                    .slice(0, 10) // Limiter à 10 pour éviter la surcharge
                    .map((quartier: any) => (
                      <Marker
                        key={quartier.id}
                        longitude={parseFloat(quartier.lng)}
                        latitude={parseFloat(quartier.lat)}
                        onClick={() => setSelectedQuartier(quartier)}
                      >
                        <div className="cursor-pointer bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {quartier.nom?.charAt(0) || 'Q'}
                        </div>
                      </Marker>
                    ))}

                  {/* Popup pour afficher les détails */}
                  {selectedQuartier && selectedQuartier.lng && selectedQuartier.lat && (
                    <Popup
                      longitude={parseFloat(selectedQuartier.lng)}
                      latitude={parseFloat(selectedQuartier.lat)}
                      onClose={() => setSelectedQuartier(null)}
                      closeButton={true}
                    >
                      <div className="p-2">
                        <h3 className="font-bold">{selectedQuartier.nom}</h3>
                        {selectedQuartier.prix_moyen && (
                          <p className="text-sm text-blue-600">
                            Prix: {parseFloat(selectedQuartier.prix_moyen).toLocaleString()} FCFA/m²
                          </p>
                        )}
                      </div>
                    </Popup>
                  )}
                </Map>
              </div>
            );
          };
        });

        setIsLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
      }
    };

    loadMap();
  }, []);

  if (!isLoaded || !MapComponent) {
    return (
      <div className="flex h-96 items-center justify-center bg-gray-100 border border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Carte des quartiers ({quartiers.filter((q: any) => q.lat && q.lng).length} avec coordonnées)
      </h2>
      <MapComponent />
      <div className="mt-4 text-sm text-gray-600">
        <p>Token Mapbox: {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? '✅ Configuré' : '❌ Manquant'}</p>
        <p>Total quartiers: {quartiers.length}</p>
      </div>
    </div>
  );
}
