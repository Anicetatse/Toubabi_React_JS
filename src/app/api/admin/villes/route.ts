import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste toutes les villes
export async function GET(request: NextRequest) {
  try {
    const villes = await prisma.$queryRawUnsafe(`
      SELECT * FROM villes
      WHERE deleted_at IS NULL
      ORDER BY nom ASC
    `) as any[];

    // Formater les données
    const formatted = villes.map(ville => ({
      id: ville.id.toString(),
      nom: ville.nom,
      created_at: ville.created_at ? new Date(ville.created_at).toISOString() : null,
      updated_at: ville.updated_at ? new Date(ville.updated_at).toISOString() : null
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des villes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des villes' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle ville
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom } = body;

    // Validation
    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    await prisma.$queryRawUnsafe(`
      INSERT INTO villes (nom, created_at, updated_at)
      VALUES (?, ?, ?)
    `, nom, new Date(), new Date());

    return NextResponse.json({
      success: true,
      message: 'Ville créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la ville' },
      { status: 500 }
    );
  }
}

