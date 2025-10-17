import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour une commune
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nom, id_ville, image, enabled } = body;

    if (!nom || !id_ville) {
      return NextResponse.json(
        { error: 'Le nom et la ville sont requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      UPDATE communes 
      SET nom = ?, id_ville = ?, image = ?, enabled = ?, updated_at = ?
      WHERE id = ?
    `, nom, parseInt(id_ville), image || null, enabled ? 1 : 0, new Date(), parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Commune mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la commune' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une commune (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier s'il y a des quartiers liés
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM quartiers WHERE id_commune = ? AND deleted_at IS NULL
    `, parseInt(id)) as any[];
    
    const count = Number(countResult[0]?.count || 0);

    if (count > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer. ${count} quartier(s) sont liés à cette commune.` },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.$queryRawUnsafe(`
      UPDATE communes SET deleted_at = ? WHERE id = ?
    `, new Date(), parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Commune supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la commune' },
      { status: 500 }
    );
  }
}

