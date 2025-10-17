import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Liste tous les types d'annonces
export async function GET(request: NextRequest) {
  try {
    const typeAnnonces = await prisma.$queryRawUnsafe(`
      SELECT * FROM type_annonces ORDER BY id ASC
    `) as any[];

    // Formater les données - utiliser libelle (la vraie colonne)
    const formatted = typeAnnonces.map(type => ({
      id: type.id.toString(),
      nom: type.libelle || 'Sans nom',
      created_at: type.created_at ? new Date(type.created_at).toISOString() : null,
      updated_at: type.updated_at ? new Date(type.updated_at).toISOString() : null
    }));

    return NextResponse.json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'annonces:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des types d\'annonces' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau type d'annonce
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

    // Utiliser libelle (vraie colonne dans la BD)
    await prisma.$queryRawUnsafe(`
      INSERT INTO type_annonces (libelle, created_at, updated_at)
      VALUES (?, ?, ?)
    `, nom, new Date(), new Date());

    return NextResponse.json({
      success: true,
      message: 'Type d\'annonce créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du type d\'annonce' },
      { status: 500 }
    );
  }
}

