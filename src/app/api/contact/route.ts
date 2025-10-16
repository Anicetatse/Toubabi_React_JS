import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, email, numero, description, code_produit, id_client } = body;

    // Validation
    if (!nom || !numero || !description || !code_produit) {
      return NextResponse.json(
        { error: 'Les champs nom, numéro, description et code produit sont requis' },
        { status: 400 }
      );
    }

    // Créer la table contacts si elle n'existe pas (à adapter selon votre schéma)
    // Pour l'instant, on va juste retourner un succès
    // Dans un vrai projet, vous enregistreriez dans une table contacts ou envoyeriez un email

    console.log('Contact reçu:', { nom, email, numero, description, code_produit, id_client });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Votre demande a été envoyée avec succès' 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'envoi du formulaire de contact:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
