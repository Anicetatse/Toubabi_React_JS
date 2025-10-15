'use client';

import { useEffect, useRef, useState } from 'react';
import { Quartier } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MapStatsProps {
  quartiers: Quartier[];
}

export default function MapStats({ quartiers }: MapStatsProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [selectedQuartier, setSelectedQuartier] = useState<Quartier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Quartier[]>([]);

  const formatPrice = (price?: string | number | null) => {
    if (!price || price === 0 || price === '-' || price === ' - ') return '-';
    const numPrice = typeof price === 'string' ? parseFloat(price.toString().replace(/\s/g, '')) : price;
    if (isNaN(numPrice)) return '-';
    // Format avec séparateurs de milliers (espaces)
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(numPrice).replace(/\u202f/g, ' ');
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = 'pk.eyJ1Ijoic21pbnRoIiwiYSI6ImNsa3RzOTYzNTAxOTQzcXBlOXQwMTY5dDUifQ.mg4Z24cW-JcY3cviHmZa1w';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-5.5471, 7.5401], // Côte d'Ivoire
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Désactiver le fog pour éviter les warnings de propriétés inconnues
    map.current.on('style.load', () => {
      try { map.current.setFog(null); } catch (_) {}
    });

    map.current.on('load', () => {
      // Logs de debug
      try {
        console.log('[MapStats] quartiers count =', Array.isArray(quartiers) ? quartiers.length : 'non-array');
        console.log('[MapStats] sample quartiers =', (quartiers || []).slice(0, 3));
      } catch (e) {}
      // Animation vers Abidjan
      map.current.flyTo({
        center: [-3.9725785, 5.3647141],
        zoom: window.innerWidth < 768 ? 11 : 12,
        speed: 1,
        curve: 2,
        easing: (t: number) => t * (2 - t),
      });

      // Ajouter les marqueurs
      quartiers.forEach((quartier) => {
        const lng = Number(quartier.lng);
        const lat = Number(quartier.lat);
        if (Number.isNaN(lng) || Number.isNaN(lat)) {
          console.warn('[MapStats] Skip quartier invalid coords', {
            id: (quartier as any)?.id,
            nom: (quartier as any)?.nom,
            lng: quartier.lng,
            lat: quartier.lat,
          });
          return;
        }
        const pmil = formatPrice((quartier as any).prix_min_location);
        const pmal = formatPrice((quartier as any).prix_max_location);
        const pmyl = formatPrice((quartier as any).prix_moy_location);
        const pmiv = formatPrice((quartier as any).prix_min_vente);
        const pmav = formatPrice((quartier as any).prix_max_vente);
        const pmyv = formatPrice((quartier as any).prix_moy_vente);
        const nbreBiens = (quartier as any).nbre_biens || '-';

        const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false, maxWidth: '380px' }).setHTML(`
          <div class="p-4 w-full max-w-[350px]">
            <h4 class="font-bold text-xl mb-2 text-gray-800 break-words">${quartier.nom}</h4>
            <p class="text-base font-bold text-blue-700 mb-4">${nbreBiens} bien(s)</p>
            
            <div class="mb-4">
              <p class="text-sm font-semibold text-blue-700 uppercase mb-3">Location</p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 flex-shrink-0 mr-2">Prix minimum:</span>
                  <span class="font-bold text-blue-700 text-right break-all">${pmil}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 flex-shrink-0 mr-2">Prix moyen:</span>
                  <span class="font-bold text-blue-700 text-right break-all">${pmyl}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 flex-shrink-0 mr-2">Prix maximum:</span>
                  <span class="font-bold text-blue-700 text-right break-all">${pmal}</span>
                </div>
              </div>
            </div>
            
            <div class="mb-4">
              <p class="text-sm font-semibold text-green-700 uppercase mb-3">Vente</p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 flex-shrink-0 mr-2">Prix minimum:</span>
                  <span class="font-bold text-green-700 text-right break-all">${pmiv}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 flex-shrink-0 mr-2">Prix moyen:</span>
                  <span class="font-bold text-green-700 text-right break-all">${pmyv}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 flex-shrink-0 mr-2">Prix maximum:</span>
                  <span class="font-bold text-green-700 text-right break-all">${pmav}</span>
                </div>
              </div>
            </div>
            
            <p class="text-sm text-red-600 mt-4 border-t pt-3">
              <svg class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              Cliquez pour plus de détails
            </p>
          </div>
        `);

        const marker = new mapboxgl.Marker({ color: '#00ff00' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);

        marker.getElement().addEventListener('mouseenter', () => popup.addTo(map.current));
        marker.getElement().addEventListener('mouseleave', () => popup.remove());
        marker.getElement().addEventListener('click', () => {
          console.log('Clicked quartier:', quartier);
          setSelectedQuartier(quartier);
          map.current?.flyTo({
            center: [lng, lat],
            zoom: 13,
            speed: 0.8,
            curve: 1.8,
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
          });
        });
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [quartiers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = quartiers.filter(q => 
        q.nom.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (quartier: Quartier) => {
    setSearchQuery(quartier.nom);
    setSuggestions([]);
    map.current?.flyTo({
      center: [quartier.lng, quartier.lat],
      zoom: 17,
      speed: 1,
      curve: 2,
      easing: (t: number) => t * (2 - t),
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Panneau d'information à droite */}
      {selectedQuartier && (
        <div className="absolute top-0 right-0 bottom-0 z-10 w-full md:w-[450px] lg:w-[600px] xl:w-[700px]">
          <Card className="h-full rounded-none border-l shadow-2xl flex flex-col">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedQuartier.nom}</CardTitle>
                  <p className="text-base text-gray-600 mt-1">{(selectedQuartier as any)?.commune?.nom || ''}</p>
                  <p className="text-base font-bold text-blue-700 mt-1">{(selectedQuartier as any).nbre_biens ?? (selectedQuartier as any).nb_biens ?? '-'} bien(s)</p>
                  {/* <p className="text-sm text-gray-500 mt-1">
                    {((selectedQuartier as any).prix?.length || 0)} type(s) de biens disponibles
                  </p> */}
                </div>
                <button
                  onClick={() => setSelectedQuartier(null)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {/* LOCATION section */}
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-base font-semibold text-amber-900 mb-4">LOCATION</p>
                  {(selectedQuartier as any).prix?.filter((prix: any) => prix.nbre_biens_location > 0).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-amber-100">
                            <th className="p-3 text-left font-semibold">Types de biens</th>
                            <th className="p-3 text-left font-semibold">Prix minimum</th>
                            <th className="p-3 text-left font-semibold">Prix moyen</th>
                            <th className="p-3 text-left font-semibold">Prix maximum</th>
                            <th className="p-3 text-left font-semibold">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedQuartier as any).prix?.filter((prix: any) => prix.nbre_biens_location > 0).map((prix: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-25'}>
                              <td className="p-3 font-medium">{prix.type}</td>
                              <td className="p-3 text-blue-700 font-bold">{formatPrice(prix.prix_min_location)}</td>
                              <td className="p-3 text-blue-700 font-bold">{formatPrice(prix.prix_moy_location)}</td>
                              <td className="p-3 text-blue-700 font-bold">{formatPrice(prix.prix_max_location)}</td>
                              <td className="p-3 text-blue-700 font-bold">{prix.nbre_biens_location || '-'}</td>
                            </tr>
                          ))}
                          
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">Aucun bien en location disponible</p>
                  )}
                </div>

                {/* VENTE section */}
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-base font-semibold text-amber-900 mb-4">VENTE</p>
                  {(selectedQuartier as any).prix?.filter((prix: any) => prix.nbre_biens_vente > 0).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-amber-100">
                            <th className="p-3 text-left font-semibold">Types de biens</th>
                            <th className="p-3 text-left font-semibold">Prix minimum</th>
                            <th className="p-3 text-left font-semibold">Prix moyen</th>
                            <th className="p-3 text-left font-semibold">Prix maximum</th>
                            <th className="p-3 text-left font-semibold">Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedQuartier as any).prix?.filter((prix: any) => prix.nbre_biens_vente > 0).map((prix: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-amber-25'}>
                              <td className="p-3 font-medium">{prix.type}</td>
                              <td className="p-3 text-green-700 font-bold">{formatPrice(prix.prix_min_vente)}</td>
                              <td className="p-3 text-green-700 font-bold">{formatPrice(prix.prix_moy_vente)}</td>
                              <td className="p-3 text-green-700 font-bold">{formatPrice(prix.prix_max_vente)}</td>
                              <td className="p-3 text-green-700 font-bold">{prix.nbre_biens_vente || '-'}</td>
                            </tr>
                          ))}
                          
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">Aucun bien en vente disponible</p>
                  )}
                </div>

                {/* Information */}
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Conscients de l'importance du prix au m² bâti pour les publics avertis, nos analystes sont à l'œuvre pour vous fournir les moyennes les plus fiables sur toute l'étendue du territoire ivoirien. Dans l'attente, Toubabi vous offre en exclusivité les prix moyens des biens dans toutes les zones d'intérêt majeur.
                  </p>
                  <p className="text-sm text-amber-700 mt-3 font-semibold">
                    * Ces données proviennent des principaux sites d'annonces immobilières en Côte d'Ivoire, les moyennes obtenues sont fonction des données disponibles.
                  </p>
                </div>

                {/* Contact */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-base font-semibold text-blue-900 mb-3">NOUS CONTACTER</p>
                  <div className="text-base text-blue-800">
                    <div className="flex items-center justify-between gap-4">
                      <p className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        contact@toubabi.com
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +225 05 85 32 50 50
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="absolute top-4 left-4 z-20">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un quartier..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-lg"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((quartier) => (
                <div
                  key={quartier.id}
                  onClick={() => handleSuggestionClick(quartier)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {quartier.nom}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
