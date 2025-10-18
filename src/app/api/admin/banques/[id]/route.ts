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
    const banqueId = BigInt(id);

    const banque = await prisma.banques.findUnique({
      where: { id: banqueId }
    });

    if (!banque) {
      return NextResponse.json(
        { error: 'Banque non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (banque.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(banque.id_commune) }
      });
    }

    const banqueWithCommune = {
      ...banque,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: banqueWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la banque:', error);
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
    const banqueId = BigInt(id);
    const body = await request.json();

    const banque = await prisma.banques.update({
      where: { id: banqueId },
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
    if (banque.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(banque.id_commune) }
      });
    }

    const banqueWithCommune = {
      ...banque,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: banqueWithCommune,
      message: 'Banque modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la banque:', error);
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
    const banqueId = BigInt(id);

    await prisma.banques.delete({
      where: { id: banqueId }
    });

    return NextResponse.json({
      success: true,
      message: 'Banque supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la banque:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
