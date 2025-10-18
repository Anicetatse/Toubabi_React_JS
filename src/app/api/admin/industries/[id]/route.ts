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
    const industrieId = BigInt(id);

    const industrie = await prisma.industries.findUnique({
      where: { id: industrieId }
    });

    if (!industrie) {
      return NextResponse.json(
        { error: 'Industrie non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (industrie.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(industrie.id_commune) }
      });
    }

    const industrieWithCommune = {
      ...industrie,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: industrieWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la industrie:', error);
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
    const industrieId = BigInt(id);
    const body = await request.json();

    const industrie = await prisma.industries.update({
      where: { id: industrieId },
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
    if (industrie.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(industrie.id_commune) }
      });
    }

    const industrieWithCommune = {
      ...industrie,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: industrieWithCommune,
      message: 'Industrie modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la industrie:', error);
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
    const industrieId = BigInt(id);

    await prisma.industries.delete({
      where: { id: industrieId }
    });

    return NextResponse.json({
      success: true,
      message: 'Industrie supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la industrie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
