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
    const deGarde = searchParams.get('deGarde'); // 'true', 'false', ou null (toutes)
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Filtre de garde
    if (deGarde === 'true') {
      where.active = 1; // Seulement de garde
    } else if (deGarde === 'false') {
      where.active = 0; // Seulement non de garde
    }
    // Si deGarde est null/undefined, on ne filtre pas sur active (toutes)
    
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (communeId) {
      where.id_commune = parseInt(communeId);
    }

    const [pharmacies, total] = await Promise.all([
      prisma.pharmaciede_gardes.findMany({
        where,
        orderBy: { nom: 'asc' },
        skip,
        take: limit
      }),
      prisma.pharmaciede_gardes.count({ where })
    ]);

    // Charger les communes
    const communeIds = pharmacies
      .map(p => p.id_commune)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const communes = communeIds.length > 0 ? await prisma.communes.findMany({
      where: { id: { in: communeIds.map(id => BigInt(id)) } }
    }) : [];

    // Mapper les pharmacies avec leurs communes
    const pharmaciesWithCommunes = pharmacies.map(pharmacie => ({
      ...pharmacie,
      commune: pharmacie.id_commune 
        ? communes.find(c => c.id === BigInt(pharmacie.id_commune!)) 
        : null
    }));

    return NextResponse.json(serializeBigInt({
      success: true,
      data: pharmaciesWithCommunes,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

