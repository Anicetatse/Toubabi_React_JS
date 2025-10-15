import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sliders = await prisma.sliders.findMany({
      where: { actif: true },
      orderBy: { ordre: 'asc' },
    });

    const slidersFormatted = sliders.map((s) => ({
      id: Number(s.id),
      titre: s.titre,
      sous_titre: s.sous_titre,
      image: s.image,
      lien: s.lien,
      ordre: s.ordre,
      actif: s.actif,
    }));

    return NextResponse.json({
      success: true,
      data: slidersFormatted,
    });
  } catch (error) {
    console.error('Erreur API sliders:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

