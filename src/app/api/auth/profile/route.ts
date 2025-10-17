import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
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

    const userData = {
      id: Number(client.id),
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      image: client.image,
      type_compte: client.type_compte,
    };

    return NextResponse.json({
      data: userData,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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
    const { nom, prenom, telephone, image } = body;

    // Mettre à jour le client
    const updatedClient = await prisma.clients.update({
      where: { id: BigInt(payload.userId) },
      data: {
        nom,
        prenom,
        telephone,
        image,
        updated_at: new Date(),
      },
    });

    const userData = {
      id: Number(updatedClient.id),
      nom: updatedClient.nom,
      prenom: updatedClient.prenom,
      email: updatedClient.email,
      telephone: updatedClient.telephone,
      image: updatedClient.image,
      type_compte: updatedClient.type_compte,
    };

    return NextResponse.json({
      data: userData,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

