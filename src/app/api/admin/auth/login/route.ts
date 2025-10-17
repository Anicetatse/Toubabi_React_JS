import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur admin dans la table users
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
    });

    // Retourner le token et les informations utilisateur
    return NextResponse.json({
      token,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        type: 'admin',
      },
    });

  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

