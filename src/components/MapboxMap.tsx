'use client';

import React, { useState, useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [quartiers, setQuartiers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // Charger les quartiers depuis l'API
        const response = await fetch('/api/quartiers');
        const result = await response.json();
        setQuartiers(result.data || []);

        // Charger Mapbox GL JS dynamiquement
        const mapboxgl = (await import('mapbox-gl')).default;
        
        // Token Mapbox (même que dans le PHP)
        mapboxgl.accessToken = "pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w";

        // Coordonnées par défaut (même que dans le PHP)
        let defaultZoom = 11;
        let defaultCoord = [-3.9725785, 5.3647141];

        if (window.innerWidth < 768) {
          defaultZoom = 11;
          defaultCoord = [-3.9725785, 5.3647141];
        }

        // Créer la carte
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-5.5471, 7.5401], // Côte d'Ivoire
          zoom: 4,
        });

        // Ajouter les contrôles de navigation
        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.on('load', function() {
          // Animation vers Abidjan
          map.current.flyTo({
            center: defaultCoord,
            zoom: defaultZoom,
            speed: 1,
            curve: 2,
            easing: function(t: number) {
              return t * (2 - t);
            },
          });

          // Ajouter les marqueurs
          addMarkers();
          setIsLoaded(true);
        });

      } catch (error) {
        console.error('Erreur lors du chargement de la carte:', error);
      }
    };

    loadMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addMarkers = () => {
    if (!map.current || !quartiers.length) return;

    const mapboxgl = (window as any).mapboxgl;
    
    // Filtrer les quartiers avec coordonnées valides
    const quartiersAvecCoords = quartiers.filter((q: any) => 
      q.lat && q.lng && !isNaN(parseFloat(q.lat)) && !isNaN(parseFloat(q.lng))
    );

    quartiersAvecCoords.slice(0, 10).forEach((quartier: any) => {
      // Créer l'élément marqueur personnalisé
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div style="
          width: 30px;
          height: 30px;
          background-color: #E00034;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${quartier.nom?.charAt(0) || 'Q'}
        </div>
      `;

      // Créer le popup
      const popup = new mapboxgl.Popup({
        offset: 25,
      }).setHTML(`
        <div class="popup-content">
          <h4 style="margin: 0 0 10px 0; font-weight: bold;">${quartier.nom}</h4>
          <div style="font-size: 14px;">
            ${quartier.prix_moyen ? `
              <p style="margin: 5px 0;"><strong>Prix moyen:</strong> ${formatNumberWithSpaces(parseFloat(quartier.prix_moyen))} FCFA/m²</p>
            ` : ''}
            ${quartier.prix_min_vente ? `
              <p style="margin: 5px 0;"><strong>Prix min vente:</strong> ${formatNumberWithSpaces(parseFloat(quartier.prix_min_vente))} FCFA/m²</p>
            ` : ''}
            ${quartier.prix_max_vente ? `
              <p style="margin: 5px 0;"><strong>Prix max vente:</strong> ${formatNumberWithSpaces(parseFloat(quartier.prix_max_vente))} FCFA/m²</p>
            ` : ''}
          </div>
        </div>
      `);

      // Créer et ajouter le marqueur
      const marker = new mapboxgl.Marker(el)
        .setLngLat([parseFloat(quartier.lng), parseFloat(quartier.lat)])
        .setPopup(popup)
        .addTo(map.current);

      // Événements de survol
      el.addEventListener('mouseenter', () => popup.addTo(map.current));
      el.addEventListener('mouseleave', () => popup.remove());
    });
  };

  const formatNumberWithSpaces = (number: number) => {
    return number.toLocaleString('fr-FR').replace(/,/g, ' ');
  };

  // Recharger les marqueurs quand les quartiers changent
  useEffect(() => {
    if (map.current && quartiers.length > 0) {
      addMarkers();
    }
  }, [quartiers]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg">
        <h3 className="font-semibold text-blue-900">Carte des quartiers Toubabi</h3>
        <p className="text-blue-800 text-sm">
          {quartiers.filter((q: any) => q.lat && q.lng).length} quartiers avec coordonnées sur {quartiers.length} total
        </p>
      </div>
      
      <div className="h-96 w-full border border-gray-300 rounded-lg overflow-hidden relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
    </div>
  );
}
