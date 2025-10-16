import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ communeId: string }> }
) {
  try {
    const { communeId } = await params;

    const quartiers = await prisma.quartiers.findMany({
      where: {
        id_commune: BigInt(communeId),
      },
      select: {
        id: true,
        nom: true,
        id_commune: true,
      },
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: quartiers.map(quartier => ({
        id: quartier.id.toString(),
        nom: quartier.nom,
        commune_id: quartier.id_commune.toString(),
      })),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des quartiers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quartiers' },
      { status: 500 }
    );
  }
}
