import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth-utils';
import { serializeBigInt } from '@/lib/bigint-serializer';

// GET - Récupérer les données de référence pour les prix
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
    const type = searchParams.get('type');

    switch (type) {
      case 'quartiers':
        const quartiers = await prisma.quartiers.findMany({
          include: {
            commune: true
          },
          orderBy: { nom: 'asc' }
        });
        return NextResponse.json(serializeBigInt({
          success: true,
          data: quartiers.map(q => ({
            id: q.id,
            nom: q.nom,
            commune: q.commune.nom,
            commune_id: q.commune.id
          }))
        }));

      case 'categories':
        const categories = await prisma.categories.findMany({
          orderBy: { nom: 'asc' }
        });
        return NextResponse.json({
          success: true,
          data: categories.map(c => ({
            code: c.code,
            nom: c.nom
          }))
        });

      case 'souscategories':
        const categorieCode = searchParams.get('categorie');
        if (!categorieCode) {
          return NextResponse.json(
            { error: 'Le code de catégorie est requis' },
            { status: 400 }
          );
        }

        const souscategories = await prisma.souscategories.findMany({
          where: { code_cat: categorieCode },
          orderBy: { nom: 'asc' }
        });
        return NextResponse.json({
          success: true,
          data: souscategories.map(sc => ({
            code: sc.code,
            nom: sc.nom
          }))
        });

      case 'all':
        // Récupérer toutes les données de référence en une fois
        const [quartiersAll, categoriesAll] = await Promise.all([
          prisma.quartiers.findMany({
            include: {
              commune: true
            },
            orderBy: { nom: 'asc' }
          }),
          prisma.categories.findMany({
            orderBy: { nom: 'asc' }
          })
        ]);

        return NextResponse.json(serializeBigInt({
          success: true,
          data: {
            quartiers: quartiersAll.map(q => ({
              id: q.id,
              nom: q.nom,
              commune: q.commune.nom,
              commune_id: q.commune.id
            })),
            categories: categoriesAll.map(c => ({
              code: c.code,
              nom: c.nom
            }))
          }
        }));

      default:
        return NextResponse.json(
          { error: 'Type de données non spécifié' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des données de référence:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
