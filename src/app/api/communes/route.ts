import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const communes = await prisma.communes.findMany({
      include: {
        ville: true,
      },
      orderBy: { nom: 'asc' },
    });

    const communesFormatted = communes.map((c) => ({
      id: Number(c.id),
      nom: c.nom,
      ville_id: Number(c.ville_id),
      ville: {
        id: Number(c.ville.id),
        nom: c.ville.nom,
      },
    }));

    return NextResponse.json({
      success: true,
      data: communesFormatted,
    });
  } catch (error) {
    console.error('Erreur API communes:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

