import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Mettre à jour le statut d'un quartier
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { enabled } = body;

    if (enabled === undefined) {
      return NextResponse.json(
        { error: 'Le champ enabled est requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      UPDATE quartiers SET enabled = ?, updated_at = ? WHERE id = ?
    `, enabled ? 1 : 0, new Date(), parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}

