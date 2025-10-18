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

    const [hoteliers, total] = await Promise.all([
      prisma.hoteliers.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.hoteliers.count({ where })
    ]);

    // Charger les communes manuellement
    const communeIds = hoteliers
      .map(h => h.id_commune)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    // Mapper les hoteliers avec leurs communes
    const hoteliersWithCommunes = hoteliers.map(hotelier => ({
      ...hotelier,
      commune: hotelier.id_commune 
        ? communes.find(c => c.id === BigInt(hotelier.id_commune!)) 
        : null
    }));

    // Statistiques
    const stats = await prisma.hoteliers.aggregate({
      where,
      _count: { id: true }
    });

    const actives = await prisma.hoteliers.count({
      where: { ...where, active: 1 }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: hoteliersWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      stats: {
        total_hoteliers: stats._count.id,
        hoteliers_actifs: actives
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des hôteliers:', error);
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
    
    const hotelier = await prisma.hoteliers.create({
      data: {
        id_commune: body.id_commune ? parseInt(body.id_commune) : null,
        nom: body.nom,
        description: body.description || null,
        contact: body.contact || null,
        videos: body.videos || null,
        images1: body.images1 || null,
        images2: body.images2 || null,
        images3: body.images3 || null,
        images4: body.images4 || null,
        images5: body.images5 || null,
        images6: body.images6 || null,
        images7: body.images7 || null,
        images8: body.images8 || null,
        images9: body.images9 || null,
        images10: body.images10 || null,
        active: parseInt(body.active) || 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Charger la commune
    let commune = null;
    if (hotelier.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(hotelier.id_commune) }
      });
    }

    const hotelierWithCommune = {
      ...hotelier,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: hotelierWithCommune,
      message: 'Hôtelier créé avec succès'
    }), { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'hôtelier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

