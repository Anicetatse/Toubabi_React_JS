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
            { prenom: { contains: search } },
            { email: { contains: search } },
            { telephone: { contains: search } }
          ]
        }
      : {};

    // Récupérer le total
    const total = await prisma.clients.count({ where: whereClause });

    // Récupérer les clients
    const clients = await prisma.clients.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        type_compte: true,
        enabled: true,
        created_at: true,
        updated_at: true,
        image: true
      }
    });

    const formattedClients = clients.map(client => ({
      id: Number(client.id),
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone || '',
      role: client.type_compte,
      enabled: Boolean(client.enabled),
      created_at: client.created_at ? client.created_at.toISOString() : new Date().toISOString(),
      updated_at: client.updated_at ? client.updated_at.toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({ clients: formattedClients, total });

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

