import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint pour la cartographie bâti (construction)
// Calcule les prix min/max/moy par type de bien comme dans CartographieController::index()
export async function GET(request: NextRequest) {
  try {
    console.log('[API quartiers-carto] Starting query...');
    
    // Récupérer tous les quartiers avec coordonnées + commune
    const quartiers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        q.id, q.nom, q.lng, q.lat,
        q.prix_min_location, q.prix_moy_location, q.prix_max_location,
        q.prix_min_vente, q.prix_moy_vente, q.prix_max_vente,
        c.id as commune_id, c.nom as commune_nom, c.image as commune_image
      FROM quartiers q
      INNER JOIN communes c ON q.id_commune = c.id
      WHERE q.lng IS NOT NULL 
        AND q.lat IS NOT NULL 
        AND q.enabled = 1 
        AND q.deleted_at IS NULL
        AND (q.prix_min_location IS NOT NULL OR q.prix_min_vente IS NOT NULL)
      ORDER BY q.nom ASC
    `);
    
    console.log(`[API quartiers-carto] Found ${quartiers.length} quartiers`);

    // Récupérer les statistiques détaillées par type de bien pour chaque quartier
    const statsParQuartier = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        p.id_quartier,
        cat.nom as categorie_nom,
        sous.nom as souscategorie_nom,
        p.piece,
        p.type_annonce,
        MIN(p.prix_vente) as prix_min,
        MAX(p.prix_vente) as prix_max,
        ROUND(AVG(p.prix_vente)) as prix_moy,
        COUNT(*) as nb_biens
      FROM produits p
      INNER JOIN categories cat ON p.code_categorie = cat.code
      LEFT JOIN souscategories sous ON p.code_souscategorie = sous.code
      WHERE p.enabled = 1 
        AND p.deleted_at IS NULL
        AND p.id_quartier IS NOT NULL
        AND p.id_quartier IN (${quartiers.map(q => q.id).join(',')})
      GROUP BY p.id_quartier, cat.nom, sous.nom, p.piece, p.type_annonce
      ORDER BY p.id_quartier, cat.nom, sous.nom, p.piece
    `);

    const locations = quartiers.map(quartier => {
      const prix_min_location = quartier.prix_min_location ? Number(quartier.prix_min_location) : null;
      const prix_max_location = quartier.prix_max_location ? Number(quartier.prix_max_location) : null;
      const prix_moy_location = quartier.prix_moy_location ? Number(quartier.prix_moy_location) : null;
      const prix_min_vente = quartier.prix_min_vente ? Number(quartier.prix_min_vente) : null;
      const prix_max_vente = quartier.prix_max_vente ? Number(quartier.prix_max_vente) : null;
      const prix_moy_vente = quartier.prix_moy_vente ? Number(quartier.prix_moy_vente) : null;

      // Récupérer les stats de ce quartier
      const statsQuartier = statsParQuartier.filter(s => Number(s.id_quartier) === Number(quartier.id));
      
      // Regrouper par type de bien
      const typesMap = new Map<string, any>();
      
      for (const stat of statsQuartier) {
        // Construire le nom du type comme dans Laravel
        let typeBien = stat.categorie_nom;
        if (stat.souscategorie_nom) {
          typeBien += ` ${stat.souscategorie_nom}`;
        }
        // Pour les appartements, ajouter le nombre de pièces
        if (stat.categorie_nom.toLowerCase().includes('appartement') && stat.piece > 0) {
          typeBien += ` ${stat.piece} pièce${stat.piece > 1 ? 's' : ''}`;
        }
        
        if (!typesMap.has(typeBien)) {
          typesMap.set(typeBien, {
            type: typeBien,
            prix_min_location: null,
            prix_moy_location: null,
            prix_max_location: null,
            prix_min_vente: null,
            prix_moy_vente: null,
            prix_max_vente: null,
          });
        }
        
        const typeData = typesMap.get(typeBien);
        if (stat.type_annonce === 'louer') {
          typeData.prix_min_location = Number(stat.prix_min);
          typeData.prix_moy_location = Number(stat.prix_moy);
          typeData.prix_max_location = Number(stat.prix_max);
        } else if (stat.type_annonce === 'acheter') {
          typeData.prix_min_vente = Number(stat.prix_min);
          typeData.prix_moy_vente = Number(stat.prix_moy);
          typeData.prix_max_vente = Number(stat.prix_max);
        }
      }
      
      // Convertir en tableau et formater
      const tableauPrix = Array.from(typesMap.values()).map(type => ({
        type: type.type,
        prix_min_location: type.prix_min_location ?? ' - ',
        prix_moy_location: type.prix_moy_location ?? ' - ',
        prix_max_location: type.prix_max_location ?? ' - ',
        prix_min_vente: type.prix_min_vente ?? ' - ',
        prix_moy_vente: type.prix_moy_vente ?? ' - ',
        prix_max_vente: type.prix_max_vente ?? ' - ',
      }));

      return {
        id: String(quartier.id),
        nom: quartier.nom,
        titre: quartier.nom,
        lng: Number(quartier.lng),
        lat: Number(quartier.lat),
        commune: {
          id: String(quartier.commune_id),
          nom: quartier.commune_nom,
          image: quartier.commune_image || '/assets/images/communes/default.jpg',
        },
        prix_min_location,
        prix_max_location,
        prix_moy_location,
        prix_min_vente,
        prix_max_vente,
        prix_moy_vente,
        prix: tableauPrix,
      };
    });

    console.log(`[API quartiers-carto] Returning ${locations.length} locations`);
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    console.error('[API quartiers-carto] Error:', error);
    console.error('[API quartiers-carto] Error message:', error?.message);
    console.error('[API quartiers-carto] Error stack:', error?.stack);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quartiers carto', message: error?.message },
      { status: 500 }
    );
  }
}
