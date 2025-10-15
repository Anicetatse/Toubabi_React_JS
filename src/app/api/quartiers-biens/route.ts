import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint pour les biens (compteurs simples) via SQL brut, compatible avec la BDD existante
export async function GET(request: NextRequest) {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT 
        q.id,
        q.nom AS titre,
        q.lng,
        q.lat,
        COUNT(p.id) AS nbre_biens
      FROM quartiers q
      LEFT JOIN produits p ON p.quartier_id = q.id
      WHERE q.lng IS NOT NULL AND q.lat IS NOT NULL
      GROUP BY q.id, q.nom, q.lng, q.lat
      HAVING nbre_biens > 0
      ORDER BY q.nom ASC
    `);

    // sérialiser BigInt et compléter les champs attendus
    const data = rows.map((r: any) => ({
      id: String(r.id),
      titre: r.titre,
      lng: r.lng?.toString?.() ?? r.lng,
      lat: r.lat?.toString?.() ?? r.lat,
      nbre_biens: Number(r.nbre_biens) || 0,
      nbre_vente: 0,
      nbre_location: 0,
    }));
    const serialized = JSON.parse(JSON.stringify(data, (k, v) => typeof v === 'bigint' ? v.toString() : v));
    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('Error fetching quartiers biens (raw):', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch quartiers biens' }, { status: 500 });
  }
}
