import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const communes = await prisma.communes.findMany({
      select: {
        id: true,
        nom: true,
      },
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: communes.map(commune => ({
        id: commune.id.toString(),
        nom: commune.nom,
      })),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des communes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communes' },
      { status: 500 }
    );
  }
}