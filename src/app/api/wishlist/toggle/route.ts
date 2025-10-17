import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/auth-utils';

// POST - Toggle un bien dans les favoris (ajouter ou retirer)
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

    let added = false;

    if (existingWishlist && existingWishlist.length > 0) {
      // Retirer des favoris
      await prisma.$queryRawUnsafe(
        `DELETE FROM wishlists WHERE id_client = ? AND code_produit = ?`,
        clientId,
        produit_id
      );
      added = false;
    } else {
      // Ajouter aux favoris
      await prisma.$queryRawUnsafe(
        `INSERT INTO wishlists (id_client, code_produit, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        clientId,
        produit_id
      );
      added = true;
    }

    return NextResponse.json({
      success: true,
      message: added ? 'Ajouté aux favoris' : 'Retiré des favoris',
      data: { added },
    });

  } catch (error) {
    console.error('Erreur lors du toggle des favoris:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

