import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer tous les favoris avec les informations du client et du produit
    const query = `
      SELECT 
        w.id,
        w.id_client,
        w.code_produit,
        w.created_at,
        CONCAT(c.nom, ' ', c.prenom) as client_nom,
        c.email as client_email,
        p.nom as produit_nom
      FROM wishlists w
      LEFT JOIN clients c ON w.id_client = c.id
      LEFT JOIN produits p ON w.code_produit = p.code
      ORDER BY w.created_at DESC
    `;

    const wishlists = await prisma.$queryRawUnsafe<any[]>(query);

    // Convertir les résultats
    const formattedWishlists = wishlists.map(wishlist => ({
      id: Number(wishlist.id),
      id_client: Number(wishlist.id_client),
      code_produit: wishlist.code_produit,
      created_at: wishlist.created_at ? new Date(wishlist.created_at).toISOString() : new Date().toISOString(),
      client_nom: wishlist.client_nom || 'N/A',
      client_email: wishlist.client_email || '',
      produit_nom: wishlist.produit_nom || 'Produit supprimé'
    }));

    return NextResponse.json({ wishlists: formattedWishlists });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

