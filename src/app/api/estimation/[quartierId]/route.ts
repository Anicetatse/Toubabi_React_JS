import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { quartierId: string } }
) {
  try {
    const { quartierId } = params;

    // Récupérer les données d'estimation pour le quartier
    const estimationData = await prisma.$queryRawUnsafe(`
      SELECT 
        coefficient_occupa_sols,
        hauteur,
        niveau
      FROM estimes 
      WHERE id_quartier = ?
      LIMIT 1
    `, quartierId);

    if (!estimationData || (estimationData as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No estimation data found for this quartier' },
        { status: 404 }
      );
    }

    const data = (estimationData as any[])[0];

    return NextResponse.json({
      success: true,
      data: {
        coefficient_occupa_sols: parseFloat(data.coefficient_occupa_sols),
        hauteur: parseFloat(data.hauteur),
        niveau: parseInt(data.niveau),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'estimation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch estimation data' },
      { status: 500 }
    );
  }
}
