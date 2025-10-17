import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si le client existe
    const client = await prisma.clients.findUnique({
      where: { email },
    });

    // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
    // En production, vous devriez envoyer un vrai email ici
    
    return NextResponse.json({
      data: {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

