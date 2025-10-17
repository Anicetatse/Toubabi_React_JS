import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
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

    // Récupérer l'annonce du client (même non approuvée)
    const annonces = await prisma.$queryRawUnsafe(`
      SELECT p.*, c.nom as categorie_nom, c.code as categorie_code
      FROM produits p
      LEFT JOIN categories c ON p.code_categorie = c.code
      WHERE p.code = ? AND p.client_owner_id = ?
      LIMIT 1
    `, code, client_owner_id) as any[];

    if (!annonces || annonces.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Annonce non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    const annonce = annonces[0];

    // Récupérer le quartier et la commune
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

    // Parser les images JSON
    let images = [];
    try {
      const parsedImages = annonce.image ? JSON.parse(annonce.image) : [];
      images = parsedImages.map((img: string) => {
        if (img.includes('assets/images/annonces')) {
          return img.replace('assets/images/annonces', 'assets/annonces');
        }
        return img;
      });
    } catch (e) {
      images = [];
    }

    // Récupérer les caractéristiques liées
    const caracteristiques = await prisma.$queryRawUnsafe(`
      SELECT caracteristique_id
      FROM caracretistique_produits
      WHERE produit_code = ?
    `, code) as any[];

    const caracteristiquesIds = caracteristiques.map(c => Number(c.caracteristique_id));

    return NextResponse.json({
      success: true,
      data: {
        code: annonce.code,
        nom: annonce.nom,
        description: annonce.description,
        prix_vente: Number(annonce.prix_vente),
        surface: annonce.surface || 0,
        piece: annonce.piece || 0,
        chambre: annonce.chambre || 0,
        type_annonce: annonce.type_annonce,
        code_categorie: annonce.code_categorie,
        code_souscategorie: annonce.code_souscategorie,
        meuble: annonce.meuble,
        enabled: annonce.enabled,
        vues: annonce.vues || 0,
        id_commune: annonce.id_commune,
        id_quartier: annonce.id_quartier,
        images: images,
        created_at: annonce.created_at,
        updated_at: annonce.updated_at,
        categorie: annonce.categorie_nom ? {
          code: annonce.categorie_code,
          nom: annonce.categorie_nom,
        } : null,
        quartier: quartierData,
        commune: communeData,
        caracteristiques: caracteristiquesIds,
      },
    });

  } catch (error: any) {
    console.error('Erreur récupération annonce client:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

