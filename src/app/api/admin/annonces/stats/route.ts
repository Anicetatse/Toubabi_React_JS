import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Compter le total d'annonces
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM produits
    `;
    
    // Compter par statut
    const statusCount = await prisma.$queryRaw`
      SELECT enabled, COUNT(*) as count 
      FROM produits 
      GROUP BY enabled
    `;
    
    // Compter par type
    const typeCount = await prisma.$queryRaw`
      SELECT type_annonce, COUNT(*) as count 
      FROM produits 
      GROUP BY type_annonce
    `;
    
    // Compter les annonces de ce mois
    const thisMonthCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM produits 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `;

    const total = Number((totalCount as any)[0].total);
    const thisMonth = Number((thisMonthCount as any)[0].count);
    
    // Organiser les stats par statut
    const activeCount = (statusCount as any[]).find(s => s.enabled === 1)?.count || 0;
    const inactiveCount = (statusCount as any[]).find(s => s.enabled === 0)?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        total,
        active: Number(activeCount),
        inactive: Number(inactiveCount),
        thisMonth
      }
    });

  } catch (error) {
    console.error('Erreur API stats annonces:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
