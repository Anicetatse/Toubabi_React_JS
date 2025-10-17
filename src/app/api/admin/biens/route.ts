import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les paramètres de pagination et recherche
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Construire la requête avec recherche
    const whereClause = search
      ? {
          OR: [
            { nom: { contains: search } },
            { code: { contains: search } },
            { description: { contains: search } }
          ]
        }
      : {};

    // Récupérer le total
    const total = await prisma.produits.count({ where: whereClause });

    // Récupérer les biens avec informations jointes
    const biens = await prisma.$queryRaw<Array<any>>`
      SELECT 
        p.*,
        c.nom as client_nom,
        q.nom as quartier_nom,
        com.nom as commune_nom
      FROM produits p
      LEFT JOIN clients c ON p.client_owner_id = c.id
      LEFT JOIN quartiers q ON p.id_quartier = q.id
      LEFT JOIN communes com ON q.id_commune = com.id
      ${search ? `WHERE p.nom LIKE '%${search}%' OR p.code LIKE '%${search}%'` : ''}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const formattedBiens = biens.map((bien: any) => ({
      id: 0,
      code: bien.code,
      nom: bien.nom,
      description: bien.description || '',
      prix_vente: Number(bien.prix_vente || 0),
      surface: bien.surface || 0,
      piece: bien.piece || 0,
      chambre: bien.chambre || 0,
      enabled: Boolean(bien.enabled),
      client_owner_id: bien.client_owner_id,
      client_nom: bien.client_nom || 'N/A',
      quartier_nom: bien.quartier_nom || 'N/A',
      commune_nom: bien.commune_nom || 'N/A',
      created_at: bien.created_at ? bien.created_at.toISOString() : new Date().toISOString(),
      updated_at: bien.updated_at ? bien.updated_at.toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({ biens: formattedBiens, total });

  } catch (error) {
    console.error('Erreur lors de la récupération des biens:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

