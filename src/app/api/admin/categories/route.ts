import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    // Récupérer toutes les catégories avec le nombre de produits
    const categories = await prisma.$queryRaw<Array<any>>`
      SELECT 
        c.*,
        COUNT(DISTINCT p.code) as nombre_produits
      FROM categories c
      LEFT JOIN produits p ON c.code = p.code_categorie
      GROUP BY c.code, c.nom, c.images, c.enabled, c.pro, c.deleted_at, c.created_at, c.updated_at
      ORDER BY c.nom ASC
    `;

    const formattedCategories = categories.map((cat: any) => ({
      id: 0, // Pas d'id numérique, utilise 'code' comme clé
      code: cat.code,
      nom: cat.nom,
      description: '', // Pas de description dans la BD
      images: cat.images || '',
      enabled: Boolean(cat.enabled),
      pro: Boolean(cat.pro),
      nombre_produits: Number(cat.nombre_produits || 0),
      created_at: cat.created_at ? cat.created_at.toISOString() : new Date().toISOString(),
      updated_at: cat.updated_at ? cat.updated_at.toISOString() : new Date().toISOString()
    }));

    return NextResponse.json(formattedCategories);

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
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

    // Générer un code unique pour la catégorie
    const code = data.nom.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const categorie = await prisma.categories.create({
      data: {
        code,
        nom: data.nom,
        images: data.images || null,
        enabled: data.enabled ? 1 : 0,
        pro: data.pro ? 1 : 0,
        created_at: new Date(),
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
      nombre_produits: 0,
      created_at: categorie.created_at ? categorie.created_at.toISOString() : new Date().toISOString(),
      updated_at: categorie.updated_at ? categorie.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
