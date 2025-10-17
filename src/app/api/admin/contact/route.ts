import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer tous les messages de contact
    const contacts = await prisma.contacts.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    // Convertir les BigInt en Number
    const formattedContacts = contacts.map(contact => ({
      id: Number(contact.id),
      name: contact.name,
      email: contact.email,
      message: contact.message,
      created_at: contact.created_at ? contact.created_at.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ contacts: formattedContacts });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

