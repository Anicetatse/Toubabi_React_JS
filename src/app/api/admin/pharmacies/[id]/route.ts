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
    const pharmacieId = BigInt(id);

    const pharmacie = await prisma.pharmaciede_gardes.findUnique({
      where: { id: pharmacieId }
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: 'Pharmacie non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (pharmacie.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(pharmacie.id_commune) }
      });
    }

    const pharmacieWithCommune = {
      ...pharmacie,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: pharmacieWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la pharmacie:', error);
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
    const pharmacieId = BigInt(id);
    const body = await request.json();

    const pharmacie = await prisma.pharmaciede_gardes.update({
      where: { id: pharmacieId },
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
    if (pharmacie.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(pharmacie.id_commune) }
      });
    }

    const pharmacieWithCommune = {
      ...pharmacie,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: pharmacieWithCommune,
      message: 'Pharmacie modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la pharmacie:', error);
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
    const pharmacieId = BigInt(id);

    await prisma.pharmaciede_gardes.delete({
      where: { id: pharmacieId }
    });

    return NextResponse.json({
      success: true,
      message: 'Pharmacie supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

