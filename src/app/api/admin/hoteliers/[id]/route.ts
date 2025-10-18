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
    const hotelierId = BigInt(id);

    const hotelier = await prisma.hoteliers.findUnique({
      where: { id: hotelierId }
    });

    if (!hotelier) {
      return NextResponse.json(
        { error: 'Hôtelier non trouvé' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (hotelier.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(hotelier.id_commune) }
      });
    }

    const hotelierWithCommune = {
      ...hotelier,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: hotelierWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'hôtelier:', error);
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
    const hotelierId = BigInt(id);
    const body = await request.json();

    const hotelier = await prisma.hoteliers.update({
      where: { id: hotelierId },
      data: {
        id_commune: body.id_commune ? parseInt(body.id_commune) : null,
        nom: body.nom,
        description: body.description || null,
        contact: body.contact || null,
        videos: body.videos || null,
        images1: body.images1 || null,
        images2: body.images2 || null,
        images3: body.images3 || null,
        images4: body.images4 || null,
        images5: body.images5 || null,
        images6: body.images6 || null,
        images7: body.images7 || null,
        images8: body.images8 || null,
        images9: body.images9 || null,
        images10: body.images10 || null,
        active: parseInt(body.active),
        updated_at: new Date()
      }
    });

    // Charger la commune
    let commune = null;
    if (hotelier.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(hotelier.id_commune) }
      });
    }

    const hotelierWithCommune = {
      ...hotelier,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: hotelierWithCommune,
      message: 'Hôtelier modifié avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de l\'hôtelier:', error);
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
    const hotelierId = BigInt(id);

    await prisma.hoteliers.delete({
      where: { id: hotelierId }
    });

    return NextResponse.json({
      success: true,
      message: 'Hôtelier supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'hôtelier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

