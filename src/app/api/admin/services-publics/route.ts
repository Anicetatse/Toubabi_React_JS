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

    const [servicesPublics, total] = await Promise.all([
      prisma.services_publics.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.services_publics.count({ where })
    ]);

    // Charger les communes manuellement
    const communeIds = servicesPublics
      .map(p => p.id_commune)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    // Mapper les servicePublics avec leurs communes
    const servicesPublicsWithCommunes = servicesPublics.map(servicePublic => ({
      ...servicePublic,
      commune: servicePublic.id_commune 
        ? communes.find(c => c.id === BigInt(servicePublic.id_commune!)) 
        : null
    }));

    // Statistiques
    const stats = await prisma.services_publics.aggregate({
      where,
      _count: { id: true }
    });

    const actives = await prisma.services_publics.count({
      where: { ...where, active: 1 }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: servicesPublicsWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      stats: {
        total_servicesPublics: stats._count.id,
        servicesPublics_actives: actives
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des services publics:', error);
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
    
    const servicePublic = await prisma.services_publics.create({
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
    if (servicePublic.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(servicePublic.id_commune) }
      });
    }

    const servicePublicWithCommune = {
      ...servicePublic,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: servicePublicWithCommune,
      message: 'Service Public créée avec succès'
    }), { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la servicePublic:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

