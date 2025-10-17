import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer toutes les sous-catégories avec le nom de la catégorie parente
    const souscategories = await prisma.$queryRaw<any[]>`
      SELECT 
        sc.*,
        c.nom as categorie_nom
      FROM souscategories sc
      LEFT JOIN categories c ON sc.code_cat = c.code
      ORDER BY sc.position ASC, sc.nom ASC
    `;

    const formatted = souscategories.map((sc: any) => ({
      code: sc.code,
      code_cat: sc.code_cat,
      categorie_nom: sc.categorie_nom || 'N/A',
      position: sc.position,
      nom: sc.nom,
      image: sc.image,
      enabled: sc.enabled,
      created_at: sc.created_at ? sc.created_at.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
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

    // Générer un code unique
    const code = data.nom.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const sousCategorie = await prisma.souscategories.create({
      data: {
        code,
        code_cat: data.code_cat,
        nom: data.nom,
        image: data.image || null,
        position: data.position || 0,
        enabled: data.enabled ? 1 : 0,
        created_at: new Date(),
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

