import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint pour les stats (calculs depuis produits) - basé sur CartographieController::stats()
export async function GET(request: NextRequest) {
  try {
    // Récupérer les quartiers avec leurs produits (comme dans le contrôleur PHP)
    const quartiers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        q.id,
        q.nom,
        q.lng,
        q.lat,
        c.id as commune_id,
        c.nom as commune_nom,
        c.image as commune_image
      FROM quartiers q
      LEFT JOIN communes c ON q.id_commune = c.id
      WHERE q.lng IS NOT NULL AND q.lat IS NOT NULL
    `);

    const locations: any[] = [];

    for (const quartier of quartiers) {
      // Récupérer les produits de ce quartier
      const produits = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          p.code,
          p.prix_vente,
          p.type_annonce,
          cat.nom as categorie_nom,
          sous.nom as souscategorie_nom
        FROM produits p
        INNER JOIN categories cat ON p.code_categorie = cat.code
        LEFT JOIN souscategories sous ON p.code_souscategorie = sous.code
        WHERE p.enabled = 1 
          AND p.deleted_at IS NULL
          AND p.id_quartier = ${quartier.id}
      `);

      if (produits.length === 0) continue;

      // Préparation des listes pour les calculs par type de bien
      const statsTypes: { [key: string]: any } = {};
      const prixLocation: number[] = [];
      const prixVente: number[] = [];

      for (const produit of produits) {
        const typeBien = produit.categorie_nom || 'General';
        
        if (!statsTypes[typeBien]) {
          statsTypes[typeBien] = {
            type: typeBien,
            nbre_biens_location: 0,
            nbre_biens_vente: 0,
            prix_min_location: null,
            prix_moy_location: null,
            prix_max_location: null,
            prix_min_vente: null,
            prix_moy_vente: null,
            prix_max_vente: null,
            prix_location_list: [],
            prix_vente_list: []
          };
        }

        if (produit.type_annonce === 'louer') {
          const prix = Number(produit.prix_vente);
          prixLocation.push(prix);
          statsTypes[typeBien].prix_location_list.push(prix);
          statsTypes[typeBien].nbre_biens_location++;
          statsTypes[typeBien].prix_min_location = statsTypes[typeBien].prix_min_location === null 
            ? prix 
            : Math.min(statsTypes[typeBien].prix_min_location, prix);
          statsTypes[typeBien].prix_max_location = statsTypes[typeBien].prix_max_location === null 
            ? prix 
            : Math.max(statsTypes[typeBien].prix_max_location, prix);
        } else if (produit.type_annonce === 'acheter') {
          const prix = Number(produit.prix_vente);
          prixVente.push(prix);
          statsTypes[typeBien].prix_vente_list.push(prix);
          statsTypes[typeBien].nbre_biens_vente++;
          statsTypes[typeBien].prix_min_vente = statsTypes[typeBien].prix_min_vente === null 
            ? prix 
            : Math.min(statsTypes[typeBien].prix_min_vente, prix);
          statsTypes[typeBien].prix_max_vente = statsTypes[typeBien].prix_max_vente === null 
            ? prix 
            : Math.max(statsTypes[typeBien].prix_max_vente, prix);
        }
      }

      // Calculer les prix moyens après avoir collecté tous les prix
      for (const typeBien in statsTypes) {
        const stats = statsTypes[typeBien];
        if (stats.prix_location_list.length > 0) {
          stats.prix_moy_location = Math.round(
            stats.prix_location_list.reduce((a: number, b: number) => a + b, 0) / stats.prix_location_list.length / 1000
          ) * 1000;
        }
        if (stats.prix_vente_list.length > 0) {
          stats.prix_moy_vente = Math.round(
            stats.prix_vente_list.reduce((a: number, b: number) => a + b, 0) / stats.prix_vente_list.length / 1000
          ) * 1000;
        }
        // Nettoyer les listes temporaires
        delete stats.prix_location_list;
        delete stats.prix_vente_list;
      }

      // Calculer les prix globaux
      const prix_min_location = prixLocation.length > 0 ? Math.min(...prixLocation) : null;
      const prix_max_location = prixLocation.length > 0 ? Math.max(...prixLocation) : null;
      const prix_moy_location = prixLocation.length > 0 ? Math.round(prixLocation.reduce((a, b) => a + b, 0) / prixLocation.length / 1000) * 1000 : null;
      
      const prix_min_vente = prixVente.length > 0 ? Math.min(...prixVente) : null;
      const prix_max_vente = prixVente.length > 0 ? Math.max(...prixVente) : null;
      const prix_moy_vente = prixVente.length > 0 ? Math.round(prixVente.reduce((a, b) => a + b, 0) / prixVente.length / 1000) * 1000 : null;

      const statsQuartier = {
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
        nbre_biens: produits.length,
        prix_min_location,
        prix_max_location,
        prix_moy_location,
        prix_min_vente,
        prix_max_vente,
        prix_moy_vente,
        prix: Object.values(statsTypes)
      };

      locations.push(statsQuartier);
    }

    return NextResponse.json({ success: true, data: locations });
  } catch (error) {
    console.error('Error fetching quartiers stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quartiers stats' }, { status: 500 });
  }
}
