import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier la force du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur avec ce token via SQL directe
    const admins = await prisma.$queryRaw<any[]>`
      SELECT id, email, name
      FROM users
      WHERE reset_token = ${token}
        AND reset_token_expiry >= NOW()
      LIMIT 1
    `;

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    const admin = admins[0];

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe et supprimer le token via SQL directe
    await prisma.$executeRaw`
      UPDATE users 
      SET password = ${hashedPassword},
          reset_token = NULL,
          reset_token_expiry = NULL,
          updated_at = NOW()
      WHERE id = ${admin.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

