'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapLocationProps {
  lat: number | string | null;
  lng: number | string | null;
  quartierName?: string;
  communeName?: string;
}

export default function MapLocation({ lat, lng, quartierName, communeName }: MapLocationProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    
    // Nettoyer complètement le container avant d'initialiser
    if (mapRef.current) {
      console.log('🧹 Nettoyage de la carte existante');
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // Vider le HTML du container et supprimer l'attribut Leaflet
    container.innerHTML = '';
    container.removeAttribute('class');
    // @ts-ignore - Supprimer l'ID interne de Leaflet
    delete (container as any)._leaflet_id;
    
    // Ajouter un délai pour éviter la double initialisation en développement
    const initTimer = setTimeout(() => {
      const initMap = async () => {
      setIsLoading(true);
      
      let latitude: number | null = typeof lat === 'string' ? parseFloat(lat) : (lat as number);
      let longitude: number | null = typeof lng === 'string' ? parseFloat(lng) : (lng as number);

      // Si pas de coordonnées valides, utiliser le géocodage (comme Laravel)
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.log('🔍 Géocodage du quartier:', quartierName);
        
        if (quartierName && communeName) {
          try {
            // Essayer plusieurs variantes du nom pour améliorer le géocodage
            const searchVariants = [
              `${quartierName}, ${communeName}, Abidjan, Côte d'Ivoire`,
              `${quartierName}, Abidjan, Côte d'Ivoire`,
              `Palmeraie, Cocody, Abidjan, Côte d'Ivoire`, // Variante spécifique pour Palmeraie
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
              latitude = 5.3550;  // Zone entre Cocody et Plateau
              longitude = -3.9850;
              console.log('⚠️ Géocodage échoué, coordonnées par défaut (Cocody/Plateau)');
            }
          } catch (error) {
            console.error('❌ Erreur géocodage:', error);
            // Coordonnées par défaut (zone Cocody/Plateau)
            latitude = 5.3550;
            longitude = -3.9850;
          }
        } else {
          // Pas de nom de quartier, utiliser coordonnées par défaut (zone Cocody/Plateau)
          latitude = 5.3550;
          longitude = -3.9850;
        }
      }

      // Vérifier une dernière fois avant d'initialiser
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('❌ Coordonnées toujours invalides après géocodage');
        setIsLoading(false);
        return;
      }

      const currentContainer = mapContainerRef.current;
      if (!currentContainer) {
        console.error('❌ Container disparu');
        setIsLoading(false);
        return;
      }

      // Vérifier que le container a une taille
      const containerRect = currentContainer.getBoundingClientRect();
      console.log('📏 Taille du container:', { width: containerRect.width, height: containerRect.height });
      
      if (containerRect.width === 0 || containerRect.height === 0) {
        console.warn('⚠️ Container sans taille, attendre...');
        setTimeout(() => {
          const newRect = currentContainer.getBoundingClientRect();
          if (newRect.width > 0 && newRect.height > 0) {
            console.log('✅ Container maintenant visible:', newRect);
            initMap();
          }
        }, 200);
        return;
      }

      // Vérifier que le container n'est pas déjà initialisé
      if ((currentContainer as any)._leaflet_id) {
        console.log('⚠️ Container déjà initialisé, nettoyage...');
        currentContainer.innerHTML = '';
        delete (currentContainer as any)._leaflet_id;
      }

      console.log('🗺️ Initialisation de la carte avec:', { lat: latitude, lng: longitude });

      // Initialiser la carte
      let map: L.Map;
      try {
        map = L.map(currentContainer).setView([latitude, longitude], 13);
        mapRef.current = map;
        console.log('✅ Carte initialisée avec succès');
      } catch (error) {
        console.error('❌ Erreur initialisation carte:', error);
        setIsLoading(false);
        return;
      }

      // Ajouter la couche de tuiles (OpenStreetMap)
      console.log('🌍 Ajout de la couche de tuiles...');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      console.log('✅ Couche de tuiles ajoutée');

      // Créer une icône personnalisée pour le marqueur
      console.log('📍 Création du marqueur...');
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
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
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Ajouter le marqueur
      L.marker([latitude, longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 200px;">
            <strong style="font-size: 16px; color: #1f2937;">${quartierName || 'Quartier'}</strong>
            ${communeName ? `<br/><span style="color: #6b7280; font-size: 14px;">${communeName}</span>` : ''}
          </div>
        `)
        .openPopup();

      // Ajouter un cercle rouge semi-transparent comme dans Laravel
      L.circle([latitude, longitude], {
        color: '#fb3a3a',
        fillColor: '#fb3a3a',
        fillOpacity: 0.09,
        radius: 500, // 500 mètres de rayon
        weight: 2,
      }).addTo(map);
      
      console.log('✅ Marqueur et cercle ajoutés');
      setIsLoading(false);
    };

      initMap();
    }, 100); // Délai de 100ms pour éviter la double initialisation

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, quartierName, communeName]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl">
      <div 
        ref={mapContainerRef} 
        className="w-full h-96 z-0"
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
