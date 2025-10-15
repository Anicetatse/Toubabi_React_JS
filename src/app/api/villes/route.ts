import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const villes = await prisma.villes.findMany({
      include: {
        pays: true,
      },
      orderBy: { nom: 'asc' },
    });

    const villesFormatted = villes.map((v) => ({
      id: Number(v.id),
      nom: v.nom,
      pays_id: Number(v.pays_id),
      pays: {
        id: Number(v.pays.id),
        nom: v.pays.nom,
      },
    }));

    return NextResponse.json({
      success: true,
      data: villesFormatted,
    });
  } catch (error) {
    console.error('Erreur API villes:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

