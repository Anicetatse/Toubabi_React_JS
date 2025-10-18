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

    const [enseignements, total] = await Promise.all([
      prisma.enseignements.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.enseignements.count({ where })
    ]);

    const communeIds = enseignements.map(e => e.id_commune).filter((id): id is number => id !== null);
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    const enseignementsWithCommunes = enseignements.map(enseignement => ({
      ...enseignement,
      commune: enseignement.id_commune ? communes.find(c => c.id === BigInt(enseignement.id_commune!)) : null
    }));

    return NextResponse.json(serializeBigInt({
      success: true,
      data: enseignementsWithCommunes,
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

