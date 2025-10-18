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
        { nom: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [industries, total] = await Promise.all([
      prisma.industries.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.industries.count({ where })
    ]);

    // Charger les communes manuellement
    const communeIds = industries
      .map(p => p.id_commune)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    // Mapper les industries avec leurs communes
    const industriesWithCommunes = industries.map(industrie => ({
      ...industrie,
      commune: industrie.id_commune 
        ? communes.find(c => c.id === BigInt(industrie.id_commune!)) 
        : null
    }));

    // Statistiques
    const stats = await prisma.industries.aggregate({
      where,
      _count: { id: true }
    });

    const actives = await prisma.industries.count({
      where: { ...where, active: 1 }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: industriesWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      stats: {
        total_industries: stats._count.id,
        industries_actives: actives
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des industries:', error);
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
    
    const industrie = await prisma.industries.create({
      data: {
        id_commune: body.id_commune ? parseInt(body.id_commune) : null,
        nom: body.nom,
        description: body.description || null,
        contact: body.contact || null,
        active: parseInt(body.active) || 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Charger la commune
    let commune = null;
    if (industrie.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(industrie.id_commune) }
      });
    }

    const industrieWithCommune = {
      ...industrie,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: industrieWithCommune,
      message: 'Industrie créée avec succès'
    }), { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la industrie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

