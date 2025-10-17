import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour un type d'annonce
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nom, description } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Vérifier les colonnes disponibles
    const columns = await prisma.$queryRawUnsafe(`
      SHOW COLUMNS FROM type_annonces
    `) as any[];
    
    const columnNames = columns.map((col: any) => col.Field);

    // Construire la requête UPDATE dynamiquement
    const updates: string[] = [];
    const values: any[] = [];

    if (columnNames.includes('nom')) {
      updates.push('nom = ?');
      values.push(nom);
    } else if (columnNames.includes('name')) {
      updates.push('name = ?');
      values.push(nom);
    } else if (columnNames.includes('libelle')) {
      updates.push('libelle = ?');
      values.push(nom);
    }

    if (columnNames.includes('description')) {
      updates.push('description = ?');
      values.push(description || null);
    }

    if (columnNames.includes('updated_at')) {
      updates.push('updated_at = ?');
      values.push(new Date());
    }

    values.push(parseInt(id));

    const updateQuery = `UPDATE type_annonces SET ${updates.join(', ')} WHERE id = ?`;
    await prisma.$queryRawUnsafe(updateQuery, ...values);

    return NextResponse.json({
      success: true,
      message: 'Type d\'annonce mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du type d\'annonce' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un type d'annonce
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier s'il y a des produits avec ce type
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM produits WHERE type_annonce = ?
    `, id) as any[];
    
    const count = Number(countResult[0]?.count || 0);

    if (count > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer. ${count} bien(s) utilisent ce type.` },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      DELETE FROM type_annonces WHERE id = ?
    `, parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Type d\'annonce supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du type d\'annonce' },
      { status: 500 }
    );
  }
}

