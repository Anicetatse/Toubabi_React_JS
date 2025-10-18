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

    const [stations, total] = await Promise.all([
      prisma.stations.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.stations.count({ where })
    ]);

    // Charger les communes manuellement
    const communeIds = stations
      .map(p => p.id_commune)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    // Mapper les stations avec leurs communes
    const stationsWithCommunes = stations.map(station => ({
      ...station,
      commune: station.id_commune 
        ? communes.find(c => c.id === BigInt(station.id_commune!)) 
        : null
    }));

    // Statistiques
    const stats = await prisma.stations.aggregate({
      where,
      _count: { id: true }
    });

    const actives = await prisma.stations.count({
      where: { ...where, active: 1 }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: stationsWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      stats: {
        total_stations: stats._count.id,
        stations_actives: actives
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des stations:', error);
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
    
    const station = await prisma.stations.create({
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
    if (station.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(station.id_commune) }
      });
    }

    const stationWithCommune = {
      ...station,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: stationWithCommune,
      message: 'Station créée avec succès'
    }), { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la station:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

