import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour une ville
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nom } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      UPDATE villes 
      SET nom = ?, updated_at = ?
      WHERE id = ?
    `, nom, new Date(), parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Ville mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la ville' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une ville (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier s'il y a des communes liées
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM communes WHERE id_ville = ? AND deleted_at IS NULL
    `, parseInt(id)) as any[];
    
    const count = Number(countResult[0]?.count || 0);

    if (count > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer. ${count} commune(s) sont liées à cette ville.` },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.$queryRawUnsafe(`
      UPDATE villes SET deleted_at = ? WHERE id = ?
    `, new Date(), parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Ville supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la ville' },
      { status: 500 }
    );
  }
}

