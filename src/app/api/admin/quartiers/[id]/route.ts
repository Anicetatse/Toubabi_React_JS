import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour un quartier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      nom, 
      id_commune, 
      images, 
      enabled, 
      lat, 
      lng,
      prix_min_location,
      prix_moy_location,
      prix_max_location,
      prix_min_vente,
      prix_moy_vente,
      prix_max_vente,
      prix_venal,
      prix_marchand,
      prix_moyen
    } = body;

    if (!nom || !id_commune) {
      return NextResponse.json(
        { error: 'Le nom et la commune sont requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      UPDATE quartiers 
      SET nom = ?, id_commune = ?, images = ?, enabled = ?, lat = ?, lng = ?,
          prix_min_location = ?, prix_moy_location = ?, prix_max_location = ?,
          prix_min_vente = ?, prix_moy_vente = ?, prix_max_vente = ?,
          prix_venal = ?, prix_marchand = ?, prix_moyen = ?,
          updated_at = ?
      WHERE id = ?
    `, 
      nom, 
      parseInt(id_commune), 
      images || null, 
      enabled ? 1 : 0, 
      lat || null, 
      lng || null,
      prix_min_location ? parseInt(prix_min_location) : null,
      prix_moy_location ? parseInt(prix_moy_location) : null,
      prix_max_location ? parseInt(prix_max_location) : null,
      prix_min_vente ? parseInt(prix_min_vente) : null,
      prix_moy_vente ? parseInt(prix_moy_vente) : null,
      prix_max_vente ? parseInt(prix_max_vente) : null,
      prix_venal ? parseInt(prix_venal) : null,
      prix_marchand ? parseInt(prix_marchand) : null,
      prix_moyen ? parseInt(prix_moyen) : null,
      new Date(), 
      parseInt(id)
    );

    return NextResponse.json({
      success: true,
      message: 'Quartier mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du quartier' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un quartier (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier s'il y a des produits liés
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count FROM produits WHERE id_quartier = ?
    `, parseInt(id)) as any[];
    
    const count = Number(countResult[0]?.count || 0);

    if (count > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer. ${count} bien(s) sont liés à ce quartier.` },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.$queryRawUnsafe(`
      UPDATE quartiers SET deleted_at = ? WHERE id = ?
    `, new Date(), parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Quartier supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du quartier' },
      { status: 500 }
    );
  }
}

