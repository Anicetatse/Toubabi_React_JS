import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = '';
    const params: any[] = [];
    
    if (search) {
      whereClause += ' AND (p.nom LIKE ? OR p.description LIKE ? OR c.nom LIKE ? OR c.email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        whereClause += ' AND p.enabled = 1';
      } else if (status === 'inactive') {
        whereClause += ' AND p.enabled = 0';
      }
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM produits p
      LEFT JOIN clients c ON p.client_owner_id = c.id
      LEFT JOIN communes co ON p.id_commune = co.id
      LEFT JOIN quartiers q ON p.id_quartier = q.id
      LEFT JOIN categories cat ON p.code_categorie = cat.code
      WHERE 1=1 ${whereClause}
    `;
    
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params);
    const total = Number((countResult as any)[0].total);

    // Get data
    const dataQuery = `
      SELECT 
        p.code,
        p.nom,
        p.description,
        p.image,
        p.prix_vente,
        p.surface,
        p.piece,
        p.chambre,
        p.type_annonce,
        p.enabled,
        p.created_at,
        p.updated_at,
        c.nom as client_nom,
        c.prenom as client_prenom,
        c.email as client_email,
        co.nom as commune_nom,
        q.nom as quartier_nom,
        cat.nom as categorie_nom
      FROM produits p
      LEFT JOIN clients c ON p.client_owner_id = c.id
      LEFT JOIN communes co ON p.id_commune = co.id
      LEFT JOIN quartiers q ON p.id_quartier = q.id
      LEFT JOIN categories cat ON p.code_categorie = cat.code
      WHERE 1=1 ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const data = await prisma.$queryRawUnsafe(dataQuery, ...params, limit, offset);

    // Convertir les BigInt en string pour la sérialisation JSON
    const serializedData = (data as any[]).map(item => ({
      ...item,
      prix_vente: item.prix_vente ? item.prix_vente.toString() : '0',
      prix_achat: item.prix_achat ? item.prix_achat.toString() : null
    }));

    return NextResponse.json({
      success: true,
      data: serializedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API annonces:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des annonces' },
      { status: 500 }
    );
  }
}
