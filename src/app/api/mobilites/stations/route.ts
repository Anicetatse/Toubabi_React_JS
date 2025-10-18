import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const communeId = searchParams.get('commune');
    const skip = (page - 1) * limit;

    const where: any = { active: 1 };
    
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (communeId) {
      where.id_commune = parseInt(communeId);
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

    const communeIds = stations.map(s => s.id_commune).filter((id): id is number => id !== null);
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    const stationsWithCommunes = stations.map(station => ({
      ...station,
      commune: station.id_commune ? communes.find(c => c.id === BigInt(station.id_commune!)) : null
    }));

    return NextResponse.json(serializeBigInt({
      success: true,
      data: stationsWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

