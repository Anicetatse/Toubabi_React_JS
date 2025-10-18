import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotelierId = BigInt(id);

    const hotelier = await prisma.hoteliers.findUnique({
      where: { id: hotelierId }
    });

    if (!hotelier) {
      return NextResponse.json(
        { success: false, error: 'Hôtelier non trouvé' },
        { status: 404 }
      );
    }

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
      data: hotelierWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'hôtelier:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

