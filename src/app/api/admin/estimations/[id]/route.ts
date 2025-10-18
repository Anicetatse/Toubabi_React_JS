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
    const estimationId = BigInt(id);

    const estimation = await prisma.estimes.findUnique({
      where: { id: estimationId }
    });

    if (!estimation) {
      return NextResponse.json(
        { error: 'Estimation non trouvée' },
        { status: 404 }
      );
    }

    // Charger le quartier et la commune
    let quartier = null;
    if (estimation.id_quartier) {
      quartier = await prisma.quartiers.findUnique({
        where: { id: BigInt(estimation.id_quartier) },
        include: { commune: true }
      });
    }

    const estimationWithQuartier = {
      ...estimation,
      quartier
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: estimationWithQuartier
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'estimation:', error);
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
    const estimationId = BigInt(id);
    const body = await request.json();

    const estimation = await prisma.estimes.update({
      where: { id: estimationId },
      data: {
        id_quartier: body.id_quartier ? parseInt(body.id_quartier) : null,
        coefficient_occupa_sols: body.coefficient_occupa_sols ? parseFloat(body.coefficient_occupa_sols) : null,
        hauteur: body.hauteur ? parseFloat(body.hauteur) : null,
        niveau: body.niveau ? parseInt(body.niveau) : null,
        updated_at: new Date()
      }
    });

    // Charger le quartier et la commune
    let quartier = null;
    if (estimation.id_quartier) {
      quartier = await prisma.quartiers.findUnique({
        where: { id: BigInt(estimation.id_quartier) },
        include: { commune: true }
      });
    }

    const estimationWithQuartier = {
      ...estimation,
      quartier
    };

    return NextResponse.json(serializeBigInt({
      success: true,
      data: estimationWithQuartier,
      message: 'Estimation modifiée avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la modification de l\'estimation:', error);
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
    const estimationId = BigInt(id);

    await prisma.estimes.delete({
      where: { id: estimationId }
    });

    return NextResponse.json({
      success: true,
      message: 'Estimation supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'estimation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

