import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: { created_at: 'desc' },
    });

    const messagesFormatted = messages.map((m) => ({
      id: Number(m.id),
      nom: m.nom,
      email: m.email,
      telephone: m.telephone,
      sujet: m.sujet,
      message: m.message,
      lu: m.lu,
      created_at: m.created_at?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: messagesFormatted,
    });
  } catch (error) {
    console.error('Erreur API contact:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

