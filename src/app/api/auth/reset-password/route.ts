import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password, password_confirmation } = body;

    if (!token || !email || !password || !password_confirmation) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        { message: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // En production, vérifier le token de réinitialisation ici
    // Pour l'instant, on cherche juste le client par email
    
    const client = await prisma.clients.findUnique({
      where: { email },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await hashPassword(password);
    await prisma.clients.update({
      where: { email },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      data: {
        message: 'Mot de passe réinitialisé avec succès',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

