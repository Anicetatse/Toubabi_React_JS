import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pays = await prisma.pays.findMany({
      orderBy: { nom: 'asc' },
    });

    const paysFormatted = pays.map((p) => ({
      id: Number(p.id),
      nom: p.nom,
      code: p.code,
    }));

    return NextResponse.json({
      success: true,
      data: paysFormatted,
    });
  } catch (error) {
    console.error('Erreur API pays:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

