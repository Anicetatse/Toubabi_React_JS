import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-utils';

const prisma = new PrismaClient();

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

    // Générer les labels EXACTEMENT comme Laravel (lignes 22-27)
    const labels = [];
    for (let days = 30; days >= 0; days--) {
      if (days === 1) labels.push('hier');
      else if (days === 2) labels.push('avant hier');
      else if (days === 0) labels.push("aujourd'hui");
      else labels.push(`il y a ${days} jours`);
    }

    // Récupérer les données pour les 31 derniers jours (lignes 47-55)
    const clientsData = [];
    const biensData = [];
    const commandesData = [];

    for (let days = 30; days >= 0; days--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - days);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Compter les clients créés ce jour
      const clientsCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count 
        FROM clients 
        WHERE DATE(created_at) = ${dateStr}
      `;
      clientsData.push(Number(clientsCount[0]?.count || 0));

      // Compter les biens créés ce jour
      const biensCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count 
        FROM produits 
        WHERE DATE(created_at) = ${dateStr}
      `;
      biensData.push(Number(biensCount[0]?.count || 0));

      // Compter les commandes créées ce jour
      const commandesCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count 
        FROM commandes 
        WHERE DATE(created_at) = ${dateStr}
      `;
      commandesData.push(Number(commandesCount[0]?.count || 0));
    }

    // Formater comme Laravel (lignes 57-67)
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Clients',
          data: clientsData,
          borderColor: 'rgb(66, 186, 150)',
          backgroundColor: 'rgba(66, 186, 150, 0.4)',
          tension: 0.3,
        },
        {
          label: 'Biens',
          data: biensData,
          borderColor: 'rgb(96, 92, 168)',
          backgroundColor: 'rgba(96, 92, 168, 0.4)',
          tension: 0.3,
        },
        {
          label: 'Demandes',
          data: commandesData,
          borderColor: 'rgb(255, 193, 7)',
          backgroundColor: 'rgba(255, 193, 7, 0.4)',
          tension: 0.3,
        },
      ],
    };

    return NextResponse.json(chartData);

  } catch (error) {
    console.error('Erreur lors de la récupération des données du graphique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

