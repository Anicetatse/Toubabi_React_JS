import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, commentaire, note, produit_code } = body;

    // Validation
    if (!nom || !commentaire || !note || !produit_code) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (note < 1 || note > 5) {
      return NextResponse.json(
        { error: 'La note doit être entre 1 et 5' },
        { status: 400 }
      );
    }

    // Insérer le commentaire avec SQL brut
    const insertQuery = `
      INSERT INTO commentaires (nom, commentaire, note, produit_code, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    await prisma.$queryRawUnsafe(
      insertQuery,
      nom,
      commentaire,
      note,
      produit_code
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Commentaire ajouté avec succès' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

