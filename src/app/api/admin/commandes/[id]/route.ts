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

    const commande = await prisma.commandes.findUnique({
      where: { id: BigInt(params.id) },
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (!commande) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      id: Number(commande.id),
      numero_commande: `CMD-${commande.id.toString().padStart(6, '0')}`,
      status: Number(commande.status),
      nom: commande.nom,
      email: commande.email || '',
      numero: commande.numero || '',
      code_produit: commande.code_produit,
      detail: commande.detail || '',
      description: commande.description || '',
      client_nom: commande.client ? `${commande.client.nom} ${commande.client.prenom}` : 'N/A',
      created_at: commande.created_at ? commande.created_at.toISOString() : new Date().toISOString(),
      updated_at: commande.updated_at ? commande.updated_at.toISOString() : new Date().toISOString()
    });

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

    const { status } = await request.json();

    const commande = await prisma.commandes.update({
      where: { id: BigInt(params.id) },
      data: {
        status: Number(status),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      id: Number(commande.id),
      numero_commande: `CMD-${commande.id.toString().padStart(6, '0')}`,
      status: Number(commande.status),
      nom: commande.nom,
      email: commande.email || '',
      numero: commande.numero || '',
      code_produit: commande.code_produit,
      detail: commande.detail || '',
      description: commande.description || '',
      created_at: commande.created_at ? commande.created_at.toISOString() : new Date().toISOString(),
      updated_at: commande.updated_at ? commande.updated_at.toISOString() : new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

