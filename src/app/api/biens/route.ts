import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = 12;
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * perPage;

    // Construire les conditions de recherche
    const where: any = {};
    
    if (search) {
      where.OR = [
        { titre: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (searchParams.get('categorie_id')) {
      where.categorie_id = BigInt(searchParams.get('categorie_id')!);
    }

    if (searchParams.get('quartier_id')) {
      where.quartier_id = BigInt(searchParams.get('quartier_id')!);
    }

    if (searchParams.get('prix_min')) {
      where.prix = { ...where.prix, gte: parseFloat(searchParams.get('prix_min')!) };
    }

    if (searchParams.get('prix_max')) {
      where.prix = { ...where.prix, lte: parseFloat(searchParams.get('prix_max')!) };
    }

    // Récupérer les biens avec leurs relations
    const [biens, total] = await Promise.all([
      prisma.produits.findMany({
        where,
        include: {
          categorie: true,
          sous_categorie: true,
          type_annonce: true,
          quartier: {
            include: {
              commune: {
                include: {
                  ville: true,
                },
              },
            },
          },
          images: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.produits.count({ where }),
    ]);

    // Convertir BigInt en Number pour JSON
    const biensFormatted = biens.map((bien) => ({
      ...bien,
      id: Number(bien.id),
      prix: Number(bien.prix),
      surface: bien.surface ? Number(bien.surface) : null,
      categorie_id: Number(bien.categorie_id),
      sous_categorie_id: bien.sous_categorie_id ? Number(bien.sous_categorie_id) : null,
      type_annonce_id: Number(bien.type_annonce_id),
      quartier_id: Number(bien.quartier_id),
      user_id: Number(bien.user_id),
      categorie: bien.categorie ? { ...bien.categorie, id: Number(bien.categorie.id) } : null,
      sous_categorie: bien.sous_categorie ? { ...bien.sous_categorie, id: Number(bien.sous_categorie.id) } : null,
      type_annonce: { ...bien.type_annonce, id: Number(bien.type_annonce.id) },
      quartier: {
        ...bien.quartier,
        id: Number(bien.quartier.id),
        commune: {
          ...bien.quartier.commune,
          id: Number(bien.quartier.commune.id),
          ville: {
            ...bien.quartier.commune.ville,
            id: Number(bien.quartier.commune.ville.id),
          },
        },
      },
      images: bien.images.map((img) => ({ ...img, id: Number(img.id), produit_id: Number(img.produit_id) })),
      user: { ...bien.user, id: Number(bien.user.id) },
    }));

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

