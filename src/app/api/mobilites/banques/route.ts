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

    const [banques, total] = await Promise.all([
      prisma.banques.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.banques.count({ where })
    ]);

    // Charger les communes
    const communeIds = banques
      .map(b => b.id_commune)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    // Mapper les banques avec leurs communes
    const banquesWithCommunes = banques.map(banque => ({
      ...banque,
      commune: banque.id_commune 
        ? communes.find(c => c.id === BigInt(banque.id_commune!)) 
        : null
    }));

    return NextResponse.json(serializeBigInt({
      success: true,
      data: banquesWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des banques:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

