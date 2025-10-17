import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour une caractéristique
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

    // Vérifier les colonnes disponibles
    const columns = await prisma.$queryRawUnsafe(`
      SHOW COLUMNS FROM caracteristiques
    `) as any[];
    
    const columnNames = columns.map((col: any) => col.Field);

    // Construire la requête UPDATE
    const updates: string[] = ['nom = ?'];
    const values: any[] = [nom];

    if (columnNames.includes('updated_at')) {
      updates.push('updated_at = ?');
      values.push(new Date());
    }

    values.push(parseInt(id));

    const updateQuery = `UPDATE caracteristiques SET ${updates.join(', ')} WHERE id = ?`;
    await prisma.$queryRawUnsafe(updateQuery, ...values);

    return NextResponse.json({
      success: true,
      message: 'Caractéristique mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la caractéristique' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une caractéristique
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

    await prisma.$queryRawUnsafe(`
      UPDATE caracteristiques SET active = ?, updated_at = ? WHERE id = ?
    `, active ? 1 : 0, new Date(), parseInt(id));

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

// DELETE - Supprimer une caractéristique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier s'il y a des produits avec cette caractéristique
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM caracretistique_produits WHERE caracteristique_id = ?
    `, parseInt(id)) as any[];
    
    const count = Number(countResult[0]?.count || 0);

    if (count > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer. ${count} bien(s) utilisent cette caractéristique.` },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      DELETE FROM caracteristiques WHERE id = ?
    `, parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Caractéristique supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la caractéristique' },
      { status: 500 }
    );
  }
}

