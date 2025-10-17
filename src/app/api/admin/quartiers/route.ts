import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste tous les quartiers avec leurs communes
export async function GET(request: NextRequest) {
  try {
    const quartiers = await prisma.$queryRawUnsafe(`
      SELECT q.*, 
        c.nom as commune_nom, 
        v.nom as ville_nom,
        (SELECT COUNT(*) FROM produits WHERE id_quartier = q.id AND deleted_at IS NULL) as total_annonces,
        (SELECT COUNT(*) FROM produits WHERE id_quartier = q.id AND enabled = 1 AND deleted_at IS NULL) as annonces_actives,
        (SELECT COUNT(*) FROM produits WHERE id_quartier = q.id AND enabled = 0 AND deleted_at IS NULL) as annonces_en_attente
      FROM quartiers q
      LEFT JOIN communes c ON q.id_commune = c.id
      LEFT JOIN villes v ON c.id_ville = v.id
      WHERE q.deleted_at IS NULL
      ORDER BY q.nom ASC
    `) as any[];

    // Formater les données
    const formatted = quartiers.map(quartier => ({
      id: quartier.id.toString(),
      nom: quartier.nom,
      id_commune: quartier.id_commune.toString(),
      commune_nom: quartier.commune_nom || '',
      ville_nom: quartier.ville_nom || '',
      images: quartier.images || null,
      enabled: quartier.enabled,
      lat: quartier.lat,
      lng: quartier.lng,
      total_annonces: Number(quartier.total_annonces || 0),
      annonces_actives: Number(quartier.annonces_actives || 0),
      annonces_en_attente: Number(quartier.annonces_en_attente || 0),
      prix_min_location: quartier.prix_min_location ? quartier.prix_min_location.toString() : null,
      prix_moy_location: quartier.prix_moy_location ? quartier.prix_moy_location.toString() : null,
      prix_max_location: quartier.prix_max_location ? quartier.prix_max_location.toString() : null,
      prix_min_vente: quartier.prix_min_vente ? quartier.prix_min_vente.toString() : null,
      prix_moy_vente: quartier.prix_moy_vente ? quartier.prix_moy_vente.toString() : null,
      prix_max_vente: quartier.prix_max_vente ? quartier.prix_max_vente.toString() : null,
      prix_venal: quartier.prix_venal ? quartier.prix_venal.toString() : null,
      prix_marchand: quartier.prix_marchand ? quartier.prix_marchand.toString() : null,
      prix_moyen: quartier.prix_moyen ? quartier.prix_moyen.toString() : null,
      created_at: quartier.created_at ? new Date(quartier.created_at).toISOString() : null,
      updated_at: quartier.updated_at ? new Date(quartier.updated_at).toISOString() : null
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des quartiers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des quartiers' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau quartier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nom, 
      id_commune, 
      images, 
      enabled, 
      lat, 
      lng,
      prix_min_location,
      prix_moy_location,
      prix_max_location,
      prix_min_vente,
      prix_moy_vente,
      prix_max_vente,
      prix_venal,
      prix_marchand,
      prix_moyen
    } = body;

    // Validation
    if (!nom || !id_commune) {
      return NextResponse.json(
        { error: 'Le nom et la commune sont requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      INSERT INTO quartiers (
        nom, id_commune, images, enabled, lat, lng,
        prix_min_location, prix_moy_location, prix_max_location,
        prix_min_vente, prix_moy_vente, prix_max_vente,
        prix_venal, prix_marchand, prix_moyen,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, 
      nom, 
      parseInt(id_commune), 
      images || null, 
      enabled ? 1 : 0, 
      lat || null, 
      lng || null,
      prix_min_location ? parseInt(prix_min_location) : null,
      prix_moy_location ? parseInt(prix_moy_location) : null,
      prix_max_location ? parseInt(prix_max_location) : null,
      prix_min_vente ? parseInt(prix_min_vente) : null,
      prix_moy_vente ? parseInt(prix_moy_vente) : null,
      prix_max_vente ? parseInt(prix_max_vente) : null,
      prix_venal ? parseInt(prix_venal) : null,
      prix_marchand ? parseInt(prix_marchand) : null,
      prix_moyen ? parseInt(prix_moyen) : null,
      new Date(), 
      new Date()
    );

    return NextResponse.json({
      success: true,
      message: 'Quartier créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du quartier' },
      { status: 500 }
    );
  }
}
