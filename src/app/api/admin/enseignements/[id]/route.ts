import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { serializeBigInt } from '@/lib/bigint-serializer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const enseignementId = BigInt(id);

    const enseignement = await prisma.enseignements.findUnique({
      where: { id: enseignementId }
    });

    if (!enseignement) {
      return NextResponse.json(
        { error: 'Enseignement non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (enseignement.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(enseignement.id_commune) }
      });
    }

    const enseignementWithCommune = {
      ...enseignement,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: enseignementWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la enseignement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const enseignementId = BigInt(id);
    const body = await request.json();

    const enseignement = await prisma.enseignements.update({
      where: { id: enseignementId },
      data: {
        id_commune: body.id_commune ? parseInt(body.id_commune) : null,
        nom: body.nom,
        description: body.description || null,
        contact: body.contact || null,
        active: parseInt(body.active),
        updated_at: new Date()
      }
    });

    // Charger la commune
    let commune = null;
    if (enseignement.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(enseignement.id_commune) }
      });
    }

    const enseignementWithCommune = {
      ...enseignement,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: enseignementWithCommune,
      message: 'Enseignement modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la enseignement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const enseignementId = BigInt(id);

    await prisma.enseignements.delete({
      where: { id: enseignementId }
    });

    return NextResponse.json({
      success: true,
      message: 'Enseignement supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la enseignement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
