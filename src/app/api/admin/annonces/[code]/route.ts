import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const query = `
      SELECT 
        p.*,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        c.telephone as client_telephone,
        co.nom as commune_nom,
        q.nom as quartier_nom,
        cat.nom as categorie_nom,
        sc.nom as souscategorie_nom
      FROM produits p
      LEFT JOIN clients c ON p.client_owner_id = c.id
      LEFT JOIN communes co ON p.id_commune = co.id
      LEFT JOIN quartiers q ON p.id_quartier = q.id
      LEFT JOIN categories cat ON p.code_categorie = cat.code
      LEFT JOIN souscategories sc ON p.code_souscategorie = sc.code
      WHERE p.code = ?
      LIMIT 1
    `;

    const result = await prisma.$queryRawUnsafe(query, code);
    const annonce = (result as any)[0];

    if (!annonce) {
      return NextResponse.json(
        { success: false, error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Convertir les BigInt en string pour la sérialisation JSON
    const serializedAnnonce = {
      ...annonce,
      prix_vente: annonce.prix_vente ? annonce.prix_vente.toString() : '0',
      prix_achat: annonce.prix_achat ? annonce.prix_achat.toString() : null
    };

    return NextResponse.json({
      success: true,
      data: serializedAnnonce
    });

  } catch (error) {
    console.error('Erreur API annonce:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await request.json();
    const { nom, description, prix_vente, surface, piece, chambre, type_annonce } = body;

    await prisma.$executeRawUnsafe(
      `UPDATE produits 
       SET nom = ?, description = ?, prix_vente = ?, surface = ?, piece = ?, chambre = ?, type_annonce = ?, updated_at = NOW()
       WHERE code = ?`,
      nom,
      description,
      prix_vente,
      surface,
      piece,
      chambre,
      type_annonce,
      code
    );

    return NextResponse.json({
      success: true,
      message: 'Annonce mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API update annonce:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await request.json();
    const { enabled } = body;

    if (enabled !== undefined) {
      await prisma.$executeRawUnsafe(
        'UPDATE produits SET enabled = ?, updated_at = NOW() WHERE code = ?',
        enabled,
        code
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Annonce mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur API mise à jour annonce:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'annonce' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    // Vérifier si l'annonce existe
    const existingAnnonce = await prisma.$queryRawUnsafe(
      'SELECT code FROM produits WHERE code = ?',
      code
    );

    if (!(existingAnnonce as any).length) {
      return NextResponse.json(
        { success: false, error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer l'annonce
    await prisma.$executeRawUnsafe(
      'DELETE FROM produits WHERE code = ?',
      code
    );

    return NextResponse.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur API suppression annonce:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'annonce' },
      { status: 500 }
    );
  }
}
