import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractToken, verifyToken, hashPassword, verifyPassword } from '@/lib/auth-utils';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { current_password, password, password_confirmation } = body;

    if (!current_password || !password || !password_confirmation) {
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

    // Récupérer le client
    const client = await prisma.clients.findUnique({
      where: { id: BigInt(payload.userId) },
    });

    if (!client) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await verifyPassword(current_password, client.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await hashPassword(password);
    await prisma.clients.update({
      where: { id: BigInt(payload.userId) },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      data: {
        message: 'Mot de passe modifié avec succès',
      },
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

