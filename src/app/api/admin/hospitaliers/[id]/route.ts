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
    const hospitalierId = BigInt(id);

    const hospitalier = await prisma.hospitaliers.findUnique({
      where: { id: hospitalierId }
    });

    if (!hospitalier) {
      return NextResponse.json(
        { error: 'Établissement hospitalier non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (hospitalier.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(hospitalier.id_commune) }
      });
    }

    const hospitalierWithCommune = {
      ...hospitalier,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: hospitalierWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la hospitalier:', error);
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
    const hospitalierId = BigInt(id);
    const body = await request.json();

    const hospitalier = await prisma.hospitaliers.update({
      where: { id: hospitalierId },
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
    if (hospitalier.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(hospitalier.id_commune) }
      });
    }

    const hospitalierWithCommune = {
      ...hospitalier,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: hospitalierWithCommune,
      message: 'Établissement hospitalier modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la hospitalier:', error);
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
    const hospitalierId = BigInt(id);

    await prisma.hospitaliers.delete({
      where: { id: hospitalierId }
    });

    return NextResponse.json({
      success: true,
      message: 'Établissement hospitalier supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la hospitalier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
