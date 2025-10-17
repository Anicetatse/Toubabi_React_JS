import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, prenom, email, telephone, type_compte, password, password_confirmation, captcha } = body;

    // Validation
    if (!nom || !prenom || !email || !telephone || !password || !type_compte) {
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

    // Vérifier si l'email existe déjà
    const existingClient = await prisma.clients.findUnique({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json(
        { message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Créer le client
    const hashedPassword = await hashPassword(password);
    
    const client = await prisma.clients.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
        telephone,
        type_compte,
        enabled: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Générer le token
    const token = generateToken({
      userId: client.id.toString(),
      email: client.email,
    });

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: Number(client.id),
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      type_compte: client.type_compte,
    };

    return NextResponse.json({
      data: {
        token,
        user: userData,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}

