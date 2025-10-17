import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorie = searchParams.get('categorie');

    if (!categorie) {
      return NextResponse.json(
        { success: false, message: 'Paramètre categorie requis' },
        { status: 400 }
      );
    }

    // Utiliser requête SQL directe pour récupérer les sous-catégories
    const sousCategories = await prisma.$queryRawUnsafe(`
      SELECT code, nom, code_cat 
      FROM souscategories 
      WHERE code_cat = ? AND enabled = 1
      ORDER BY nom ASC
    `, categorie) as any[];

    return NextResponse.json({
      success: true,
      data: sousCategories,
    });
  } catch (error) {
    console.error('Erreur API sous-categories:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
