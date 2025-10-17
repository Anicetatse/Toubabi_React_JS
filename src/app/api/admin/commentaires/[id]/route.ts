import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH - Mettre à jour le statut d'un commentaire
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { active } = body;

    if (active === undefined) {
      return NextResponse.json(
        { error: 'Le champ active est requis' },
        { status: 400 }
      );
    }

    const commentaire = await prisma.commentaires.update({
      where: { id: BigInt(id) },
      data: { 
        active: active ? 1 : 0,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: commentaire.id.toString(),
        active: commentaire.active
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du commentaire' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un commentaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.commentaires.delete({
      where: { id: BigInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    );
  }
}

