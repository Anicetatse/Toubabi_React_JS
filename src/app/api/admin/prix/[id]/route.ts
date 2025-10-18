import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET - Récupérer un prix spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { id } = await params;
    const prixId = parseInt(id);

    // Récupérer le prix avec ses relations
    const prix = await prisma.prix.findUnique({
      where: { id: prixId },
      include: {
        quartier: {
          include: {
            commune: true
          }
        },
        categorie: true,
        souscategorie: true
      }
    });

    if (!prix) {
      return NextResponse.json({ error: 'Prix non trouvé' }, { status: 404 });
    }

    return NextResponse.json(serializeBigInt({
      success: true,
      data: prix
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération du prix:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un prix
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { id } = await params;
    const prixId = parseInt(id);
    const body = await request.json();
    const {
      id_quartier,
      code_categorie,
      code_sous_categorie,
      prix_min_location,
      prix_moy_location,
      prix_max_location,
      prix_min_vente,
      prix_moy_vente,
      prix_max_vente
    } = body;

    // Vérifier si le prix existe
    const existingPrix = await prisma.prix.findUnique({
      where: { id: prixId }
    });

    if (!existingPrix) {
      return NextResponse.json({ error: 'Prix non trouvé' }, { status: 404 });
    }

    // Vérifier si la nouvelle combinaison existe déjà (sauf pour le prix actuel)
    if (id_quartier && code_categorie) {
      const duplicatePrix = await prisma.prix.findFirst({
        where: {
          id: { not: prixId },
          id_quartier: parseInt(id_quartier),
          code_categorie,
          code_sous_categorie: code_sous_categorie || null
        }
      });

      if (duplicatePrix) {
        return NextResponse.json(
          { error: 'Un prix existe déjà pour cette combinaison quartier/catégorie/sous-catégorie' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le prix
    const prixModifie = await prisma.prix.update({
      where: { id: prixId },
      data: {
        id_quartier: id_quartier ? parseInt(id_quartier) : undefined,
        code_categorie: code_categorie || undefined,
        code_sous_categorie: code_sous_categorie || null,
        prix_min_location: prix_min_location ? parseInt(prix_min_location) : null,
        prix_moy_location: prix_moy_location ? parseInt(prix_moy_location) : null,
        prix_max_location: prix_max_location ? parseInt(prix_max_location) : null,
        prix_min_vente: prix_min_vente ? parseInt(prix_min_vente) : null,
        prix_moy_vente: prix_moy_vente ? parseInt(prix_moy_vente) : null,
        prix_max_vente: prix_max_vente ? parseInt(prix_max_vente) : null
      },
      include: {
        quartier: {
          include: {
            commune: true
          }
        },
        categorie: true,
        souscategorie: true
      }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: prixModifie,
      message: 'Prix modifié avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification du prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du prix' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un prix
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { id } = await params;
    const prixId = parseInt(id);

    // Vérifier si le prix existe
    const existingPrix = await prisma.prix.findUnique({
      where: { id: prixId }
    });

    if (!existingPrix) {
      return NextResponse.json({ error: 'Prix non trouvé' }, { status: 404 });
    }

    // Supprimer le prix
    await prisma.prix.delete({
      where: { id: prixId }
    });

    return NextResponse.json({
      success: true,
      message: 'Prix supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du prix' },
      { status: 500 }
    );
  }
}
