import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

// PUT - Modifier un client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const clientId = parseInt(params.id);
    const body = await request.json();
    const { nom, prenom, email, telephone, type_compte } = body;

    // Validation
    if (!nom || !prenom || !email) {
      return NextResponse.json(
        { error: 'Le nom, prénom et email sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si le client existe
    const client = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Vérifier si l'email est déjà utilisé par un autre client
    if (email !== client.email) {
      const existingClient = await prisma.clients.findUnique({
        where: { email }
      });

      if (existingClient && existingClient.id !== clientId) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre client' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le client
    await prisma.clients.update({
      where: { id: clientId },
      data: {
        nom,
        prenom,
        email,
        telephone: telephone || null,
        type_compte: type_compte || client.type_compte,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Client modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la modification du client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du client' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const clientId = parseInt(params.id);

    // Vérifier si le client existe
    const client = await prisma.clients.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Supprimer le client (ou soft delete selon votre logique)
    await prisma.clients.delete({
      where: { id: clientId }
    });

    return NextResponse.json({
      success: true,
      message: 'Client supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    );
  }
}
