import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Requête avec la vraie structure de la BDD
    const quartiers = await prisma.$queryRaw`
      SELECT 
        id, id_commune, nom, lat, lng,
        prix_min_location, prix_moy_location, prix_max_location,
        prix_min_vente, prix_moy_vente, prix_max_vente,
        prix_venal, prix_marchand, prix_moyen
      FROM quartiers 
      WHERE enabled = 1 AND deleted_at IS NULL
      ORDER BY nom ASC
    `;
    
    // Convertir BigInt en string pour la sérialisation JSON
    const quartiersSerialized = JSON.parse(JSON.stringify(quartiers, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    
    return NextResponse.json({
      success: true,
      data: quartiersSerialized
    });
  } catch (error) {
    console.error('Erreur API quartiers:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

