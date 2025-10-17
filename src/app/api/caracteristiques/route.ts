import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Récupérer les caractéristiques depuis la base de données
    const caracteristiques = await prisma.$queryRawUnsafe(`
      SELECT id, nom, active 
      FROM caracteristiques 
      WHERE active = 1 
      ORDER BY nom ASC
    `) as any[];

    // Convertir les BigInt en Number pour la sérialisation JSON
    const formattedCaracteristiques = caracteristiques.map(c => ({
      id: Number(c.id),
      nom: c.nom,
      active: c.active
    }));

    return NextResponse.json({
      success: true,
      data: formattedCaracteristiques,
    });
  } catch (error) {
    console.error('Erreur API caracteristiques:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
