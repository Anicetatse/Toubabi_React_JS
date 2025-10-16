import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Utiliser requête SQL directe car le schéma Prisma n'est pas encore synchronisé
    const categories = await prisma.$queryRawUnsafe(`
      SELECT code, nom, images, enabled 
      FROM categories 
      WHERE enabled = 1 
      ORDER BY nom ASC
    `) as any[];

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Erreur API categories:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

