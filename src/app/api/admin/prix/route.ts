import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET - Récupérer tous les prix avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const quartierId = searchParams.get('quartier_id');
    const categorie = searchParams.get('categorie');
    const sousCategorie = searchParams.get('sous_categorie');

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};
    
    if (search) {
      where.OR = [
        { quartier: { nom: { contains: search, mode: 'insensitive' } } },
        { categorie: { nom: { contains: search, mode: 'insensitive' } } },
        { souscategorie: { nom: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (quartierId) {
      where.id_quartier = parseInt(quartierId);
    }

    if (categorie) {
      where.code_categorie = categorie;
    }

    if (sousCategorie) {
      where.code_sous_categorie = sousCategorie;
    }

    // Ajouter un filtre pour exclure les prix sans quartier valide
    const whereWithQuartier = {
      ...where,
      quartier: {
        isNot: null
      }
    };

    // Récupérer les prix avec relations
    const [prix, total] = await Promise.all([
      prisma.prix.findMany({
        where: whereWithQuartier,
        include: {
          quartier: {
            include: {
              commune: true
            }
          },
          categorie: true,
          souscategorie: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.prix.count({ where: whereWithQuartier })
    ]);

    // Calculer les statistiques uniquement sur les prix avec quartiers valides
    const stats = await prisma.prix.aggregate({
      where: whereWithQuartier,
      _count: { id: true },
      _avg: {
        prix_moy_location: true,
        prix_moy_vente: true
      }
    });

    // Convertir tous les BigInt en nombres
    return NextResponse.json(serializeBigInt({
      success: true,
      data: prix,
      pagination: {
        current_page: page,
        per_page: limit,
        total: total,
        last_page: Math.ceil(total / limit)
      },
      stats: {
        total_prix: stats._count.id,
        prix_moyen_location: Math.round(Number(stats._avg.prix_moy_location) || 0),
        prix_moyen_vente: Math.round(Number(stats._avg.prix_moy_vente) || 0)
      }
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau prix
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id_quartier,
      code_categorie,
      code_sous_categorie,
      prix_min_location,
      prix_moy_location,
      prix_max_location,
      prix_min_vente,
      prix_moy_vente,
      prix_max_vente
    } = body;

    // Validation
    if (!id_quartier || !code_categorie) {
      return NextResponse.json(
        { error: 'Le quartier et la catégorie sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si le prix existe déjà pour cette combinaison
    const existingPrix = await prisma.prix.findFirst({
      where: {
        id_quartier: parseInt(id_quartier),
        code_categorie,
        code_sous_categorie: code_sous_categorie || null
      }
    });

    if (existingPrix) {
      return NextResponse.json(
        { error: 'Un prix existe déjà pour cette combinaison quartier/catégorie/sous-catégorie' },
        { status: 400 }
      );
    }

    // Créer le prix
    const nouveauPrix = await prisma.prix.create({
      data: {
        id_quartier: parseInt(id_quartier),
        code_categorie,
        code_sous_categorie: code_sous_categorie || null,
        prix_min_location: prix_min_location ? parseInt(prix_min_location) : null,
        prix_moy_location: prix_moy_location ? parseInt(prix_moy_location) : null,
        prix_max_location: prix_max_location ? parseInt(prix_max_location) : null,
        prix_min_vente: prix_min_vente ? parseInt(prix_min_vente) : null,
        prix_moy_vente: prix_moy_vente ? parseInt(prix_moy_vente) : null,
        prix_max_vente: prix_max_vente ? parseInt(prix_max_vente) : null
      },
      include: {
        quartier: {
          include: {
            commune: true
          }
        },
        categorie: true,
        souscategorie: true
      }
    });

    return NextResponse.json(serializeBigInt({
      success: true,
      data: nouveauPrix,
      message: 'Prix créé avec succès'
    }));

  } catch (error) {
    console.error('Erreur lors de la création du prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du prix' },
      { status: 500 }
    );
  }
}
