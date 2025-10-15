import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const estimations = await prisma.estimes.findMany({
      orderBy: { created_at: 'desc' },
    });

    const estimationsFormatted = estimations.map((e) => ({
      id: Number(e.id),
      user_id: e.user_id ? Number(e.user_id) : null,
      type_construction: e.type_construction,
      surface: Number(e.surface),
      nombre_etages: e.nombre_etages,
      finition: e.finition,
      montant_estime: Number(e.montant_estime),
      email: e.email,
      created_at: e.created_at?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: estimationsFormatted,
    });
  } catch (error) {
    console.error('Erreur API estimations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

