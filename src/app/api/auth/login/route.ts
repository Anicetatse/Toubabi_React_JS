import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, telephone, password } = body;

    // L'identifiant peut être soit un email soit un téléphone
    const identifier = email || telephone;

    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Email/Téléphone et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher le client par email ou téléphone
    const client = await prisma.clients.findFirst({
      where: {
        OR: [
          { email: identifier },
          { telephone: identifier },
        ],
      },
    });

    console.log('🔍 Login attempt:', { identifier, clientFound: !!client });

    if (!client) {
      console.log('❌ Client not found');
      return NextResponse.json(
        { message: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    console.log('✅ Client found:', { id: client.id, email: client.email, enabled: client.enabled });

    // Vérifier si le compte est activé
    if (!client.enabled) {
      console.log('❌ Account disabled');
      return NextResponse.json(
        { message: 'Votre compte n\'est pas encore activé. Veuillez vérifier votre email ou contactez l\'administrateur.' },
        { status: 403 }
      );
    }

    // Vérifier le mot de passe
    console.log('🔐 Verifying password...');
    console.log('Hash from DB:', client.password.substring(0, 20) + '...');
    
    const isPasswordValid = await verifyPassword(password, client.password);
    
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { message: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    console.log('✅ Login successful!');

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
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}

