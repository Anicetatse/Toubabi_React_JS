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
    }));

    return NextResponse.json({
      success: true,
      data: categoriesFormatted,
    });
  } catch (error) {
    console.error('Erreur API categories:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

