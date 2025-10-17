import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(
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

    const categorie = await prisma.categories.findUnique({
      where: { code: params.code }
    });

    if (!categorie) {
      return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      id: 0,
      code: categorie.code,
      nom: categorie.nom,
      description: '',
      images: categorie.images || '',
      enabled: Boolean(categorie.enabled),
      pro: Boolean(categorie.pro),
      created_at: categorie.created_at ? categorie.created_at.toISOString() : new Date().toISOString(),
      updated_at: categorie.updated_at ? categorie.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

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

    const categorie = await prisma.categories.update({
      where: { code: params.code },
      data: {
        nom: data.nom,
        images: data.images || null,
        enabled: data.enabled ? 1 : 0,
        pro: data.pro ? 1 : 0,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      id: 0,
      code: categorie.code,
      nom: categorie.nom,
      description: '',
      images: categorie.images || '',
      enabled: Boolean(categorie.enabled),
      pro: Boolean(categorie.pro),
      created_at: categorie.created_at ? categorie.created_at.toISOString() : new Date().toISOString(),
      updated_at: categorie.updated_at ? categorie.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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
      where: { code_categorie: params.code }
    });

    if (produitsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer la catégorie. ${produitsCount} produit(s) y sont liés.` },
        { status: 400 }
      );
    }

    await prisma.categories.delete({
      where: { code: params.code }
    });

    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

