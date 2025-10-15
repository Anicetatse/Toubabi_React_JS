'use client';

import { useEffect, useRef, useState } from 'react';
import { Quartier } from '@/types';

interface MapDirectProps {
  quartiers: Quartier[];
  onQuartierClick?: (quartier: Quartier) => void;
  selectedQuartier?: Quartier | null;
}

export function MapDirect({ quartiers, onQuartierClick, selectedQuartier }: MapDirectProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const activePopup = useRef<any>(null); // Popup unique réutilisé
  const isInteracting = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapContainer.current || map.current) return;

      console.log('🚀 Initialisation de la carte des quartiers...');

      if (typeof window === 'undefined') return;

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) {
        console.log('❌ Mapbox GL JS non disponible');
        setError('Mapbox GL JS non disponible');
        setIsLoading(false);
        return;
      }

      try {
        // Token du projet PHP
        mapboxgl.accessToken = 'pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w';

        // Créer la carte
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11', // Utiliser v11 au lieu de v12 pour compatibilité
          center: [-4.0305, 5.3600], // Abidjan
          zoom: 11,
          // Zoom standard activé
          scrollZoom: true,
          boxZoom: true, // zoom par rectangle
          dragRotate: false, // pas de rotation au drag
          touchZoomRotate: true, // autoriser le pinch sur mobile (rotation désactivée plus bas)
          doubleClickZoom: true, // zoom au double‑clic
          keyboard: true // +/- clavier
        });

        // Ajouter NavigationControl (uniquement boutons, pas de boussole)
        map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: false, showZoom: true, showCompass: false }), 'top-right');

        // Empêcher la rotation via les gestes
        if (map.current.touchZoomRotate && typeof map.current.touchZoomRotate.disableRotation === 'function') {
          map.current.touchZoomRotate.disableRotation();
        }

        // Optionnel: réduire la sensibilité au zoom molette (plus doux)
        if (map.current.scrollZoom && typeof map.current.scrollZoom.setWheelZoomRate === 'function') {
          map.current.scrollZoom.setWheelZoomRate(1/600);
        }

        // Événement de chargement
        map.current.on('load', () => {
          console.log('✅ Carte chargée');

          // Créer un popup unique réutilisable
          if (!activePopup.current) {
            const mapboxgl = (window as any).mapboxgl;
            activePopup.current = new mapboxgl.Popup({ offset: 12, closeButton: true, closeOnClick: false, closeOnMove: true, maxWidth: '320px', focusAfterOpen: false });
            activePopup.current.on('close', () => { /* rien à faire, on réutilise */ });
          }
          
          // Ajouter GeolocateControl APRÈS le chargement de la carte
          try {
            map.current.addControl(new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true
              },
              trackUserLocation: true,
              showUserHeading: true
            }), 'top-right');
            console.log('✅ GeolocateControl ajouté');
          } catch (err) {
            console.warn('⚠️ GeolocateControl non disponible:', err);
          }
          
          setIsLoading(false);
          addQuartiersMarkers();
        });

        // Fermer tout popup lors d'un déplacement de la carte
        map.current.on('movestart', () => {
          isInteracting.current = true;
          // Fermer tous les popups visibles
          try { document.querySelectorAll('.mapboxgl-popup').forEach(el => el.remove()); } catch (_) {}
        });

        map.current.on('moveend', () => {
          // petit debounce avant de réactiver les popups au survol
          setTimeout(() => { isInteracting.current = false; }, 150);
        });

        // Fermer les popups quand la souris quitte la carte ou lors d'un scroll
        const canvas = map.current.getCanvas();
        const closeActive = () => {
          isInteracting.current = true;
          // Fermer tous les popups visibles
          try { document.querySelectorAll('.mapboxgl-popup').forEach(el => el.remove()); } catch (_) {}
          // Relâcher le blocage hover peu après les interactions de wheel/leave
          setTimeout(() => { isInteracting.current = false; }, 200);
        };
        canvas.addEventListener('mouseleave', closeActive);
        canvas.addEventListener('wheel', closeActive, { passive: true });

        map.current.on('error', (e: any) => {
          console.error('❌ Erreur carte:', e);
          // Ne pas afficher d'erreur pour les erreurs de style (fog, etc.)
          if (e.error && !e.error.message?.includes('unknown property')) {
            setError(`Erreur: ${e.error?.message || 'Erreur inconnue'}`);
          }
          setIsLoading(false);
        });

        console.log('✅ Carte créée avec succès');

      } catch (err) {
        console.error('❌ Erreur création carte:', err);
        setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setIsLoading(false);
      }
    };

    const addQuartiersMarkers = () => {
      if (!map.current) return;

      const mapboxgl = (window as any).mapboxgl;
      if (!mapboxgl) return;

      // Supprimer les anciens marqueurs et tout popup actif
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (activePopup.current) {
        try { activePopup.current.remove(); } catch (_) {}
        activePopup.current = null;
      }

      console.log(`📍 Ajout de ${quartiers.length} marqueurs...`);

      // Ajouter un marqueur pour chaque quartier
      quartiers.forEach((quartier) => {
        if (!quartier.lat || !quartier.lng) return;

        const lat = typeof quartier.lat === 'string' ? parseFloat(quartier.lat) : quartier.lat;
        const lng = typeof quartier.lng === 'string' ? parseFloat(quartier.lng) : quartier.lng;

        if (isNaN(lat) || isNaN(lng)) return;

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

        // Créer le popup avec les informations du quartier
        const popupHTML = `
          <div class="p-3 min-w-[260px] max-w-[320px]">
            <h3 class="font-bold text-lg text-blue-600">${quartier.nom}</h3>
            <p class="text-xs font-semibold text-red-600 mt-1 mb-2">Index DGI (prix/m²)</p>
            <div class="space-y-3 text-sm max-h-[220px] overflow-auto">
              <div>
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="border border-gray-300 p-2 text-left text-xs font-semibold">Valeur Vénale * (F CFA)</th>
                      <th class="border border-gray-300 p-2 text-left text-xs font-semibold">Valeur Marchande * (F CFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border border-gray-300 p-2 text-blue-700 font-bold">
                        ${quartier.prix_venal ? formatPrice(quartier.prix_venal) : '-'}
                      </td>
                      <td class="border border-gray-300 p-2 text-green-700 font-bold">
                        ${quartier.prix_marchand ? formatPrice(quartier.prix_marchand) : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `;

        // Utiliser le popup unique (pas de création par marqueur)

        // Créer le marqueur
        const marker = new mapboxgl.Marker({ color: '#2563eb' })
          .setLngLat([lng, lat])
          .addTo(map.current);

        const markerElement = marker.getElement();

        // Ajouter un événement hover pour afficher le popup (un seul à la fois)
        markerElement.addEventListener('mouseenter', () => {
          if (isInteracting.current) return; // ne rien ouvrir pendant le scroll/drag
          const popup = activePopup.current;
          if (!popup) return;
          // Hard-kill tout popup résiduel rendu par Mapbox
          try { document.querySelectorAll('.mapboxgl-popup').forEach(el => el.remove()); } catch (_) {}
          try { popup.remove(); } catch (_) {}
          popup.setHTML(popupHTML).setLngLat([lng, lat]).addTo(map.current);
        });

        // fermer aussi si on entre dans un autre marqueur
        markerElement.addEventListener('mouseenter', () => {
          const others = document.querySelectorAll('.mapboxgl-popup');
          if (others.length > 1) {
            others.forEach((el, idx) => { if (idx < others.length - 1) el.remove(); });
          }
        });

        // Cacher le popup quand la souris quitte le marqueur
        markerElement.addEventListener('mouseleave', () => {
          // Fermer au départ du marqueur après un court délai (évite flicker entre marqueurs proches)
          setTimeout(() => {
            if (isInteracting.current) return;
            const popup = activePopup.current;
            if (popup) { try { popup.remove(); } catch (_) {} }
          }, 80);
        });

        // Ajouter un événement click pour zoomer et afficher les détails
        markerElement.addEventListener('click', () => {
          if (onQuartierClick) {
            onQuartierClick(quartier);
          }
        });

        markers.current.push(marker);
      });

      console.log(`✅ ${markers.current.length} marqueurs ajoutés`);
    };

    // Charger le script Mapbox
    const loadMapbox = () => {
      if ((window as any).mapboxgl) {
        console.log('✅ Mapbox déjà chargé');
        initMap();
        return;
      }

      console.log('📥 Chargement de Mapbox GL JS...');

      // Charger le CSS d'abord (version 2.5.1 comme le PHP)
      const existingCSS = document.querySelector('link[href*="mapbox-gl.css"]');
      if (!existingCSS) {
        const cssLink = document.createElement('link');
        cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v2.5.1/mapbox-gl.css';
        cssLink.rel = 'stylesheet';
        cssLink.onload = () => {
          console.log('✅ CSS Mapbox chargé');
          loadMapboxScript();
        };
        document.head.appendChild(cssLink);
      } else {
        console.log('✅ CSS Mapbox déjà présent');
        loadMapboxScript();
      }
    };

    const loadMapboxScript = () => {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.5.1/mapbox-gl.js';
      script.async = true;

      script.onload = () => {
        console.log('✅ Script Mapbox chargé');
        // Attendre que le CSS soit bien appliqué
        setTimeout(initMap, 300);
      };

      script.onerror = () => {
        console.error('❌ Erreur chargement script Mapbox');
        setError('Erreur de chargement de Mapbox');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadMapbox();

    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs quand les quartiers changent
  useEffect(() => {
    if (map.current && !isLoading && quartiers.length > 0) {
      const mapboxgl = (window as any).mapboxgl;
      if (mapboxgl) {

        // Supprimer les anciens marqueurs
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Ajouter les nouveaux
        quartiers.forEach((quartier) => {
          if (!quartier.lat || !quartier.lng) return;

          const lat = typeof quartier.lat === 'string' ? parseFloat(quartier.lat) : quartier.lat;
          const lng = typeof quartier.lng === 'string' ? parseFloat(quartier.lng) : quartier.lng;

          if (isNaN(lat) || isNaN(lng)) return;

          const formatPrice = (price?: string | number | null) => {
            if (!price) return 'Prix non disponible';
            const numPrice = typeof price === 'string' ? parseFloat(price) : price;
            if (isNaN(numPrice)) return 'Prix non disponible';
            // Ajouter des espaces tous les 3 chiffres depuis la droite
            const formatted = numPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            return formatted + ' FCFA';
          };

          
          const popupHTML = `
            <div class="p-3 min-w-[280px]">
              <h3 class="font-bold text-lg mb-3 text-blue-600">${quartier.nom}</h3>
              <p class="text-xs font-semibold text-red-600 mt-1 mb-2">Index DGI (prix/m²)</p>
              <div class="space-y-3 text-sm max-h-[220px] overflow-auto">
                <div>
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="border border-gray-300 p-2 text-left text-xs font-semibold">Valeur Vénale * (FCFA)</th>
                        <th class="border border-gray-300 p-2 text-left text-xs font-semibold">Valeur Marchande * (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 p-2 text-blue-700 font-bold">
                          ${quartier.prix_venal ? formatPrice(quartier.prix_venal) : '-'}
                        </td>
                        <td class="border border-gray-300 p-2 text-green-700 font-bold">
                          ${quartier.prix_marchand ? formatPrice(quartier.prix_marchand) : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="bg-gray-100">
                        <th class="border border-gray-300 p-2 text-left text-xs font-semibold">Coût estimatif actualisé ** (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 p-2 text-purple-700 font-bold">
                          ${quartier.prix_moyen ? formatPrice(quartier.prix_moyen) : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          `;

          const marker = new mapboxgl.Marker({ color: '#2563eb' })
            .setLngLat([lng, lat])
            .addTo(map.current);

          const markerElement = marker.getElement();

          // Créer un popup pour ce marqueur (offset/anchor pour éviter le recouvrement du marker)
          const popup = new mapboxgl.Popup({
            offset: 30,
            closeButton: true,
            closeOnClick: false,
            maxWidth: '320px',
            anchor: 'top'
          }).setHTML(popupHTML);

          // Attacher le popup au marqueur
          marker.setPopup(popup);

          // Au survol du marqueur, affichez le popup (EXACTEMENT comme dans le code original)
          markerElement.addEventListener('mouseenter', () => popup.addTo(map.current));
          markerElement.addEventListener('mouseleave', () => popup.remove());

          // Ajouter un événement click pour zoomer et afficher les détails
          markerElement.addEventListener('click', () => {
            if (onQuartierClick) {
              onQuartierClick(quartier);
            }
          });

          markers.current.push(marker);
        });
      }
    }
  }, [quartiers, isLoading, onQuartierClick]);

  // Zoomer sur le quartier sélectionné
  useEffect(() => {
    if (!map.current || !selectedQuartier || !selectedQuartier.lat || !selectedQuartier.lng) return;

    const lat = typeof selectedQuartier.lat === 'string' 
      ? parseFloat(selectedQuartier.lat) 
      : selectedQuartier.lat;
    const lng = typeof selectedQuartier.lng === 'string' 
      ? parseFloat(selectedQuartier.lng) 
      : selectedQuartier.lng;

    if (isNaN(lat) || isNaN(lng)) return;

    console.log(`🎯 Zoom sur ${selectedQuartier.nom} (${lat}, ${lng})`);
    
    // Animer le zoom vers le quartier
    map.current.flyTo({
      center: [lng, lat],
      zoom: 15, // Zoom plus proche pour voir le quartier
      duration: 1500, // Animation de 1.5 secondes
      essential: true
    });
  }, [selectedQuartier]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <div className="text-red-600 text-2xl mb-2">⚠️</div>
          <p className="text-red-800 font-semibold">{error}</p>
          <p className="text-red-600 text-sm mt-2">Vérifiez la console pour plus de détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      <div 
        id="map"
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          minHeight: '500px',
          zIndex: 1
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-700 font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}
