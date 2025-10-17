import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Statistiques des commentaires
export async function GET() {
  try {
    const stats = {
      total: await prisma.commentaires.count(),
      active: await prisma.commentaires.count({ where: { active: 1 } }),
      inactive: await prisma.commentaires.count({ where: { active: 0 } }),
      thisMonth: await prisma.commentaires.count({
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

