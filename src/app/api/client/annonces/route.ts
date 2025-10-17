import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté depuis le token
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    const client_owner_id = parseInt(payload.userId);
    console.log('🔑 Client ID from token:', client_owner_id);

    // Récupérer les paramètres de pagination et filtres
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status') || 'all'; // all, approved, pending
    const perPage = 10;
    const offset = (page - 1) * perPage;

    // Construire la condition WHERE pour le statut
    let statusCondition = '';
    if (status === 'approved') {
      statusCondition = ' AND p.enabled = 1';
    } else if (status === 'pending') {
      statusCondition = ' AND p.enabled = 0';
    }

    // Compter le total d'annonces du client avec le filtre de statut
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM produits p
      WHERE p.client_owner_id = ?${statusCondition}
    `, client_owner_id) as any[];
    const total = Number(countResult[0].total);
    console.log('📊 Total annonces du client', client_owner_id, 'avec filtre', status, ':', total);

    // Récupérer les annonces du client avec pagination et filtre
    const annonces = await prisma.$queryRawUnsafe(`
      SELECT p.*, c.nom as categorie_nom, c.code as categorie_code
      FROM produits p
      LEFT JOIN categories c ON p.code_categorie = c.code
      WHERE p.client_owner_id = ?${statusCondition}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, client_owner_id, perPage, offset) as any[];

    // Récupérer les quartiers et communes pour chaque annonce
    const annoncesFormatted = await Promise.all(annonces.map(async (annonce: any) => {
      let quartierData = null;
      let communeData = null;

      if (annonce.id_quartier) {
        const quartiers = await prisma.$queryRawUnsafe(`
          SELECT q.id, q.nom, q.id_commune, c.nom as commune_nom, c.id as commune_id
          FROM quartiers q
          LEFT JOIN communes c ON q.id_commune = c.id
          WHERE q.id = ?
        `, annonce.id_quartier) as any[];
        
        if (quartiers.length > 0) {
          quartierData = {
            id: Number(quartiers[0].id),
            nom: quartiers[0].nom,
          };
          communeData = {
            id: Number(quartiers[0].commune_id),
            nom: quartiers[0].commune_nom,
          };
        }
      }

      // Parser les images JSON et corriger les chemins si nécessaire
      let images = [];
      try {
        const parsedImages = annonce.image ? JSON.parse(annonce.image) : [];
        // Corriger les chemins pour les anciennes images
        images = parsedImages.map((img: string) => {
          // Si le chemin contient "assets/images/annonces", le remplacer par "assets/annonces"
          if (img.includes('assets/images/annonces')) {
            return img.replace('assets/images/annonces', 'assets/annonces');
          }
          return img;
        });
      } catch (e) {
        images = [];
      }

      return {
        code: annonce.code,
        nom: annonce.nom,
        description: annonce.description,
        prix_vente: Number(annonce.prix_vente),
        surface: annonce.surface || 0,
        piece: annonce.piece || 0,
        chambre: annonce.chambre || 0,
        type_annonce: annonce.type_annonce,
        code_categorie: annonce.code_categorie,
        enabled: annonce.enabled,
        vues: annonce.vues || 0,
        image: images[0] || null, // Première image
        images: images,
        created_at: annonce.created_at,
        updated_at: annonce.updated_at,
        categorie: annonce.categorie_nom ? {
          code: annonce.categorie_code,
          nom: annonce.categorie_nom,
        } : null,
        quartier: quartierData,
        commune: communeData,
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        data: annoncesFormatted,
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total: total,
      },
    });

  } catch (error: any) {
    console.error('Erreur récupération annonces client:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

