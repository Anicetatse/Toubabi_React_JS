import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const client = await prisma.clients.findUnique({
      where: { id: BigInt(params.id) }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      id: Number(client.id),
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone || '',
      role: client.type_compte,
      enabled: Boolean(client.enabled),
      created_at: client.created_at ? client.created_at.toISOString() : new Date().toISOString(),
      updated_at: client.updated_at ? client.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const data = await request.json();

    const client = await prisma.clients.update({
      where: { id: BigInt(params.id) },
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        type_compte: data.role,
        enabled: data.enabled,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      id: Number(client.id),
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone || '',
      role: client.type_compte,
      enabled: Boolean(client.enabled),
      created_at: client.created_at ? client.created_at.toISOString() : new Date().toISOString(),
      updated_at: client.updated_at ? client.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    await prisma.clients.delete({
      where: { id: BigInt(params.id) }
    });

    return NextResponse.json({ message: 'Client supprimé avec succès' });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { enabled } = await request.json();

    const client = await prisma.clients.update({
      where: { id: BigInt(params.id) },
      data: {
        enabled: enabled,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      id: Number(client.id),
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone || '',
      role: client.type_compte,
      enabled: Boolean(client.enabled),
      created_at: client.created_at ? client.created_at.toISOString() : new Date().toISOString(),
      updated_at: client.updated_at ? client.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

