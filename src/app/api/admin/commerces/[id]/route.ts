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
    const commerceId = BigInt(id);

    const commerce = await prisma.commerces.findUnique({
      where: { id: commerceId }
    });

    if (!commerce) {
      return NextResponse.json(
        { error: 'Commerce non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (commerce.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(commerce.id_commune) }
      });
    }

    const commerceWithCommune = {
      ...commerce,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: commerceWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la commerce:', error);
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
    const commerceId = BigInt(id);
    const body = await request.json();

    const commerce = await prisma.commerces.update({
      where: { id: commerceId },
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
    if (commerce.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(commerce.id_commune) }
      });
    }

    const commerceWithCommune = {
      ...commerce,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: commerceWithCommune,
      message: 'Commerce modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la commerce:', error);
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
    const commerceId = BigInt(id);

    await prisma.commerces.delete({
      where: { id: commerceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Commerce supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la commerce:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
