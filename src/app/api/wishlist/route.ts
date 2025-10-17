import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';

// Helper pour convertir les BigInt en nombres
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  
  return obj;
}

// GET - Récupérer tous les favoris de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const clientId = parseInt(decoded.userId);

    // Récupérer les favoris avec les détails des produits
    const query = `
      SELECT 
        w.id,
        w.id_client,
        w.code_produit,
        w.created_at as wishlist_created_at,
        w.updated_at as wishlist_updated_at,
        p.code,
        p.nom,
        p.type_annonce,
        p.description,
        p.prix_vente,
        p.surface,
        p.piece,
        p.chambre,
        p.meuble,
        p.image,
        p.enabled,
        p.id_commune,
        p.id_quartier,
        p.code_categorie,
        p.client_owner_id,
        p.created_at,
        p.updated_at,
        c.code as categorie_code,
        c.nom as categorie_nom,
        com.id as commune_id,
        com.nom as commune_nom,
        q.id as quartier_id,
        q.nom as quartier_nom
      FROM wishlists w
      INNER JOIN produits p ON w.code_produit = p.code
      LEFT JOIN categories c ON p.code_categorie = c.code
      LEFT JOIN communes com ON p.id_commune = com.id
      LEFT JOIN quartiers q ON p.id_quartier = q.id
      WHERE w.id_client = ? AND p.enabled = 1
      ORDER BY w.created_at DESC
    `;

    const wishlists = await prisma.$queryRawUnsafe<any[]>(query, clientId);

    // Formater les données
    const formattedWishlists = wishlists.map(item => {
      // Parser les images
      let images: string[] = [];
      if (item.image) {
        try {
          images = typeof item.image === 'string' ? JSON.parse(item.image) : item.image;
          // Corriger les chemins d'images et s'assurer qu'ils commencent par /
          images = images.map((img: string) => {
            // Remplacer l'ancien chemin par le nouveau
            if (img.startsWith('assets/images/annonces/')) {
              img = img.replace('assets/images/annonces/', 'assets/annonces/');
            }
            // S'assurer que le chemin commence par /
            if (!img.startsWith('/') && !img.startsWith('http')) {
              return '/' + img;
            }
            return img;
          });
        } catch (e) {
          images = [];
        }
      }

      return {
        id: item.id,
        id_client: item.id_client,
        code_produit: item.code_produit,
        created_at: item.wishlist_created_at,
        updated_at: item.wishlist_updated_at,
        produit: {
          id: 0,
          code: item.code,
          titre: item.nom || 'Bien immobilier', // Mapper nom -> titre pour correspondre à l'interface Produit
          description: item.description || '',
          prix: Number(item.prix_vente) || 0, // Mapper prix_vente -> prix et convertir en nombre
          prix_vente: Number(item.prix_vente) || 0,
          surface: item.surface,
          nombre_pieces: item.piece,
          nombre_chambres: item.chambre,
          nombre_salles_bain: 0,
          categorie_id: 0,
          type_annonce_id: 0,
          quartier_id: item.quartier_id || 0,
          user_id: 0,
          client_owner_id: item.client_owner_id,
          enabled: item.enabled,
          statut: 'actif' as const,
          images: images.length > 0 ? images.map(url => ({ url, id: 0 })) : [],
          type_annonce: {
            id: 0,
            nom: item.type_annonce === 'louer' ? 'Location' : 'Vente'
          },
          categorie: item.categorie_nom ? {
            id: 0,
            nom: item.categorie_nom
          } : undefined,
          quartier: item.quartier_nom ? {
            id: item.quartier_id?.toString() || '0',
            id_commune: item.commune_id?.toString() || '0',
            nom: item.quartier_nom,
            enabled: 1,
            created_at: '',
            updated_at: '',
            commune: item.commune_nom ? {
              id: item.commune_id || 0,
              nom: item.commune_nom,
              ville_id: 0
            } : undefined
          } : undefined,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
        }
      };
    });

    const converted = convertBigIntToNumber(formattedWishlists);

    return NextResponse.json({
      success: true,
      data: converted,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un bien aux favoris
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const clientId = parseInt(decoded.userId);
    const body = await request.json();
    const { produit_id } = body;

    if (!produit_id) {
      return NextResponse.json(
        { success: false, message: 'ID du produit requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const produitExists = await prisma.$queryRawUnsafe<any[]>(
      `SELECT code FROM produits WHERE code = ? AND enabled = 1 LIMIT 1`,
      produit_id
    );

    if (!produitExists || produitExists.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si déjà dans les favoris
    const existingWishlist = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM wishlists WHERE id_client = ? AND code_produit = ? LIMIT 1`,
      clientId,
      produit_id
    );

    if (existingWishlist && existingWishlist.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Déjà dans les favoris' },
        { status: 400 }
      );
    }

    // Ajouter aux favoris
    await prisma.$queryRawUnsafe(
      `INSERT INTO wishlists (id_client, code_produit, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      clientId,
      produit_id
    );

    // Récupérer le favori créé
    const newWishlist = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM wishlists WHERE id_client = ? AND code_produit = ? LIMIT 1`,
      clientId,
      produit_id
    );

    const converted = convertBigIntToNumber(newWishlist[0]);

    return NextResponse.json({
      success: true,
      message: 'Ajouté aux favoris',
      data: converted,
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout aux favoris:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un favori par ID
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const clientId = parseInt(decoded.userId);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID requis' },
        { status: 400 }
      );
    }

    // Vérifier que le favori appartient à l'utilisateur
    const wishlist = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM wishlists WHERE id = ? AND id_client = ? LIMIT 1`,
      parseInt(id),
      clientId
    );

    if (!wishlist || wishlist.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Favori non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le favori
    await prisma.$queryRawUnsafe(
      `DELETE FROM wishlists WHERE id = ? AND id_client = ?`,
      parseInt(id),
      clientId
    );

    return NextResponse.json({
      success: true,
      message: 'Retiré des favoris',
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

