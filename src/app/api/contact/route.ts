import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail, getContactAdminTemplate, getAdminEmail } from '@/lib/email';

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

    // Envoyer un email à l'admin
    try {
      const adminEmail = await getAdminEmail();
      await sendEmail({
        to: adminEmail,
        subject: 'Nouvelle demande de contact - Toubabi',
        html: getContactAdminTemplate({
          name: nom,
          email: email || 'Non fourni',
          message: `${description}\n\nNuméro: ${numero}\nProduit: ${code_produit}`
        })
      });
      console.log('Email de contact envoyé à l\'admin');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de contact:', emailError);
      // On continue même si l'email n'a pas pu être envoyé
    }

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
