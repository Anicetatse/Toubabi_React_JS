import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const data = await request.json();

    const sousCategorie = await prisma.souscategories.update({
      where: { code: params.code },
      data: {
        code_cat: data.code_cat,
        nom: data.nom,
        image: data.image || null,
        position: data.position || 0,
        enabled: data.enabled ? 1 : 0,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      code: sousCategorie.code,
      code_cat: sousCategorie.code_cat,
      nom: sousCategorie.nom,
      image: sousCategorie.image,
      position: sousCategorie.position,
      enabled: sousCategorie.enabled,
      created_at: sousCategorie.created_at ? sousCategorie.created_at.toISOString() : new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier s'il y a des produits liés
    const produitsCount = await prisma.produits.count({
      where: { code_souscategorie: params.code }
    });

    if (produitsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer la sous-catégorie. ${produitsCount} produit(s) y sont liés.` },
        { status: 400 }
      );
    }

    await prisma.souscategories.delete({
      where: { code: params.code }
    });

    return NextResponse.json({ message: 'Sous-catégorie supprimée avec succès' });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

