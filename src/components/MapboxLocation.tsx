'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapboxLocationProps {
  lat: number | string | null;
  lng: number | string | null;
  quartierName?: string;
  communeName?: string;
}

export default function MapboxLocation({ lat, lng, quartierName, communeName }: MapboxLocationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Nettoyer la carte existante
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    const initMap = async () => {
      setIsLoading(true);
      
      let latitude: number | null = typeof lat === 'string' ? parseFloat(lat) : (lat as number);
      let longitude: number | null = typeof lng === 'string' ? parseFloat(lng) : (lng as number);

      // Si pas de coordonnées valides, utiliser le géocodage
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.log('🔍 Géocodage du quartier:', quartierName);
        
        if (quartierName && communeName) {
          try {
            // Essayer plusieurs variantes du nom pour améliorer le géocodage
            const searchVariants = [
              `${quartierName}, ${communeName}, Abidjan, Côte d'Ivoire`,
              `${quartierName}, Abidjan, Côte d'Ivoire`,
              `Palmeraie, Cocody, Abidjan, Côte d'Ivoire`,
              `Grand rond-point, Cocody, Abidjan, Côte d'Ivoire`
            ];
            
            let data = null;
            for (const searchQuery of searchVariants) {
              console.log('🔍 Tentative géocodage:', searchQuery);
              const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
                { headers: { 'User-Agent': 'Toubabi Real Estate App' } }
              );
              data = await response.json();
              
              if (data && data.length > 0) {
                console.log('✅ Géocodage réussi avec:', searchQuery);
                break;
              }
            }
            
            if (data && data.length > 0) {
              latitude = parseFloat(data[0].lat);
              longitude = parseFloat(data[0].lon);
              console.log('✅ Géocodage réussi:', { lat: latitude, lng: longitude });
            } else {
              // Coordonnées par défaut (zone Cocody/Plateau)
              latitude = 5.3550;
              longitude = -3.9850;
              console.log('⚠️ Géocodage échoué, coordonnées par défaut (Cocody/Plateau)');
            }
          } catch (error) {
            console.error('❌ Erreur géocodage:', error);
            latitude = 5.3550;
            longitude = -3.9850;
          }
        } else {
          latitude = 5.3550;
          longitude = -3.9850;
        }
      }

      // Vérifier les coordonnées finales
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('❌ Coordonnées invalides');
        setIsLoading(false);
        return;
      }

      console.log('🗺️ Initialisation Mapbox avec:', { lat: latitude, lng: longitude });

      // Initialiser Mapbox avec style OpenStreetMap gratuit
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: [longitude, latitude],
        zoom: 13,
        attributionControl: false
      });

      // Ajouter les contrôles de navigation
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Créer un marqueur personnalisé
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      // Ajouter le marqueur
      new mapboxgl.Marker(markerEl)
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="text-align: center; padding: 8px; min-width: 200px;">
                <strong style="font-size: 16px; color: #1f2937;">${quartierName || 'Quartier'}</strong>
                ${communeName ? `<br/><span style="color: #6b7280; font-size: 14px;">${communeName}</span>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      // Ouvrir automatiquement le popup
      setTimeout(() => {
        if (map.current) {
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setLngLat([longitude, latitude])
            .setHTML(`
              <div style="text-align: center; padding: 8px; min-width: 200px;">
                <strong style="font-size: 16px; color: #1f2937;">${quartierName || 'Quartier'}</strong>
                ${communeName ? `<br/><span style="color: #6b7280; font-size: 14px;">${communeName}</span>` : ''}
              </div>
            `)
            .addTo(map.current);
        }
      }, 500);

      console.log('✅ Carte Mapbox initialisée avec succès');
      setIsLoading(false);
    };

    // Délai pour éviter la double initialisation
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lat, lng, quartierName, communeName]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl">
      <div 
        ref={mapContainer} 
        className="w-full h-96"
        style={{ height: '384px' }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}
