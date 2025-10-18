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
    const serviceId = BigInt(id);

    const service = await prisma.services_publics.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service public non trouvée' },
        { status: 404 }
      );
    }

    // Charger la commune
    let commune = null;
    if (service.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(service.id_commune) }
      });
    }

    const serviceWithCommune = {
      ...service,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: serviceWithCommune
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de la service:', error);
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
    const serviceId = BigInt(id);
    const body = await request.json();

    const service = await prisma.services_publics.update({
      where: { id: serviceId },
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
    if (service.id_commune) {
      commune = await prisma.communes.findUnique({
        where: { id: BigInt(service.id_commune) }
      });
    }

    const serviceWithCommune = {
      ...service,
      commune
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: serviceWithCommune,
      message: 'Service public modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de la service:', error);
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
    const serviceId = BigInt(id);

    await prisma.services_publics.delete({
      where: { id: serviceId }
    });

    return NextResponse.json({
      success: true,
      message: 'Service public supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la service:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
