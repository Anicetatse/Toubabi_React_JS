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
    console.log('📊 Stats - Client ID:', client_owner_id);

    // Compter le total d'annonces
    const totalResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM produits p
      WHERE p.client_owner_id = ?
    `, client_owner_id) as any[];
    const total = Number(totalResult[0].total);

    // Compter les annonces approuvées
    const approuveesResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM produits p
      WHERE p.client_owner_id = ? AND p.enabled = 1
    `, client_owner_id) as any[];
    const approuvees = Number(approuveesResult[0].total);

    // Compter les annonces en attente
    const enAttenteResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM produits p
      WHERE p.client_owner_id = ? AND p.enabled = 0
    `, client_owner_id) as any[];
    const enAttente = Number(enAttenteResult[0].total);

    // Compter les vues totales
    const vuesResult = await prisma.$queryRawUnsafe(`
      SELECT SUM(vues) as total_vues
      FROM produits p
      WHERE p.client_owner_id = ?
    `, client_owner_id) as any[];
    const totalVues = Number(vuesResult[0].total_vues || 0);

    return NextResponse.json({
      success: true,
      data: {
        total,
        approuvees,
        enAttente,
        aModifier: 0,
        totalVues,
      },
    });

  } catch (error: any) {
    console.error('Erreur récupération stats client:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

