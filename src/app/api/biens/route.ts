import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 12;
    const offset = (page - 1) * perPage;

    // Construire la requête SQL comme Laravel
    let whereConditions: string[] = ['p.enabled = 1'];
    let queryParams: any[] = [];

    // Filtre par type (louer/acheter)
    const type = searchParams.get('type');
    if (type) {
      whereConditions.push('p.type_annonce = ?');
      queryParams.push(type);
    }

    // Filtre par commune  
    const communeId = searchParams.get('commune');
    if (communeId) {
      whereConditions.push('p.id_commune = ?');
      queryParams.push(parseInt(communeId));
    }

    // Filtre par quartier
    const quartierId = searchParams.get('quartier');
    if (quartierId) {
      whereConditions.push('p.id_quartier = ?');
      queryParams.push(parseInt(quartierId));
    }

    // Filtre par catégories (peut être multiple via code)
    const categories = searchParams.getAll('cate[]');
    if (categories.length > 0) {
      const placeholders = categories.map(() => '?').join(',');
      whereConditions.push(`p.code_categorie IN (${placeholders})`);
      queryParams.push(...categories);
    }

    // Filtre par nombre de pièces
    const piece = searchParams.get('piece');
    if (piece) {
      const pieceNum = parseInt(piece);
      if (pieceNum === 6) {
        whereConditions.push('p.piece > 5');
      } else {
        whereConditions.push('p.piece = ?');
        queryParams.push(pieceNum);
      }
    }

    // Filtre par nombre de chambres
    const chambre = searchParams.get('chambre');
    if (chambre) {
      const chambreNum = parseInt(chambre);
      if (chambreNum === 6) {
        whereConditions.push('p.chambre > 5');
      } else {
        whereConditions.push('p.chambre = ?');
        queryParams.push(chambreNum);
      }
    }

    // Filtre par budget (tranches de prix)
    const priceRange = searchParams.get('price');
    if (priceRange) {
      switch (priceRange) {
        case '1': // moins de 200.000 fr
          whereConditions.push('p.prix_vente < 200000');
          break;
        case '2': // 200.000 - 1.500.000 fr
          whereConditions.push('p.prix_vente BETWEEN 200000 AND 1500000');
          break;
        case '3': // 1.500.000 - 50.000.000 fr
          whereConditions.push('p.prix_vente BETWEEN 1500000 AND 50000000');
          break;
        case '4': // 50.000.000 - 200.000.000 fr
          whereConditions.push('p.prix_vente BETWEEN 50000000 AND 200000000');
          break;
        case '5': // Au delà de 200.000.000 fr
          whereConditions.push('p.prix_vente >= 200000000');
          break;
      }
    }

    // Déterminer l'ordre de tri
    const trie = searchParams.get('trie');
    let orderBy = 'p.created_at DESC'; // Par défaut : plus récents
    
    switch (trie) {
      case '1': // Prix croissant
        orderBy = 'p.prix_vente ASC';
        break;
      case '2': // Prix décroissant
        orderBy = 'p.prix_vente DESC';
        break;
      case '3': // Plus récentes
        orderBy = 'p.created_at DESC';
        break;
      case '4': // Plus anciennes
        orderBy = 'p.created_at ASC';
        break;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Compter le total
    const countQuery = `SELECT COUNT(*) as total FROM produits p ${whereClause}`;
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...queryParams) as any[];
    const total = Number(countResult[0].total);

    // Récupérer les biens
    const biensQuery = `
      SELECT p.*, c.nom as categorie_nom, c.code as categorie_code
      FROM produits p
      LEFT JOIN categories c ON p.code_categorie = c.code
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    
    const biens = await prisma.$queryRawUnsafe(
      biensQuery,
      ...queryParams,
      perPage,
      offset
    ) as any[];

    // Récupérer les quartiers et communes pour tous les biens
    const quartierIds = [...new Set(biens.map((b: any) => b.id_quartier).filter(Boolean))];
    let quartiersData: any[] = [];
    let communesData: any[] = [];
    
    if (quartierIds.length > 0) {
      const quartierIdsStr = quartierIds.map(id => `'${id}'`).join(',');
      quartiersData = await prisma.$queryRawUnsafe(`
        SELECT q.id, q.nom, q.id_commune, c.nom as commune_nom, c.id as commune_id
        FROM quartiers q
        LEFT JOIN communes c ON q.id_commune = c.id
        WHERE q.id IN (${quartierIdsStr})
      `) as any[];
    }

    // Formater les biens avec leurs données
    const biensFormatted = biens.map((bien: any) => {
      const quartierData = quartiersData.find((q: any) => Number(q.id) === bien.id_quartier);
      
      return {
        code: bien.code,
        nom: bien.nom,
        description: bien.description,
        prix_vente: bien.prix_vente ? Number(bien.prix_vente) : 0,
        surface: bien.surface || 0,
        piece: bien.piece || 0,
        chambre: bien.chambre || 0,
        type_annonce: bien.type_annonce,
        code_categorie: bien.code_categorie,
        image: bien.image,
        created_at: bien.created_at,
        updated_at: bien.updated_at,
        categorie: bien.categorie_nom ? {
          code: bien.categorie_code,
          nom: bien.categorie_nom,
        } : null,
        quartier: quartierData ? {
          id: Number(quartierData.id),
          nom: quartierData.nom,
        } : null,
        commune: quartierData ? {
          id: Number(quartierData.commune_id),
          nom: quartierData.commune_nom,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        data: biensFormatted,
        current_page: page,
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total,
      },
    });
  } catch (error) {
    console.error('Erreur API biens:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

