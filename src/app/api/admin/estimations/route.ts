import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { quartier: { nom: { contains: search, mode: 'insensitive' } } },
        { quartier: { commune: { nom: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Filtrer les estimations avec quartier valide uniquement
    const whereWithQuartier = {
      ...where,
      id_quartier: {
        not: null
      }
    };

    const [estimations, total] = await Promise.all([
      prisma.estimes.findMany({
        where: whereWithQuartier,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.estimes.count({ where: whereWithQuartier })
    ]);

    // Charger les quartiers et communes manuellement
    const quartierIds = estimations
      .map(e => e.id_quartier)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const quartiers = quartierIds.length > 0 ? await prisma.quartiers.findMany({
      where: { id: { in: quartierIds.map(id => BigInt(id)) } },
      include: { commune: true }
    }) : [];

    // Mapper les estimations avec leurs quartiers
    const estimationsWithQuartiers = estimations.map(estimation => ({
      ...estimation,
      quartier: estimation.id_quartier 
        ? quartiers.find(q => q.id === BigInt(estimation.id_quartier!)) 
        : null
    }));

    // Statistiques
    const stats = await prisma.estimes.aggregate({
      where: whereWithQuartier,
      _count: { id: true },
      _avg: {
        niveau: true
      }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: estimationsWithQuartiers,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      stats: {
        total_estimations: stats._count.id,
        niveau_moyen: Math.round(Number(stats._avg.niveau) || 0)
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des estimations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const estimation = await prisma.estimes.create({
      data: {
        id_quartier: body.id_quartier ? parseInt(body.id_quartier) : null,
        coefficient_occupa_sols: body.coefficient_occupa_sols ? parseFloat(body.coefficient_occupa_sols) : null,
        hauteur: body.hauteur ? parseFloat(body.hauteur) : null,
        niveau: body.niveau ? parseInt(body.niveau) : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Charger le quartier et la commune
    let quartier = null;
    if (estimation.id_quartier) {
      quartier = await prisma.quartiers.findUnique({
        where: { id: BigInt(estimation.id_quartier) },
        include: { commune: true }
      });
    }

    const estimationWithQuartier = {
      ...estimation,
      quartier
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: estimationWithQuartier,
      message: 'Estimation créée avec succès'
    }), { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'estimation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

