import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { nom: 'asc' },
    });

    const categoriesFormatted = categories.map((c) => ({
      id: Number(c.id),
      nom: c.nom,
      description: c.description,
      image: c.image,
      created_at: c.created_at?.toISOString(),
      updated_at: c.updated_at?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: categoriesFormatted,
    });
  } catch (error) {
    console.error('Erreur API admin categories:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

