import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const quartiers = await prisma.quartiers.findMany({
      include: {
        commune: {
          include: {
            ville: true,
          },
        },
      },
      orderBy: { nom: 'asc' },
    });

    const quartiersFormatted = quartiers.map((q) => ({
      id: Number(q.id),
      nom: q.nom,
      commune: q.commune.nom,
      prix_non_bati: q.prix_non_bati ? Number(q.prix_non_bati) : null,
      prix_bati: q.prix_bati ? Number(q.prix_bati) : null,
    }));

    return NextResponse.json({
      success: true,
      data: quartiersFormatted,
    });
  } catch (error) {
    console.error('Erreur API admin quartiers:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

