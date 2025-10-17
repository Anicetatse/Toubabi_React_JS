import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste toutes les communes avec leurs villes et stats annonces
export async function GET(request: NextRequest) {
  try {
    const communes = await prisma.$queryRawUnsafe(`
      SELECT c.*, v.nom as ville_nom,
        (SELECT COUNT(*) FROM produits p WHERE p.id_commune = c.id) as total_annonces,
        (SELECT COUNT(*) FROM produits p WHERE p.id_commune = c.id AND p.enabled = 1) as annonces_actives,
        (SELECT COUNT(*) FROM produits p WHERE p.id_commune = c.id AND p.enabled = 0) as annonces_en_attente
      FROM communes c
      LEFT JOIN villes v ON c.id_ville = v.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.nom ASC
    `) as any[];

    // Formater les données
    const formatted = communes.map(commune => {
      // Parser l'image si c'est du JSON
      let imageUrl = null;
      if (commune.image) {
        try {
          const parsed = JSON.parse(commune.image);
          imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : commune.image;
        } catch {
          // Si ce n'est pas du JSON, utiliser la valeur telle quelle
          imageUrl = commune.image;
        }

        // Corriger le chemin de l'image
        if (imageUrl && typeof imageUrl === 'string') {
          const originalUrl = imageUrl;
          
          // Retirer tous les préfixes incorrects
          imageUrl = imageUrl.replace('/admin/assets/images/communes/', '/assets/communes/');
          imageUrl = imageUrl.replace('admin/assets/images/communes/', 'assets/communes/');
          imageUrl = imageUrl.replace('/assets/images/communes/', '/assets/communes/');
          imageUrl = imageUrl.replace('assets/images/communes/', 'assets/communes/');
          
          // Assurer que le chemin commence par /
          if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
            imageUrl = '/' + imageUrl;
          }
        }
      }

      return {
        id: commune.id.toString(),
        nom: commune.nom,
        id_ville: commune.id_ville.toString(),
        ville_nom: commune.ville_nom || '',
        image: imageUrl,
        enabled: commune.enabled,
        total_annonces: Number(commune.total_annonces || 0),
        annonces_actives: Number(commune.annonces_actives || 0),
        annonces_en_attente: Number(commune.annonces_en_attente || 0),
        created_at: commune.created_at ? new Date(commune.created_at).toISOString() : null,
        updated_at: commune.updated_at ? new Date(commune.updated_at).toISOString() : null
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des communes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des communes' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle commune
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, id_ville, image, enabled } = body;

    // Validation
    if (!nom || !id_ville) {
      return NextResponse.json(
        { error: 'Le nom et la ville sont requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      INSERT INTO communes (nom, id_ville, image, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, nom, parseInt(id_ville), image || null, enabled ? 1 : 0, new Date(), new Date());

    return NextResponse.json({
      success: true,
      message: 'Commune créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commune' },
      { status: 500 }
    );
  }
}

